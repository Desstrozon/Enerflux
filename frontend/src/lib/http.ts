// src/lib/http.ts
export const API = import.meta.env.VITE_API_BASE_URL as string;

export function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** 🔹 Extrae un mensaje legible del body de error (JSON o texto) */
export async function readErrorBody(res: Response): Promise<string> {
  try {
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j: any = await res.json().catch(() => null);
      if (j && typeof j === "object") {
        return (
          j.message ||
          j.error ||
          (Array.isArray(j.errors) && j.errors[0]) ||
          JSON.stringify(j)
        );
      }
    }
    const t = await res.text().catch(() => "");
    return t || `${res.status} ${res.statusText}`;
  } catch {
    return `${res.status} ${res.statusText}`;
  }
}

/** 🔹 Lanza Error con mensaje limpio si la respuesta no es OK */
async function ensureOk(res: Response) {
  if (!res.ok) {
    throw new Error(await readErrorBody(res));
  }
  return res;
}

/** GET (JSON) */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
    credentials: "omit",
  });
  await ensureOk(res);
  return res.json();
}

/** POST JSON */
export async function apiPostJson<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });
  await ensureOk(res);
  return res.json();
}

/** POST FormData (multipart) */
export async function apiPostForm<T>(url: string, formData: FormData): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
      // ❗ NO pongas Content-Type con FormData (el navegador añade el boundary)
    },
    body: formData,
    credentials: "omit",
  });
  await ensureOk(res);
  return res.json();
}

/** PUT JSON */
export async function apiPutJson<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(`${API}${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "omit",
  });
  await ensureOk(res);
  return res.json();
}

/** DELETE */
export async function apiDelete(url: string): Promise<void> {
  const res = await fetch(`${API}${url}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      ...authHeaders(),
    },
    credentials: "omit",
  });
  await ensureOk(res);
}
