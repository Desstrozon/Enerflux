// src/lib/api.ts

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// URL base de la API
// 1º intenta usar VITE_API_BASE_URL
// 2º si no existe, usa un fallback según entorno
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.MODE === "production"
    ? "https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/api"
    : "http://127.0.0.1:8000/api");

// Construye la URL final
function buildUrl(path: string) {
  return path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
}

// Request genérico
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: any,
  isFormData = false
): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  headers["Accept"] = "application/json";

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "omit", // siempre Bearer, sin cookies
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // puede no ser JSON; en ese caso data se queda en null
  }

  if (!res.ok) {
    const err: any = new Error(data?.message || `Error ${res.status}`);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data as T;
}

// Helpers públicos
export const apiGet = <T,>(path: string) =>
  request<T>("GET", path);

export const apiPost = <T,>(path: string, d?: any, isFormData = false) =>
  request<T>("POST", path, d, isFormData);

export const apiPut = <T,>(path: string, d?: any, isFormData = false) =>
  request<T>("PUT", path, d, isFormData);

export const apiPatch = <T,>(path: string, d?: any) =>
  request<T>("PATCH", path, d);

export const apiDelete = <T,>(path: string) =>
  request<T>("DELETE", path);

// Para casos en los que solo quieres headers
export function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

// Objeto API "legacy" por si en algún sitio lo usas así
export const API = {
  url: API_URL,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  authHeaders,
};

export default API;
