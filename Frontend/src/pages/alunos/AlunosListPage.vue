<script setup>
  import { onMounted, computed, watch, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useAlunosStore } from "@/stores/alunos.store";
  import { useAuth } from "@/composables/useAuth";
  import ConfirmModal from "@/components/ui/ConfirmModal.vue";
  import { ArrowPathIcon, PencilIcon, TrashIcon, PlusIcon } from "@heroicons/vue/24/outline";

  const { canManageAlunos } = useAuth();
  const store = useAlunosStore();
  const route = useRoute();
  const router = useRouter();

  const selectedAluno = ref(null);
  const showConfirm = ref(false);

  const alunos = computed(() => store.alunos);
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

  const load = () => store.load();
  const next = () => store.next();
  const prev = () => store.prev();

  onMounted(() => {
    const q = route.query;
    store.page = Number(q.page) || 1;
    store.pageSize = Number(q.pageSize) || store.pageSize;
    store.filters.nome = q.nome ?? "";
    store.filters.email = q.email ?? "";
    store.filters.numero_estudante = q.numero_estudante ?? "";
    store.load();
  });

  watch(
    () => ({ ...filters }),
    () => {
      store.scheduleLoad();
    },
    { deep: true }
  );

  function askDelete(aluno) {
    selectedAluno.value = aluno;
    showConfirm.value = true;
  }

  async function confirmDelete() {
    if (!selectedAluno.value) return;
    const id = selectedAluno.value.id ?? selectedAluno.value._id;
    await store.remove(id);
    showConfirm.value = false;
    selectedAluno.value = null;
  }

  function cancelDelete() {
    showConfirm.value = false;
    selectedAluno.value = null;
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
        >
          <ArrowPathIcon class="w-5 h-5" />
        </button>

        <button
          @click="router.push('/alunos/criar')"
          class="flex border rounded px-3 py-1 hover:bg-gray-300 disabled:opacity-50"
        >
          <PlusIcon class="w-4 h-4" />
          Novo Aluno
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
          <label class="block text-sm font-medium mb-1">Nº Estudante</label>
          <input v-model.trim="filters.numero_estudante" class="w-full border rounded px-3 py-2" placeholder="Pesquisar por número" />
        </div>
      </div>
    </div>

    <p v-if="error" class="text-red-700 mb-3">{{ error }}</p>

    <!-- lista -->
    <div class="bg-white rounded shadow overflow-hidden">
      <div v-if="loading" class="p-4">A carregar…</div>

      <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="a in alunos"
          :key="a._id ?? a.email"
          class="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-1"
        >
          <h3 class="text-lg font-semibold text-gray-900">{{ a.nome ?? "—" }}</h3>
          <p class="text-sm text-gray-700">
            <span class="font-medium">Email:</span> {{ a.email ?? "—" }}
          </p>
          <p class="text-sm text-gray-700">
            <span class="font-medium">Nº Estudante:</span> {{ a.numero_estudante ?? "—" }}
          </p>

          <div class="flex gap-2 mt-2">
            <button
              class="text-sm hover:underline"
              @click="router.push(`/alunos/${a.id ?? a._id}/editar`)"
            >
              <PencilIcon class="w-5 h-5" />
            </button>

            <button
              class="text-sm hover:underline"
              @click="askDelete(a)"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          v-if="(alunos?.length ?? 0) === 0"
          class="col-span-full text-gray-600 text-sm italic"
        >
          Sem alunos para mostrar.
        </div>
      </div>
    </div>

    <!-- paginação -->
    <div class="flex items-center justify-between mt-4">
      <div class="text-sm text-gray-700">
        <span>Total Alunos: {{ total }}</span>
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
      title="Eliminar aluno"
      :message="`Tens a certeza que queres eliminar o aluno '${selectedAluno?.nome}'?`"
      confirm-text="Eliminar"
      cancel-text="Cancelar"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>