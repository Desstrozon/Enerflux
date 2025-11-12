// src/lib/api.ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Ej.: VITE_API_BASE_URL = "http://localhost:8000/api"
export const API_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

function buildUrl(path: string) {
  return path.startsWith("/") ? `${API_URL}${path}` : `${API_URL}/${path}`;
}

// 👉 Headers para peticiones normales (JSON)
export function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

/**
 * Peticiones HTTP genéricas.
 * Ahora soporta también FormData (archivos/imágenes).
 */
async function request<T>(
  method: HttpMethod,
  path: string,
  body?: any,
  isFormData = false
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};

  // ✅ solo aplicamos Content-Type si NO es FormData
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  headers["Accept"] = "application/json";

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    const err: any = new Error(msg);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Métodos específicos
export const apiGet = <T,>(path: string) => request<T>("GET", path);

export const apiPost = <T,>(path: string, d?: any, isFormData = false) =>
  request<T>("POST", path, d, isFormData);
export const apiPut = <T,>(path: string, d?: any, isFormData = false) =>
  request<T>("PUT", path, d, isFormData);

export const apiPatch = <T,>(path: string, d?: any) =>
  request<T>("PATCH", path, d);

export const apiDelete = <T,>(path: string) => request<T>("DELETE", path);

// Objeto de conveniencia
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
