import { defineStore } from "pinia";
import { fetchDocentes,
  createDocente,
  updateDocente,
  deleteDocente,fetchDocenteById } from "@/api/docentes.api";

let debounceTimer = null;
const DEBOUNCE_MS = 400;

export const useDocentesStore = defineStore("docentes", {
  state: () => ({
    items: [],
    loading: false,
    error: "",

    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,

    filters: {
      nome: "",
      email: "",
      departamento: "",
    },
  }),

  getters: {
    docentes: (s) => s.items,
    canPrev: (s) => s.page > 1,
    canNext: (s) => s.page < s.totalPages,
  },

  actions: {
    async load() {
      this.loading = true;
      this.error = "";

      try {
        const res = await fetchDocentes({
          page: this.page,
          pageSize: this.pageSize,
          filters: this.filters,
        });

        if (res?.items) {
          this.items = res.items;
          this.total = res.total;
          this.totalPages = res.totalPages;
        } else {
          this.items = Array.isArray(res) ? res : [];
          this.total = this.items.length;
          this.totalPages = 1;
        }
      } catch (e) {
        this.error = e?.message || "Erro ao carregar docentes";
      } finally {
        this.loading = false;
      }
    },
    async add(payload) {
      try {
        await createDocente(payload);
        await this.load();
      } catch (e) {
        this.error = e.message;
      }
    },

    async update(id, payload) {
      try {
        await updateDocente(id, payload);
        await this.load();
      } catch (e) {
        this.error = e.message;
      }
    },

    async remove(id) {
      try {
        await deleteDocente(id);
        await this.load();
      } catch (e) {
        this.error = e.message;
      }
    },
    async fetchOne(id) {
      return await fetchDocenteById(id);
    },

    /* debounce para filtros */
    scheduleLoad() {
      if (debounceTimer) clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        this.page = 1; // reset page ao filtrar
        this.load();
      }, DEBOUNCE_MS);
    },

    next() {
      if (this.canNext) {
        this.page++;
        this.load();
      }
    },

    prev() {
      if (this.canPrev) {
        this.page--;
        this.load();
      }
    },

    setPageSize(size) {
      this.pageSize = size;
      this.page = 1;
      this.load();
    },
  },
});
