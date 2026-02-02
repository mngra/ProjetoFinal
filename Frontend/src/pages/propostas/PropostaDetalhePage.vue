<template>
  <section class="max-w-6xl mx-auto p-6 pt-3">
    

    <div class="bg-white rounded-xl shadow p-6">
      <div v-if="loading" class="text-gray-500">A carregar...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>
      <div v-else>
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          {{ proposta?.titulo || '—' }}
        </h1>

        <div class="space-y-3 text-gray-800">
          <p><span class="font-medium text-gray-600">Objetivos:</span> {{ proposta?.descricao_objetivos  }}</p>
          <p><span class="font-medium text-gray-600">Status:</span> {{ proposta?.status }}</p>
          <p><span class="font-medium text-gray-600">Orientador:</span> {{ proposta?.orientador?.nome || '—' }}</p>
          <p><span class="font-medium text-gray-600">Palavras-chave:</span> {{ proposta?.palavras_chave?.join(', ') || '—' }}</p>

          <div v-if="proposta?.alunos?.length">
            <p class="font-medium text-gray-600">Alunos:</p>
            <ul class="list-disc ml-6">
              <li v-for="a in proposta.alunos" :key="a._id">
                {{ a.nome }} ({{ a.numero_estudante }})
              </li>
            </ul>
          </div>

          <div v-if="proposta?.coorientadores?.length">
            <p class="font-medium text-gray-600">Coorientadores:</p>
            <ul class="list-disc ml-6">
              <li v-for="c in proposta.coorientadores" :key="c._id">{{ c.nome }}</li>
            </ul>
          </div>
        </div>

        <button @click="$router.back()" class="mt-6 px-4 py-2 border rounded hover:bg-gray-300 text-sm text-gray-700">
           Voltar
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { fetchPropostaById } from "@/api/propostas.api";

const route = useRoute();
const proposta = ref(null);
const error = ref("");
const id = route.params.id;
const loading = ref(true);

onMounted(async () => {
  try {
    proposta.value = await fetchPropostaById(id);
  } catch (e) {
    error.value = "Erro ao carregar proposta";
  } finally {
    loading.value = false; // 👈 importante
  }
});
</script>
