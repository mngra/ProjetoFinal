<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDocentesStore } from "@/stores/docentes.store";
import DocenteForm from "@/components/docentes/DocenteForm.vue";

const route = useRoute();
const router = useRouter();
const store = useDocentesStore();

const docente = ref(null);
const error = ref("");

const id = route.params.id;

/* carregar docente */
onMounted(async () => {
  try {
    // tenta obter da lista (mais rápido)
    docente.value =
      store.items.find((d) => d.id === id || d._id === id) ?? null;

    // fallback: carregar individualmente
    if (!docente.value) {
      const res = await store.fetchOne(id); // vamos criar já a seguir
      docente.value = res;
    }
  } catch (e) {
    error.value = e.message || "Erro ao carregar docente";
  }
});

async function submit(payload) {
  try {
    await store.update(id, payload);
    router.push("/docentes");
  } catch (e) {
    error.value = e.message || "Erro ao guardar";
  }
}

function goBack() {
  router.push("/docentes");
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6 mt-20">
    <h1 class="text-2xl font-semibold mb-4">
      Editar Docente
    </h1>

    <p v-if="error" class="text-red-600 mb-4">
      {{ error }}
    </p>

    <div v-if="!docente" class="text-gray-500">
      A carregar…
    </div>

    <DocenteForm
      v-else
      :docente="docente"
      :loading="store.loading"
      @submit="submit"
      @cancel="goBack"
    />
  </section>
</template>
