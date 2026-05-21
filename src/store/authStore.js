import { create } from "zustand";

const storedUser = localStorage.getItem("catfinder_user");

// useAuthStore - Zustand state för autentisering och användardata
export const useAuthStore = create((set) => ({
  token: localStorage.getItem("catfinder_token"),
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: Boolean(localStorage.getItem("catfinder_token")),

  // Lagra token och användare, uppdatera isAuthenticated
  setAuth: ({ token, user }) => {
    localStorage.setItem("catfinder_token", token);
    localStorage.setItem("catfinder_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  // Radera token och logga ut användaren
  logout: () => {
    localStorage.removeItem("catfinder_token");
    localStorage.removeItem("catfinder_user");
    set({ 
      token: null, 
      user: null, isAuthenticated: false,
    });
  },
}));
