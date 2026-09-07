"use client";

import { useEffect, useState } from "react";
import { api } from "./api";

export function useCategoryColors(): Record<string, string> {
  const [colors, setColors] = useState<Record<string, string>>({});

  useEffect(() => {
    api.listCategories().then((cats) => {
      const map: Record<string, string> = {};
      for (const c of cats) map[c.name] = c.color;
      setColors(map);
    });
  }, []);

  return colors;
}
