<script setup>
  import { onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useAlunosStore } from "@/stores/alunos.store";
  import AlunoForm from "@/components/alunos/AlunoForm.vue";

  const route = useRoute();
  const router = useRouter();
  const store = useAlunosStore();

  onMounted(() => store.fetchOne(route.params.id));

  async function submit(payload) {
    await store.update(route.params.id, payload);
    router.push("/alunos");
  }
</script>

<template>
  <section class="max-w-3xl mx-auto p-6 mt-20">
    <h1 class="text-2xl font-semibold mb-4">Editar Aluno</h1>

    <AlunoForm
      v-if="store.current"
      :aluno="store.current"
      :loading="store.loading"
      @submit="submit"
      @cancel="router.back()"
    />
  </section>
</template>
