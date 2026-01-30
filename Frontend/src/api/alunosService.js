import { http } from "./http"; // ajusta path

export async function fetchAlunos({ page = 1, pageSize = 10, filters = {} } = {}) {
  const res = await http.get("/alunos", {
    params: { page, limit: pageSize, ...filters },
  });

  const body = res.data ?? {};

  // tenta vários nomes comuns para o array
  const itemsCandidate =
    body.items ??
    body.docentes ??
    body.data ??
    body.results ??
    body.rows ??
    [];

  const items = Array.isArray(itemsCandidate) ? itemsCandidate : [];

  const total = Number(
    body.total ?? body.count ?? body.totalItems ?? items.length
  );

   return {
    items: body.items ?? [],
    total: body.total ?? 0,
    page: body.page ?? page,
    totalPages: Number(body.totalPages) || 1,
    pageSize: body.limit ?? pageSize,
  };
}
