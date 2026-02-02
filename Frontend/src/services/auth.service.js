import { getHttp } from "@/api";

export async function loginRequest({ email, senha, tipo }) {
  const http = getHttp();
  const res = await http.post("/auth/login", { email, senha, tipo });

  const token = res?.data?.token;
  const user = res?.data?.user;

  if (!token) throw new Error("Resposta inválida: token em falta");
  if (!user) throw new Error("Resposta inválida: user em falta");

  return { token, user };
}

export async function logoutRequest() {
  const http = getHttp();
  // A implementar
  
}
