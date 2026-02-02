<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  proposta: { type: Object, required: true },
  docentes: { type: Array, default: () => [] },
  alunos: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  submitLabel: { type: String, default: "Guardar" },
  title: { type: String, default: "Proposta" },
  readonlyOrientadorNome: { type: String, default: "" },
});

const emit = defineEmits(["submit", "cancel"]);

const coorientadoresSearch = ref("");
const alunosSearch = ref("");
const palavraChaveInput = ref("");

// Computed para listas filtradas
const docentesFiltrados = computed(() => {
  const term = coorientadoresSearch.value.toLowerCase();
  return props.docentes.filter((d) =>
    (d?.nome || "").toLowerCase().includes(term)
  );
});

const alunosFiltrados = computed(() => {
  const term = alunosSearch.value.toLowerCase();
  return props.alunos.filter((a) =>
    (a?.nome || "").toLowerCase().includes(term)
  );
});

function adicionarPalavraChave() {
  const p = palavraChaveInput.value.trim();
  if (p && !props.proposta.palavras_chave.includes(p)) {
    props.proposta.palavras_chave.push(p);
  }
  palavraChaveInput.value = "";
}

function removerPalavraChave(i) {
  props.proposta.palavras_chave.splice(i, 1);
}

function toggleStatus() {
  props.proposta.status =
    props.proposta.status === "publica" ? "privada" : "publica";
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-semibold mb-4">{{ title }}</h1>

    <form @submit.prevent="emit('submit')" class="space-y-5">
      <!-- título -->
      <div>
        <label class="block font-medium mb-1">Título *</label>
        <input
          v-model="proposta.titulo"
          class="w-full border rounded px-3 py-2"
          required
          :disabled="loading"
        />
      </div>

      <!-- descrição -->
      <div>
        <label class="block font-medium mb-1">Descrição / Objetivos *</label>
        <textarea
          v-model="proposta.descricao_objetivos"
          class="w-full border rounded px-3 py-2"
          rows="4"
          required
          :disabled="loading"
        ></textarea>
      </div>

      <!-- orientador (opcional / read-only) -->
      <div v-if="readonlyOrientadorNome">
        <label class="block font-medium mb-1">Orientador</label>
        <input
          type="text"
          :value="readonlyOrientadorNome"
          class="w-full border rounded px-3 py-2 bg-gray-100"
          readonly
        />
      </div>

      <!-- coorientadores -->
      <div>
        <label class="block font-medium mb-1">Coorientadores</label>
        <input
          v-model="coorientadoresSearch"
          class="w-full border rounded px-3 py-2 mb-1"
          placeholder="Pesquisar coorientadores..."
          :disabled="loading"
        />
        <div class="border rounded max-h-40 overflow-y-auto">
          <label
            v-for="d in docentesFiltrados"
            :key="d._id"
            class="flex items-center gap-2 px-3 py-1 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="d._id"
              v-model="proposta.coorientadores"
              :disabled="loading"
            />
            <span>{{ d.nome }}</span>
          </label>
        </div>
      </div>

      <!-- alunos -->
      <div>
        <label class="block font-medium mb-1">Alunos</label>
        <input
          v-model="alunosSearch"
          class="w-full border rounded px-3 py-2 mb-1"
          placeholder="Pesquisar alunos..."
          :disabled="loading"
        />
        <div class="border rounded max-h-40 overflow-y-auto">
          <label
            v-for="a in alunosFiltrados"
            :key="a._id"
            class="flex items-center gap-2 px-3 py-1 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              :value="a._id"
              v-model="proposta.alunos"
              :disabled="loading"
            />
            <span>{{ a.nome }}</span>
          </label>
        </div>
      </div>

      <!-- palavras-chave -->
      <div>
        <label class="block font-medium mb-1">Palavras-chave</label>
        <div class="flex gap-2 mb-2">
          <input
            v-model="palavraChaveInput"
            class="flex-1 border rounded px-3 py-2"
            placeholder="Nova palavra"
            :disabled="loading"
          />
          <button
            type="button"
            @click="adicionarPalavraChave"
            class="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
            :disabled="loading"
          >
            Adicionar
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="(p, i) in proposta.palavras_chave"
            :key="i"
            class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
          >
            {{ p }}
            <button
              type="button"
              @click="removerPalavraChave(i)"
              class="ml-1 text-red-600 hover:text-red-800"
              :disabled="loading"
            >
              ×
            </button>
          </span>
        </div>
      </div>

      <!-- status toggle -->
      <div class="flex items-center gap-3">
        <span class="font-medium">Pública</span>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            class="sr-only"
            :checked="proposta.status === 'publica'"
            @change="toggleStatus"
            :disabled="loading"
          />
          <div class="w-11 h-6 bg-gray-200 rounded-full">
            <div
              class="w-5 h-5 bg-white rounded-full shadow transform transition"
              :class="proposta.status === 'publica' ? 'translate-x-6' : 'translate-x-1'"
            ></div>
          </div>
        </label>
        <span class="font-medium">Privada</span>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <button
          type="button"
          @click="emit('cancel')"
          class="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          :disabled="loading"
        >
          {{ submitLabel }}
        </button>
      </div>
    </form>
  </section>
</template>
