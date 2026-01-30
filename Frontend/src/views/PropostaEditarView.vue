<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { http } from "../api/http";
import { getPropostaById, updateProposta } from "../api/propostasService";
import PropostaForm from "../components/PropostaForm.vue";

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id);

const proposta = ref({
  titulo: "",
  descricao_objetivos: "",
  orientador: "",
  coorientadores: [],
  alunos: [],
  palavras_chave: [],
  status: "publica",
});

const docentes = ref([]);
const alunos = ref([]);
const loading = ref(false);
const error = ref("");

const showSuccessModal = ref(false);
let t = null;

function asArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

onMounted(async () => {
  loading.value = true;
  try {
    const [p, d1, d2] = await Promise.all([
      getPropostaById(id.value),
      http.get("/docentes?all=true"),
      http.get("/alunos?all=true"),
    ]);

    // Preenche (suporta populate ou ids diretos)
    proposta.value = {
      titulo: p?.titulo ?? "",
      descricao_objetivos: p?.descricao_objetivos ?? "",
      orientador: p?.orientador?._id ?? p?.orientador ?? "",
      coorientadores: Array.isArray(p?.coorientadores)
        ? p.coorientadores.map(x => x?._id ?? x).filter(Boolean)
        : [],
      alunos: Array.isArray(p?.alunos)
        ? p.alunos.map(x => x?._id ?? x).filter(Boolean)
        : [],
      palavras_chave: Array.isArray(p?.palavras_chave) ? p.palavras_chave : [],
      status: p?.status ?? "publica",
    };

    docentes.value = asArray(d1.data);
    alunos.value = asArray(d2.data);
  } catch (e) {
    error.value = e?.response?.data?.message || "Erro ao carregar proposta.";
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => {
  if (t) clearTimeout(t);
});

async function onSubmit() {
  error.value = "";
  loading.value = true;

  try {
    const payload = {
      titulo: proposta.value.titulo,
      descricao_objetivos: proposta.value.descricao_objetivos,
      coorientadores: proposta.value.coorientadores,
      alunos: proposta.value.alunos,
      palavras_chave: proposta.value.palavras_chave,
      status: proposta.value.status,
    };

    await updateProposta(id.value, payload);

    showSuccessModal.value = true;
    t = setTimeout(() => {
      showSuccessModal.value = false;
      router.push({ name: "propostas" });
    }, 3000);
  } catch (e) {
    error.value = e?.response?.data?.message || "Erro ao atualizar proposta.";
  } finally {
    loading.value = false;
  }
}

function onCancel() {
  router.back();
}
</script>

<template>
  <div>
    <p v-if="error" class="max-w-3xl mx-auto mt-4 text-red-600">{{ error }}</p>

    <PropostaForm
      v-model="proposta"
      :docentes="docentes"
      :alunos="alunos"
      :loading="loading || showSuccessModal"
      title="Editar Proposta"
      submit-label="Guardar Alterações"
      @submit="onSubmit"
      @cancel="onCancel"
    />

    <!-- Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 class="text-lg font-semibold mb-2">Sucesso</h2>
        <p class="text-gray-700">Proposta atualizada com sucesso.</p>
        <p class="text-sm text-gray-500 mt-3">A redirecionar para a listagem...</p>
      </div>
    </div>
  </div>
</template>
