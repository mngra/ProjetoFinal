// api/propostasService.js
import { http } from "./http";

export async function getPropostas({ page = 1, pageSize = 10, filters = {} } = {}) {
  const res = await http.get("/propostas", {
    params: {
      page,
      limit: pageSize,
      ...filters,
    },
  });
  

  const body = res.data ?? {};

  // Compatível com a estrutura do backend
  const propostas = Array.isArray(body.items)
    ? body.items
    : body.propostas ?? [];

  return {
    items: propostas,
    total: body.total ?? propostas.length,
    page: body.page ?? page,
    totalPages: body.totalPages ?? 1,
    limit: body.limit ?? pageSize,
  };
}

export async function createProposta(payload) {
  try {
    const { data } = await http.post("/propostas", payload);
    return data;
  } catch (e) {
    throw new Error(e?.response?.data?.message || "Erro ao criar proposta");
  }
}

export async function getPropostaById(id) {
  const { data } = await http.get(`/propostas/${id}`);
  return data;
}

export async function updateProposta(id, payload) {
  const { data } = await http.put(`/propostas/${id}`, payload);
  return data;
}

