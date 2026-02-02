<script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { useDocentesStore } from "@/stores/docentes.store";
  import DocenteForm from "@/components/docentes/DocenteForm.vue";

  const router = useRouter();
  const store = useDocentesStore();

  const error = ref("");

  async function submit(payload) {
    error.value = "";

    try {
      await store.add(payload);
      router.push("/docentes");
    } catch (e) {
      error.value = e?.message || "Erro ao criar docente";
    }
  }

  function goBack() {
    router.push("/docentes");
  }
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6 bg-gray-50">
    <div class="w-full max-w-4xl space-y-9">

    <DocenteForm
      :loading="store.loading"
      @submit="submit"
      @cancel="goBack"
    />
  </div>
  </main>
</template>
