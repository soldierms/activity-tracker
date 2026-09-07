from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Category, User
from app.schemas import CategoryCreate, CategoryOut, CategoryUpdate

router = APIRouter(prefix="/categories", tags=["categories"])

DUPLICATE_NAME_ERROR = "A category with that name already exists"


def name_taken(db: Session, user_id: str, name: str, exclude_id: str | None = None) -> bool:
    query = db.query(Category).filter(
        Category.user_id == user_id,
        func.lower(Category.name) == name.strip().lower(),
    )
    if exclude_id:
        query = query.filter(Category.id != exclude_id)
    return db.query(query.exists()).scalar()


@router.get("", response_model=list[CategoryOut])
def list_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Category)
        .filter(Category.user_id == current_user.id)
        .order_by(Category.created_at.asc())
        .all()
    )


@router.post("", response_model=CategoryOut, status_code=201)
def create_category(
    payload: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if name_taken(db, current_user.id, payload.name):
        raise HTTPException(status_code=400, detail=DUPLICATE_NAME_ERROR)

    category = Category(**payload.model_dump(), user_id=current_user.id)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=DUPLICATE_NAME_ERROR)
    db.refresh(category)
    return category


@router.patch("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: str,
    payload: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.get(Category, category_id)
    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Category not found")

    updates = payload.model_dump(exclude_unset=True)
    if "name" in updates and name_taken(db, current_user.id, updates["name"], exclude_id=category.id):
        raise HTTPException(status_code=400, detail=DUPLICATE_NAME_ERROR)

    for field, value in updates.items():
        setattr(category, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=DUPLICATE_NAME_ERROR)
    db.refresh(category)
    return category


@router.delete("/{category_id}", status_code=204)
def delete_category(
    category_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    category = db.get(Category, category_id)
    if not category or category.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Category not found")

    remaining = db.query(Category).filter(Category.user_id == current_user.id).count()
    if remaining <= 1:
        raise HTTPException(status_code=400, detail="You must keep at least one category")

    db.delete(category)
    db.commit()
