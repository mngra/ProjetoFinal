import { getHttp } from "@/api";
export async function fetchAlunos({ page = 1, pageSize = 10, ...filters } = {}) {
  const http = getHttp();
  const res = await http.get("/alunos", {
    params: {
      page,
      limit: pageSize,
      ...filters,
    },
  });
  return res.data;
}

export async function fetchAlunoById(id) {
  const http = getHttp();
  const res = await http.get(`/alunos/${id}`);
  return res.data;
}

export async function createAluno(payload) {
  const http = getHttp();
  const res = await http.post("/alunos", payload);
  return res.data;
}

export async function updateAluno(id, payload) {
  const http = getHttp();
  const res = await http.put(`/alunos/${id}`, payload);
  return res.data;
}

export async function deleteAluno(id) {
  const http = getHttp();
  await http.delete(`/alunos/${id}`);
}
