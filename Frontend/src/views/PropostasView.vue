<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { getPropostas } from "../api/propostasService";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import { authStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { http } from "../api/http";
import { PlusIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
function verProposta(p) {
  router.push({ name: 'PropostaDetalhe', params: { id: p._id } });
}
const loading = ref(false);
const error = ref("");

const propostas = ref([]);
const total = ref(0);
const totalPages = ref(1);

const page = ref(1);
const pageSize = ref(10);

const filters = reactive({
  titulo: "",
  autor: "",
  orientador: "",
});

const userId = authStore.user?.value?.id;

const canPrev = computed(() => page.value > 1);
const canNext = computed(() => page.value < totalPages.value);


const propostaParaApagar = ref(null);
const showDeleteModal = ref(false);

function pedirConfirmacaoRemocao(p) {
  propostaParaApagar.value = p;
  showDeleteModal.value = true;
}

async function confirmarRemocao() {
  if (!propostaParaApagar.value) return;

  try {
    await http.delete(`/propostas/${propostaParaApagar.value._id}`);
    propostas.value = propostas.value.filter(p => p._id !== propostaParaApagar.value._id);
  } catch (e) {
    console.log(e);
    error.value = "Erro ao eliminar proposta";
  } finally {
    showDeleteModal.value = false;
    propostaParaApagar.value = null;
  }
}

async function load() {
  loading.value = true;
  error.value = "";

  try {
    const result = await getPropostas({
      page: page.value,
      pageSize: pageSize.value,
      filters: {
        titulo: filters.titulo,
        autor: filters.autor,
        orientador: filters.orientador,
      },
    });

    propostas.value = result.items;
    total.value = result.total;
    totalPages.value = result.totalPages;

    if (page.value > totalPages.value) {
      page.value = totalPages.value;
    }
  } catch (e) {
    error.value = e?.message || "Erro ao carregar propostas";
  } finally {
    loading.value = false;
  }
}


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

watch(pageSize, async () => {
  page.value = 1;
  await load();
});

let debounceId = null;
watch(
  () => ({ ...filters }),
  () => {
    page.value = 1;
    if (debounceId) clearTimeout(debounceId);
    debounceId = setTimeout(() => load(), 300);
  }
);
function isOrientador(proposta) {
  return String(proposta.orientador?._id) === String(userId);
}

function isCoorientador(proposta) {
  return proposta.coorientadores?.some(c => String(c._id) === String(userId));
}

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
     <button
  @click="router.push({ name: 'PropostaNova' })"
  class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
>
  <PlusIcon class="w-5 h-5" />
  Nova Proposta
</button>
    </div>

    <!-- filtros -->
    <div class="bg-white rounded shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm font-medium mb-1">Título</label>
          <input v-model.trim="filters.titulo" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por título" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Autor</label>
          <input v-model.trim="filters.autor" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por autor" />
        </div>

        <div>
          <label class="block text-sm font-medium mb-1">Orientador</label>
          <input v-model.trim="filters.orientador" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por orientador" />
        </div>
      </div>
    </div>

    <p v-if="error" class="text-red-700 mb-3">{{ error }}</p>

    <div class="space-y-4">
      <div
  v-for="p in propostas"
  :key="p._id"
  class="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
>
  <div class="flex flex-col sm:flex-row justify-between gap-2">
    <div>
      <h3 class="text-lg font-semibold text-gray-900">
        {{ p.titulo ?? "—" }}
        <span
          v-if="isCoorientador(p)"
          class="ml-2 inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full"
        >
          Coorientador
        </span>
      </h3>
      <p class="text-sm text-gray-700">
        <span class="font-medium">Orientador:</span> {{ p.orientador?.nome ?? "—" }}
      </p>
    </div>

    <div class="flex gap-2 items-center">
      <button class="p-1 rounded hover:bg-gray-100" title="Visualizar" @click="verProposta(p)">
        <EyeIcon class="w-5 h-5 text-gray-600" />
      </button>

      <!-- Só mostrar botões se for o ORIENTADOR -->
      <template v-if="isOrientador(p)">
        <button class="p-1 rounded hover:bg-gray-100" 
        title="Editar"
        @click="router.push({name:'PropostaEditarView', params: { id: p._id } });"

        >
          <PencilIcon class="w-5 h-5 text-gray-600" />
        </button>
        <button class="p-1 rounded hover:bg-gray-100" 
        title="Eliminar"
        @click="pedirConfirmacaoRemocao(p)">
          <TrashIcon class="w-5 h-5 text-gray-600" />
        </button>
      </template>
    </div>
  </div>
</div>


      <div
        v-if="(propostas?.length ?? 0) === 0"
        class="text-center text-gray-600 text-sm italic"
      >
        Sem propostas para mostrar.
      </div>
    </div>

    <!-- paginação -->
    <div class="flex items-center justify-between mt-4">
      <div class="text-sm text-gray-700">
        <span>Total Propostas: {{ total }}</span>
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
  <div   
  v-if="showDeleteModal"
  class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
>
  <div class="bg-white rounded-xl shadow p-6 w-full max-w-md text-center">
    <p class="text-lg font-semibold mb-4">Eliminar proposta</p>
    <p class="text-gray-700 mb-6">
      Tem a certeza que pretende eliminar a proposta
      <strong>{{ propostaParaApagar?.titulo }}</strong>?
    </p>

    <div class="flex justify-center gap-4">
      <button
        class="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
        @click="showDeleteModal = false"
      >
        Cancelar
      </button>
      <button
        class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        @click="confirmarRemocao"
      >
        Eliminar
      </button>
    </div>
  </div>
</div>

</template>