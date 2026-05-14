import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("catfinder_token"));
  const [user, setUser] = useState(null);
  const isAuthenticated = Boolean(token);
  async function login(credentials) {
    const response = await authService.login(credentials);
    localStorage.setItem("catfinder_token", response.token);
    setToken(response.token); setUser(response.user ?? null);
  }
  function logout() { localStorage.removeItem("catfinder_token"); setToken(null); setUser(null); }
  return <AuthContext.Provider value={{ token, user, isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const c = useContext(AuthContext); if (!c) throw new Error("useAuth must be used inside AuthProvider"); return c; }
