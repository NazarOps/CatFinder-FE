import { api } from "./api";

// authService - hantering av login och registration
export const authService = {
  async login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post("/auth/forgot-password", {
      email,
    });
    return data;
  },

  async resetPassword(payload) {
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  },

};
