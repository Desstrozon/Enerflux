// src/lib/api.ts
// Este archivo es solo un WRAPPER para mantener compatibilidad
// Todo se redirige internamente a http.ts

import {
  apiGet as get,
  apiPostJson as postJson,
} from "./http";

// URL base unificada
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/api";

// GET
export const apiGet = <T,>(path: string) => get<T>(path);

// POST (JSON)
export const apiPost = <T,>(path: string, data?: any) =>
  postJson<T>(path, data);

// Compatibilidad con llamadas antiguas
export const API = {
  url: API_URL,
  get: apiGet,
  post: apiPost,
};

export default API;
