const API_BASE =
  import.meta.env.MODE === "production"
    ? `${window.location.origin}/index.php/api`
    : (import.meta.env.VITE_API_BASE_URL ||
       "http://127.0.0.1:8000/api");

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
    let msg = data?.message || `Error ${res.status}`;

    if (data?.errors) {
      try {
        const flat = Object.values(data.errors).flat().join(" ");
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

// ==== Helpers públicos ====

// POST JSON
export async function apiPostJson<T = any>(
  path: string,
  body: any
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    credentials: "omit", // sin cookies, usamos Bearer
  });
  return handleJson(res);
}

// GET genérico
export async function apiGet<T = any>(path: string): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "omit",
  });
  return handleJson(res);
}