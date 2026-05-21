import { create } from "zustand";

const stored = localStorage.getItem("catfinder_catmode") === "true";

export const useCatModeStore = create((set) => ({
  catMode: stored,
  toggle: () =>
    set((s) => {
      const next = !s.catMode;
      localStorage.setItem("catfinder_catmode", String(next));
      return { catMode: next };
    }),
}));
