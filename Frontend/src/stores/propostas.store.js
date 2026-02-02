import { defineStore } from "pinia";
import { fetchPropostas, fetchPropostaById, updateProposta, deleteProposta, createProposta } from "@/api/propostas.api";

let debounceId = null;
const DEBOUNCE_MS = 300;

export const usePropostasStore = defineStore("propostas", {
  state: () => ({
    items: [],
    loading: false,
    error: "",

    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,

    filters: {
      titulo: "",
      palavras_chave: "",
      orientador: "",
    },
  }),

  getters: {
    canPrev: (s) => s.page > 1,
    canNext: (s) => s.page < s.totalPages,
  },

  actions: {
    async load() {
      this.loading = true;
      this.error = "";

      try {
        const res = await fetchPropostas({
          page: this.page,
          pageSize: this.pageSize,
          filters: this.filters,
        });

        this.items = res.items;
        this.total = res.total;
        this.totalPages = res.totalPages;
      } catch (e) {
        this.error = e?.message || "Erro ao carregar propostas";
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      await createProposta(payload);
      await this.load();
    },
    async fetchOne(id) {
        return await fetchPropostaById(id);
    },
    async update(id, payload) {
        await updateProposta(id, payload);
        await this.load(); 
    },

    scheduleLoad() {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        this.page = 1;
        this.load();
      }, DEBOUNCE_MS);
    },

    async remove(id) {
      await deleteProposta(id);
      await this.load();
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
