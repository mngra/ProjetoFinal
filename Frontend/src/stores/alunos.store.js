import { defineStore } from "pinia";
import {
  fetchAlunos,
  fetchAlunoById,
  createAluno,
  updateAluno,
  deleteAluno,
} from "@/api/alunos.api";

let debounceId = null;
const DEBOUNCE_MS = 400;

export const useAlunosStore = defineStore("alunos", {
  state: () => ({
    alunos: [],
    current: null,
    loading: false,
    error: "",

    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,

    filters: {
      nome: "",
      email: "",
      numero_estudante: "",
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
        const res = await fetchAlunos({
          page: this.page,
          limit: this.pageSize,                 
          nome: this.filters.nome,              
          email: this.filters.email,
          numero_estudante: this.filters.numero_estudante,
        });

        
        this.alunos = res.items ?? [];
        this.total = res.total ?? 0;
        this.totalPages = res.totalPages ?? 1;

      } catch (e) {
        this.error = e?.message || "Erro ao carregar alunos";
      } finally {
        this.loading = false;
      }
    },

    scheduleLoad() {
      if (debounceId) clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        this.page = 1;
        this.load();
      }, DEBOUNCE_MS);
    },

    async fetchOne(id) {
      this.current = await fetchAlunoById(id);
      return this.current;
    },

    async add(payload) {
      await createAluno(payload);
      await this.load();
    },

    async update(id, payload) {
      await updateAluno(id, payload);
      await this.load();
    },

    async remove(id) {
      await deleteAluno(id);
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
