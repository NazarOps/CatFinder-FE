import { create } from "zustand";

const TOKEN_KEY = "catfinder_token";
const USER_KEY = "catfinder_user";
const EXPIRES_AT_KEY = "catfinder_expires_at";

let logoutTimerId = null;

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
}

function clearLogoutTimer() {
  if (logoutTimerId) {
    window.clearTimeout(logoutTimerId);
    logoutTimerId = null;
  }
}

function parseExpiresAt(value) {
  if (!value) return null;

  const expiresAt = new Date(value);
  if (Number.isNaN(expiresAt.getTime())) {
    return null;
  }

  return expiresAt.toISOString();
}

function isExpired(expiresAt) {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}

function getStoredSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const storedUser = localStorage.getItem(USER_KEY);
  const expiresAt = parseExpiresAt(localStorage.getItem(EXPIRES_AT_KEY));

  if (!token || !storedUser || !expiresAt || isExpired(expiresAt)) {
    clearStoredAuth();
    return {
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
    };
  }

  try {
    return {
      token,
      user: JSON.parse(storedUser),
      expiresAt,
      isAuthenticated: true,
    };
  } catch {
    clearStoredAuth();
    return {
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
    };
  }
}

function scheduleLogout(expiresAt, logout) {
  clearLogoutTimer();

  if (!expiresAt) {
    logout();
    return;
  }

  const msUntilExpiry = new Date(expiresAt).getTime() - Date.now();

  if (msUntilExpiry <= 0) {
    logout();
    return;
  }

  logoutTimerId = window.setTimeout(() => {
    logout();
  }, msUntilExpiry);
}

const initialSession = getStoredSession();

// useAuthStore - Zustand state for authentication and session expiry
export const useAuthStore = create((set, get) => ({
  token: initialSession.token,
  user: initialSession.user,
  expiresAt: initialSession.expiresAt,
  isAuthenticated: initialSession.isAuthenticated,

  initializeAuth: () => {
    const session = getStoredSession();

    set({
      token: session.token,
      user: session.user,
      expiresAt: session.expiresAt,
      isAuthenticated: session.isAuthenticated,
    });

    if (session.isAuthenticated) {
      scheduleLogout(session.expiresAt, get().logout);
    } else {
      clearLogoutTimer();
    }
  },

  setAuth: ({ token, user, expiresAt }) => {
    const normalizedExpiresAt = parseExpiresAt(expiresAt);

    if (!token || !user || !normalizedExpiresAt || isExpired(normalizedExpiresAt)) {
      get().logout();
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_AT_KEY, normalizedExpiresAt);

    set({
      token,
      user,
      expiresAt: normalizedExpiresAt,
      isAuthenticated: true,
    });

    scheduleLogout(normalizedExpiresAt, get().logout);
  },

  logout: () => {
    clearLogoutTimer();
    clearStoredAuth();

    set({
      token: null,
      user: null,
      expiresAt: null,
      isAuthenticated: false,
    });
  },
}));

if (initialSession.isAuthenticated) {
  scheduleLogout(initialSession.expiresAt, () => useAuthStore.getState().logout());
}
