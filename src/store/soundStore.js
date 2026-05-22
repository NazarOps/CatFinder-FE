import { create } from "zustand";

const stored = localStorage.getItem("catfinder_sound") !== "false";

export const useSoundStore = create((set) => ({
  soundEnabled: stored,
  toggle: () =>
    set((s) => {
      const next = !s.soundEnabled;
      localStorage.setItem("catfinder_sound", String(next));
      return { soundEnabled: next };
    }),
}));
