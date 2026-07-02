import axios from "axios";

const devApiTarget = import.meta.env.VITE_DEV_API_TARGET || "http://localhost:5051";
const devApiUrl = "/api";
const apiBaseUrl = import.meta.env.DEV
  ? devApiUrl
  : (import.meta.env.VITE_API_URL || devApiTarget);

export function resolveBackendAssetUrl(assetUrl) {
  if (!assetUrl) return null;
  if (/^(blob:|data:)/i.test(assetUrl)) return assetUrl;

  if (import.meta.env.DEV) {
    const backendOrigin = new URL(devApiTarget, window.location.origin).origin;

    if (/^https?:/i.test(assetUrl)) {
      const parsedUrl = new URL(assetUrl);
      if (parsedUrl.origin === backendOrigin) {
        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
      }
      return assetUrl;
    }

    if (assetUrl.startsWith("/")) {
      return assetUrl;
    }

    const parsedUrl = new URL(assetUrl, backendOrigin);
    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  }

  if (/^https?:/i.test(assetUrl)) return assetUrl;

  const apiOrigin = new URL(apiBaseUrl, window.location.origin).origin;
  return new URL(assetUrl, apiOrigin).href;
}

export const api = axios.create({
  baseURL: apiBaseUrl,
});

console.log("API URL:", apiBaseUrl);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("catfinder_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
