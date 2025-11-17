const API = import.meta.env.VITE_API_BASE_URL;

export function getToken() {
  return localStorage.getItem("token") || "";
}
export function setToken(token) {
  localStorage.setItem("token", token);
}
export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Error de login");
  }
  const data = await res.json();
  setToken(data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  return data;
}

export async function logout() {
  const token = getToken();
  if (!token) return;
  await fetch(`${API}/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
  clearToken();
}

export async function me() {
  const token = getToken();
  const res = await fetch(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("No autenticado");
  return res.json();
}
