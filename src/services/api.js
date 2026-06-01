import axios from "axios";

// API-instans med base URL från environment variable, standard localhost:7050/api
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:5010/api",
});

console.log("API URL:", import.meta.env.VITE_API_URL);

// Interceptor - lägger till auth-token automatiskt på alla requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("catfinder_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
