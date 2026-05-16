import { create } from "zustand";

// useAuthStore - Zustand state för autentisering och användardata
export const useAuthStore = create((set) => ({
  token: localStorage.getItem("catfinder_token"),
  user: null,
  isAuthenticated: Boolean(localStorage.getItem("catfinder_token")),

  // Lagra token och användare, uppdatera isAuthenticated
  setAuth: ({ token, user }) => {
    localStorage.setItem("catfinder_token", token);
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  // Radera token och logga ut användaren
  logout: () => {
    localStorage.removeItem("catfinder_token");
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));