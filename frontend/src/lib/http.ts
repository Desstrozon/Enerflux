// src/lib/http.ts

// ==== BASE URL ====
// 1º usa VITE_API_BASE_URL (la que tengas en Azure)
// 2º si no existe, en prod: origin + "/index.php/api"
// 3º en dev: 127.0.0.1:8000/api
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? `${window.location.origin}/index.php/api`
    : "http://127.0.0.1:8000/api");

// Normaliza URL
function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}


// Manejo común de respuestas JSON
async function handleJson(res: Response) {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // no es JSON, lo dejamos en null
  }

  if (!res.ok) {
    let msg = data?.message || `Error ${res.status}`;

    if (data?.errors) {
      try {
        const flat = (Object.values(data.errors) as any[])
          .flat()
          .join(" ");
        if (flat) msg = flat;
      } catch {}
    }

    const err: any = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}

// ========= HELPERS =========

// GET (con Bearer si existe)
export async function apiGet<T = any>(path: string): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(buildUrl(path), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "omit",
  });
  return handleJson(res);
}

// POST JSON
export async function apiPostJson<T = any>(
  path: string,
  body: any
): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handleJson(res);
}

// PUT JSON
export async function apiPutJson<T = any>(
  path: string,
  body: any
): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    credentials: "omit",
  });
  return handleJson(res);
}

// DELETE
export async function apiDelete<T = any>(path: string): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(buildUrl(path), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "omit",
  });
  return handleJson(res);
}
