// src/api/authService.js
import { http } from "./http";
import { authStore } from "../stores/authStore";

export async function loginRequest({ email, senha, tipo }) {
  const res = await http.post("/auth/login", { email, senha, tipo });

  // axios devolve { data, status, ... }
  const token = res?.data?.token;
  const user = res?.data?.user;

  if (!token) throw new Error("Resposta inválida: token em falta");
  if (!user) throw new Error("Resposta inválida: user em falta");

  authStore.setSession(token, user);
  return user;
}

export function logoutRequest() {
  authStore.clearSession();
}
