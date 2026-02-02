<script setup>
import { useRouter } from "vue-router";
import { useAlunosStore } from "@/stores/alunos.store";
import AlunoForm from "@/components/alunos/AlunoForm.vue";

const router = useRouter();
const store = useAlunosStore();

async function submit(payload) {
  await store.add(payload);
  router.push("/alunos");
}
</script>

<template>
  <section class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-semibold mb-4">Criar Aluno</h1>
    <AlunoForm :loading="store.loading" @submit="submit" @cancel="router.back()" />
  </section>
</template>
