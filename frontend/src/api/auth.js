// src/lib/Auth.js

import { API_BASE, apiPostJson, apiGetAuth } from "@/lib/http";

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

// === LOGIN ===
export async function login(email, password) {
  const data = await apiPostJson("/login", { email, password });

  if (data?.token) setToken(data.token);
  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

// === LOGOUT ===
export async function logout() {
  const token = getToken();
  if (!token) return;

  try {
    await apiPostJson("/logout", {}); // usa el token automáticamente
  } catch {}

  clearToken();
}

// === /me (usuario autenticado) ===
export async function me() {
  const data = await apiGetAuth("/me");
  return data;
}
