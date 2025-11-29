// src/lib/http.ts

// URL base de la API (preferimos la de Azure si existe)
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.MODE === "production"
    ? "https://enerflux-h2dga2ajeda7cnb7.spaincentral-01.azurewebsites.net/api"
    : "http://127.0.0.1:8000/api");

// Cabeceras con Bearer si hay token
export function authHeaders(extra?: Record<string, string>) {
  const token = localStorage.getItem("token") || "";
  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

// Parseo unificado de respuestas JSON
async function handleJson(res: Response) {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // si no es JSON, data se queda en null
  }

  if (!res.ok) {
    const err: any = new Error(data?.message || "Error en la petición");
    err.status = res.status;
    err.details = data;
    err.errors = data?.errors;
    throw err;
  }

  return data;
}

// === GET genérico (con token si existe) ===
export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: authHeaders(),
    credentials: "omit", // siempre Bearer, sin cookies
  });

  return handleJson(res);
}

// === POST JSON (login, register, etc.) ===
export async function apiPostJson<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "omit",
  });

  return handleJson(res);
}

// === PUT JSON (perfil, etc.) opcional por si lo necesitas ===
export async function apiPutJson<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: {
      ...authHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "omit",
  });

  return handleJson(res);
}


