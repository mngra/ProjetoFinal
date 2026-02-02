<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ArrowPathIcon, EyeIcon, PencilIcon, TrashIcon, PlusIcon } from "@heroicons/vue/24/outline";
import { usePropostasStore } from "@/stores/propostas.store";
import { useAuth } from "@/composables/useAuth";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";

const router = useRouter();
const store = usePropostasStore();
const { user } = useAuth();

/* estado local */
const propostaParaApagar = ref(null);
const showDeleteModal = ref(false);


/* computed */
const propostas = computed(() => store.items ?? []);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

const page = computed(() => store.page);
const total = computed(() => store.total);
const totalPages = computed(() => store.totalPages);
const canPrev = computed(() => store.canPrev);
const canNext = computed(() => store.canNext);

const filters = store.filters;

const pageSize = computed({
  get: () => store.pageSize,
  set: (v) => store.setPageSize(v),
});

/* helpers */
function verProposta(p) {
  router.push({ name: "PropostaDetalhe", params: { id: p._id } });
}

function isOrientador(p) {
  return String(p.orientador?._id) === String(user.value?.id);
}

function isCoorientador(p) {
  return p.coorientadores?.some(c => String(c._id) === String(user.value?.id));
}

/* delete */
function pedirConfirmacaoRemocao(p) {
  propostaParaApagar.value = p;
  showDeleteModal.value = true;
}

async function confirmarRemocao() {
  if (!propostaParaApagar.value) return;
  await store.remove(propostaParaApagar.value._id);
  showDeleteModal.value = false;
  propostaParaApagar.value = null;
}

/* watchers */
watch(
  () => ({ ...filters }),
  () => store.scheduleLoad(),
  { deep: true }
);

onMounted(store.load);
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
          @click="store.load"
          title="Recarregar"
        ><ArrowPathIcon class="w-5 h-5" />
        </button>
      </div>

      <button
        @click="router.push({ name: 'PropostaNova' })"
        class="flex border rounded px-3 py-1 hover:bg-gray-300 disabled:opacity-50"
      >
        
        Nova Proposta
      </button>
    </div>

    <!-- filtros -->
    <div class="bg-white rounded shadow p-4 mb-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
        <label class="block text-sm font-medium mb-1">Título</label>
        <input v-model.trim="filters.titulo" placeholder="Título" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
        <label class="block text-sm font-medium mb-1">Orientador</label>
        <input v-model.trim="filters.orientador" placeholder="Orientador" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
        <label class="block text-sm font-medium mb-1">Palavras Chave</label>
        <input v-model.trim="filters.palavras_chave" placeholder="Palavras Chave" class="w-full border rounded px-3 py-2" />
        </div>
      </div>
    </div>

    <p v-if="error" class="text-red-700 mb-3">{{ error }}</p>

    <div class="space-y-4">
      <div
        v-for="p in propostas"
        :key="p._id"
        class="bg-white border rounded-xl p-4"
      >
        <div class="flex justify-between">
          <div>
            <h3 class="font-semibold">
              {{ p?.titulo ?? "-" }}
              <span v-if="isCoorientador(p)" class="ml-2 text-xs bg-blue-200 px-2 rounded">
                Coorientador
              </span>
              <span v-if="isOrientador(p)" class="ml-2 text-xs bg-green-300 px-2 rounded">
                Orientador
              </span>
            </h3>
            <p class="text-sm">
              <b>Orientador:</b> {{ p?.orientador?.nome ?? "-" }}
            </p>
          </div>

          <div class="flex gap-2">
            <button @click="verProposta(p)">
              <EyeIcon class="w-5 h-5" />
            </button>

            <template v-if="isOrientador(p)">
              <button @click="router.push({ name:'PropostaEditarView', params:{ id:p._id } })">
                <PencilIcon class="w-5 h-5" />
              </button>
              <button @click="pedirConfirmacaoRemocao(p)">
                <TrashIcon class="w-5 h-5" />
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- paginação -->
    <div class="flex justify-between mt-4">
       <div class="text-sm text-gray-700">
        <span>Total Propostas: {{ total }}</span>
        <span class="ml-3">Página {{ page }} / {{ totalPages }}</span>
      </div>
      <div class="flex gap-2">
        <button class="border rounded px-3 py-1 hover:bg-gray-300  disabled:opacity-50" :disabled="!canPrev" @click="store.prev">Anterior</button>
        <button class="border rounded px-3 py-1 hover:bg-gray-300 disabled:opacity-50" :disabled="!canNext" @click="store.next">Seguinte</button>
      </div>
    </div>
  </section>

  <ConfirmModal
  :open="showDeleteModal"
  title="Eliminar proposta"
  :message="`Tem a certeza que pretende eliminar a proposta '${propostaParaApagar?.titulo ?? ''}'?`"
  confirm-text="Eliminar"
  cancel-text="Cancelar"
  @confirm="confirmarRemocao"
  @cancel="showDeleteModal = false"
/>
</template>
