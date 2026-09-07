"use client";

import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import CategoryForm from "@/components/CategoryForm";
import { Category, ApiError, api } from "@/lib/api";
import { dotClass } from "@/lib/colors";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setCategories(await api.listCategories());
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setError(null);
    try {
      await api.deleteCategory(id);
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete category");
    }
  }

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Categories</h1>
          <button
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Category
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          These show up in the category dropdown when logging an activity.
        </p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          {loading && <p className="py-6 text-center text-sm text-slate-400 dark:text-slate-500">Loading...</p>}

          {!loading &&
            categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 px-4 py-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${dotClass(category.color)}`} />
                  <span className="text-sm font-medium capitalize text-slate-800 dark:text-slate-100">
                    {category.name}
                  </span>
                </div>
                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => {
                      setEditing(category);
                      setShowForm(true);
                    }}
                    className="text-slate-400 dark:text-slate-500 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>

        {showForm && (
          <CategoryForm
            initial={editing}
            onCancel={() => setShowForm(false)}
            onSaved={() => {
              setShowForm(false);
              refresh();
            }}
          />
        )}
      </main>
    </RequireAuth>
  );
}
