import { getHttp } from "@/api";

/* LOGIN DOCENTE */
export async function loginDocente({ email, password }) {
  const http = getHttp();
  const res = await http.post("/login", {
    email,
    password,
  });
  return res.data;
}

/* LOGIN ALUNO */
export async function loginAluno({ email, password }) {
  const http = getHttp();
  const res = await http.post("/login", {
    email,
    password,
  });
  return res.data;
}
