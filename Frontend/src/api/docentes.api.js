import { getHttp } from "@/api";

//Listar
export async function fetchDocentes({ page = 1, pageSize = 10, filters = {} } = {}) {
  const http = getHttp();
  const res = await http.get("/docentes", {
    params: {
      page,
      limit: pageSize,
      ...filters,
    },
  });
  return res.data;
}

/* CRIAR */
export async function createDocente(payload) {
  const http = getHttp();
  const res = await http.post("/docentes", payload);
  return res.data;
}

/* ATUALIZAR */
export async function updateDocente(id, payload) {
  const http = getHttp();
  const res = await http.put(`/docentes/${id}`, payload);
  return res.data;
}

/* APAGAR */
export async function deleteDocente(id, payload) {
  const http = getHttp();
  await http.delete(`/docentes/${id}`,payload);
}

export async function fetchDocenteById(id) {
  const http = getHttp();
  const res = await http.get(`/docentes/${id}`);
  return res.data;
}

