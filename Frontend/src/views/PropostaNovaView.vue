<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { http } from "../api/http";
import { authStore } from "../stores/authStore";
import { createProposta } from "../api/propostasService";
import PropostaForm from "../components/PropostaForm.vue";

const router = useRouter();
const userId = computed(() => authStore.user.value?.id || authStore.user.value?._id || "");

const proposta = ref({
  titulo: "",
  descricao_objetivos: "",
  orientador: "",
  coorientadores: [],
  alunos: [],
  palavras_chave: [],
  status: "publica",
});

watch(userId, (id) => {
  proposta.value.orientador = id;
}, { immediate: true });

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
  try {
    const [d1, d2] = await Promise.all([
      http.get("/docentes?all=true"),
      http.get("/alunos?all=true"),
    ]);
    docentes.value = asArray(d1.data);
    alunos.value = asArray(d2.data);
  } catch (e) {
    console.error(e);
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
      orientador: proposta.value.orientador,
      coorientadores: proposta.value.coorientadores,
      alunos: proposta.value.alunos,
      palavras_chave: proposta.value.palavras_chave,
      status: proposta.value.status,
    };

    await createProposta(payload);

    showSuccessModal.value = true;
    t = setTimeout(() => {
      showSuccessModal.value = false;
      router.push({ name: "propostas" });
    }, 3000);
  } catch (e) {
    error.value = e?.response?.data?.message || "Erro ao criar proposta.";
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
      title="Nova Proposta"
      submit-label="Criar Proposta"
      :readonly-orientador-nome="authStore.user.value?.nome || ''"
      @submit="onSubmit"
      @cancel="onCancel"
    />

    <!-- Modal -->
    <div v-if="showSuccessModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 class="text-lg font-semibold mb-2">Sucesso</h2>
        <p class="text-gray-700">Proposta criada com sucesso.</p>
        <p class="text-sm text-gray-500 mt-3">A redirecionar para a listagem...</p>
      </div>
    </div>
  </div>
</template>
