import { getHttp } from "@/api";

export async function fetchPropostas({ page, pageSize, filters }) {
  const http = getHttp();

  const res = await http.get("/propostas", {
    params: {
      page,
      limit: pageSize,
      ...filters,
    },
  });

  return res.data;
}

export async function createProposta(payload) {
  const http = getHttp();
  const res = await http.post("/propostas", payload);
  return res.data;
}

export async function deleteProposta(id) {
  const http = getHttp();
  await http.delete(`/propostas/${id}`);
}

export async function fetchPropostaById(id) {
  const http = getHttp();
  const res = await http.get(`/propostas/${id}`);
  return res.data;
}

export async function updateProposta(id, payload) {
  const http = getHttp();
  const res = await http.put(`/propostas/${id}`, payload);
  return res.data;
}
