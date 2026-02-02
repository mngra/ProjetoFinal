<script setup>
import { onMounted, computed, watch, ref} from "vue";
import { useDocentesStore } from "@/stores/docentes.store";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import { ArrowPathIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline';


const { canManageDocentes } = useAuth();

const store = useDocentesStore();
const route = useRoute();
const router = useRouter();

const selectedDocente = ref(null);

const showConfirm = ref(false);


const docentes = computed(() => store.docentes);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const page = computed(() => store.page);
const total = computed(() => store.total);
const totalPages = computed(() => store.totalPages);

const canPrev = computed(() => store.canPrev);
const canNext = computed(() => store.canNext);

const filters = store.filters; // reativo (Pinia)
const pageSize = computed({
  get: () => store.pageSize,
  set: (v) => store.setPageSize(v),
});

const load = () => store.load();
const next = () => store.next();
const prev = () => store.prev();

onMounted(() => {
  const q = route.query;

  store.page = Number(q.page) || 1;
  store.pageSize = Number(q.pageSize) || store.pageSize;

  store.filters.nome = q.nome ?? "";
  store.filters.email = q.email ?? "";
  store.filters.departamento = q.departamento ?? "";

  store.load();
});

watch(
  () => ({ ...filters }),
  () => {
    store.scheduleLoad();
  },
  { deep: true }
);




function askDelete(docente) {
  selectedDocente.value = docente;
  showConfirm.value = true;
}


async function confirmDelete() {
  if (!selectedDocente.value) return;

  const id = selectedDocente.value.id ?? selectedDocente.value._id;

  await store.remove(id);      
  showConfirm.value = false;
  selectedDocente.value = null;
}


function cancelDelete() {
  showConfirm.value = false;
  selectedDocente.value = null;
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-6 pt-20">
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
          class="border rounded px-3 pt-2 py-1 hover:bg-gray-50 disabled:opacity-50"
          :disabled="loading"
          @click="load"
          title="Recarregar"
        ><ArrowPathIcon class="w-5 h-5" />
        </button>
        <button
        v-if="canManageDocentes"
        @click=""
        class="flex border rounded px-3 py-1 hover:bg-gray-300 disabled:opacity-50">
        Novo Docente
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
    <div  class="flex gap-2 mt-2">
  <button
  v-if="canManageDocentes"
    class="text-sm  hover:underline"
    @click="router.push(`/docentes/${d.id ?? d._id}/editar`)"
  >
    <PencilIcon class="w-5 h-5" />
  </button>

  <button
  v-if="canManageDocentes"
    class="text-sm  hover:underline"
    @click="askDelete(d)"
  >
      <TrashIcon class="w-5 h-5" />

  </button>
</div>
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
    <ConfirmModal
  :open="showConfirm"
  title="Eliminar docente"
  :message="`Tens a certeza que queres eliminar o docente '${selectedDocente?.nome}'?`"
  confirm-text="Eliminar"
  cancel-text="Cancelar"
  @confirm="confirmDelete"
  @cancel="cancelDelete"
/>

  </section>
</template>
