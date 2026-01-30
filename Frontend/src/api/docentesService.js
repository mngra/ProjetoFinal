import { http } from "./http";

export async function fetchDocentes({ page = 1, pageSize = 10, filters = {} } = {}) {
  const res = await http.get("/docentes", {
    params: { page, limit: pageSize, ...filters },
  });

  const body = res.data ?? {};

  const itemsCandidate =
    body.items ??
    body.docentes ??
    body.data ??
    body.results ??
    body.rows ??
    [];

  const items = Array.isArray(itemsCandidate) ? itemsCandidate : [];

  const total = Number(body.total ?? body.count ?? body.totalItems ?? items.length);

  const normalizedPage = Number(body.page ?? page);
  const normalizedPageSize = Number(body.limit ?? body.pageSize ?? pageSize);

  const totalPages =
    Number(body.totalPages) ||
    (normalizedPageSize > 0 ? Math.max(1, Math.ceil(total / normalizedPageSize)) : 1);

  return {
    items,
    total,
    page: normalizedPage,
    totalPages,
    pageSize: normalizedPageSize,
  };
}
