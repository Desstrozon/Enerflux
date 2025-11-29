// src/lib/http.ts

// 1) Resolver la base de la API
// - Si hay VITE_API_BASE_URL, usamos esa SIEMPRE
// - Si no, en dev usamos 127.0.0.1:8000/api
// - En prod, usamos window.location.origin + "/api"
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? `${window.location.origin}/api`
    : "http://127.0.0.1:8000/api");

export { API_BASE };

async function handleJson(res: Response) {
  const text = await res.text();
  let data: any = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    // si no es JSON, lo dejamos en null
  }

  if (!res.ok) {
    //  Mensaje más útil que “Error en la petición”
    let msg = data?.message || `Error ${res.status}`;

    // Si vienen errores de validación, los aplanamos
    if (data?.errors) {
      try {
        const flat = Object.values(data.errors)
          .flat()
          .join(" ");
        if (flat) msg = flat;
      } catch {
        // si falla, ignoramos
      }
    }

    const err: any = new Error(msg);
    err.status = res.status;
    err.details = data;
    throw err;
  }

  return data;
}

// ==== Helpers públicos ====

// POST JSON
export async function apiPostJson<T = any>(
  path: string,
  body: any
): Promise<T> {
  const res = await fetch(
    path.startsWith("http") ? path : `${API_BASE}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      credentials: "omit", // sin cookies, usamos Bearer
    }
  );
  return handleJson(res);
}

// GET (genérico, por si lo quieres usar)
export async function apiGet<T = any>(path: string): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(
    path.startsWith("http") ? path : `${API_BASE}${path}`,
    {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "omit",
    }
  );
  return handleJson(res);
}
