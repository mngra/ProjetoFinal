<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { fetchDocentes } from "../api/docentesService";

const loading = ref(false);
const error = ref("");

const docentes = ref([]);         // items da página atual
const total = ref(0);
const totalPages = ref(1);

const page = ref(1);
const pageSize = ref(10);

// filtros por campo (a API tem de suportar estes params!)
const filters = reactive({
  nome: "",
  email: "",
  departamento: "",
});

const canPrev = computed(() => page.value > 1);
const canNext = computed(() => page.value < totalPages.value);

async function load() {
  loading.value = true;
  error.value = "";

  try {
    const result = await fetchDocentes({
      page: page.value,
      pageSize: pageSize.value,
      filters: {
        ...(filters.nome?.trim() ? { nome: filters.nome.trim() } : {}),
        ...(filters.email?.trim() ? { email: filters.email.trim() } : {}),
        ...(filters.departamento?.trim() ? { departamento: filters.departamento.trim() } : {}),
      },
    });

    docentes.value = result.items;
    total.value = result.total;
    totalPages.value = result.totalPages;

    // se por algum motivo a página ficou fora do range (após filtros)
    if (page.value > totalPages.value) page.value = totalPages.value;
  } catch (e) {
    error.value = e?.message || "Erro ao carregar docentes";
  } finally {
    loading.value = false;
  }
}

// paginação (não depender de watch para evitar conflitos)
async function prev() {
  if (!canPrev.value || loading.value) return;
  page.value -= 1;
  await load();
}

async function next() {
  if (!canNext.value || loading.value) return;
  page.value += 1;
  await load();
}

// mudar pageSize -> volta à página 1 e recarrega
watch(pageSize, async () => {
  page.value = 1;
  await load();
});

// filtros automáticos com debounce
let debounceId = null;
watch(
  () => ({ ...filters }),
  () => {
    page.value = 1;
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => load(), 300);
  }
);

onMounted(load);
</script>

<template>
  <section class="max-w-6xl mx-auto p-6 pt-3">
    <div class="flex items-center justify-end gap-4 mb-4">

      <div class="flex items-center gap-3">
        <label class="text-sm font-medium">Por página</label>
        <select v-model.number="pageSize" class="border rounded px-2 py-1">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>

        <button
          class="border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
          :disabled="loading"
          @click="load"
          title="Recarregar"
        >
          ↻
        </button>
      </div>
    </div>

    <!-- filtros -->
    <div class="bg-white rounded shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Nome</label>
          <input v-model.trim="filters.nome" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por nome" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model.trim="filters.email" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por email" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Departamento</label>
          <input v-model.trim="filters.departamento" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por departamento" />
        </div>
      </div>
    </div>

    <p v-if="error" class="text-red-700 mb-3">{{ error }}</p>

    <div class="bg-white rounded shadow overflow-hidden">
      <div v-if="loading" class="p-4">A carregar…</div>

      <!-- CARDS -->
<div v-if="loading" class="p-4">A carregar…</div>

<div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <div
    v-for="d in docentes"
    :key="d._id ?? d.email"
    class="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-1"
  >
    <h3 class="text-lg font-semibold text-gray-900">
      {{ d.nome ?? "—" }}
    </h3>
    <p class="text-sm text-gray-700">
      <span class="font-medium">Email:</span> {{ d.email ?? "—" }}
    </p>
    <p class="text-sm text-gray-700">
      <span class="font-medium">Departamento:</span> {{ d.departamento ?? "—" }}
    </p>
  </div>

  <div
    v-if="(docentes?.length ?? 0) === 0"
    class="col-span-full text-gray-600 text-sm italic"
  >
    Sem docentes para mostrar.
  </div>
</div>

    </div>

    <!-- paginação -->
    <div class="flex items-center justify-between mt-4">
      <div class="text-sm text-gray-700">
        <span>Total Docentes: {{ total }}</span>
        <span class="ml-3">Página {{ page }} / {{ totalPages }}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
          :disabled="loading || !canPrev"
          @click="prev"
        >
          Anterior
        </button>

        <button
          class="border rounded px-3 py-1 hover:bg-gray-50 disabled:opacity-50"
          :disabled="loading || !canNext"
          @click="next"
        >
          Seguinte
        </button>
      </div>
    </div>
  </section>
</template>
