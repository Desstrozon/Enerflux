// src/lib/http.ts

const API_BASE =
  import.meta.env.MODE === "production"
    ? import.meta.env.VITE_API_BASE_URL
    : "http://127.0.0.1:8000/api";

async function handleJson(res: Response) {
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const err: any = new Error(data?.message || "Error en la petición");
    err.status = res.status;
    err.details = data;
    err.errors = data?.errors;
    throw err;
  }

  return data;
}

export async function apiPostJson<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });
  return handleJson(res);
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const token = localStorage.getItem("token") || "";
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });
  return handleJson(res);
}

export { API_BASE };
