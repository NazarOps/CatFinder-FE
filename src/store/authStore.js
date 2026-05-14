import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("catfinder_token"),
  user: null,

  isAuthenticated: Boolean(localStorage.getItem("catfinder_token")),

  setAuth: ({ token, user }) => {
    localStorage.setItem("catfinder_token", token);

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("catfinder_token");

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));