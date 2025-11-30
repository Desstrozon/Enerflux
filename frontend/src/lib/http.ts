// src/lib/http.ts

// ==== BASE URL ====
// PROD: siempre {origin}/index.php/api  (Azure)
// DEV: VITE_API_BASE_URL o 127.0.0.1:8000/api
export const API_BASE =
  import.meta.env.MODE === "production"
    ? `${window.location.origin}/index.php/api`
    : (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api");

// (Opcional, pero muy útil ahora)
console.log("API_BASE = ", API_BASE);

// src/lib/http.ts

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  return apiPostJson<T>(path, body);
}

export const APP_BASE = API_BASE
  .replace(/\/api$/, "")        // quita el /api final
  .replace(/\/index\.php$/, "");

console.log("API_BASE =", API_BASE);
console.log("APP_BASE =", APP_BASE);

// POST FormData (subida de imágenes, etc.)
export async function apiPostForm<T = any>(
  path: string,
  body: FormData
): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // OJO: NO ponemos "Content-Type": el navegador añade el boundary
    },
    body,
    credentials: "omit",
  });
  return handleJson(res);
}


// Normaliza URL: admite paths con o sin barra inicial
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
      } catch { }
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
