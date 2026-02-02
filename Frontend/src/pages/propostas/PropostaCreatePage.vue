<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import {getHttp} from "@/api";import { usePropostasStore } from "@/stores/propostas.store";
import PropostaForm from "@/components/propostas/PropostaForm.vue";

const route = useRoute();
const router = useRouter();
const store = usePropostasStore();
const http = getHttp();

const id = computed(() => route.params.id);
const isNew = computed(() => !id.value);

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
    const fetches = [
      http.get("/docentes?all=true"),
      http.get("/alunos?all=true"),
    ];

    if (!isNew.value) {
      const propostaData = await store.fetchOne(id.value);
      proposta.value = {
        titulo: propostaData?.titulo ?? "",
        descricao_objetivos: propostaData?.descricao_objetivos ?? "",
        orientador: propostaData?.orientador?._id ?? propostaData?.orientador ?? "",
        coorientadores: Array.isArray(propostaData?.coorientadores)
          ? propostaData.coorientadores.map(x => x?._id ?? x).filter(Boolean)
          : [],
        alunos: Array.isArray(propostaData?.alunos)
          ? propostaData.alunos.map(x => x?._id ?? x).filter(Boolean)
          : [],
        palavras_chave: Array.isArray(propostaData?.palavras_chave) ? propostaData.palavras_chave : [],
        status: propostaData?.status ?? "publica",
      };
    }

    const [d1, d2] = await Promise.all(fetches);
    docentes.value = asArray(d1.data);
    alunos.value = asArray(d2.data);
  } catch (e) {
    error.value = e?.response?.data?.message || "Erro ao carregar dados.";
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
    if (isNew.value) {
      await store.create(proposta.value);
    } else {
      await store.update(id.value, proposta.value);
    }

    showSuccessModal.value = true;
    t = setTimeout(() => {
      showSuccessModal.value = false;
      router.push({ name: "propostas" });
    }, 3000);
  } catch (e) {
    error.value = e?.response?.data?.message || "Erro ao guardar proposta.";
  } finally {
    loading.value = false;
  }
}

function onCancel() {
  router.back();
}
</script>


<template>
  <main class="min-h-screen flex items-center justify-center px-6 bg-gray-50">
    <div class="w-full max-w-4xl space-y-9">
        <p v-if="error" class="max-w-3xl mx-auto mt-4 text-red-600">{{ error }}</p>

            <PropostaForm
            :proposta="proposta"
            :docentes="docentes"
            :alunos="alunos"
            :loading="loading || showSuccessModal"
            title="Nova Proposta"
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
</main>
  
</template>

