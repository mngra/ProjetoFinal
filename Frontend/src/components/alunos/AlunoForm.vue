<script setup>
import { reactive, watch, computed } from "vue";

const props = defineProps({
  aluno: { type: Object, default: null },
  loading: Boolean,
});

const emit = defineEmits(["submit", "cancel"]);

const form = reactive({
  nome: "",
  email: "",
  numero_estudante: "",
});

watch(
  () => props.aluno,
  (a) => {
    form.nome = a?.nome ?? "";
    form.email = a?.email ?? "";
    form.numero_estudante = a?.numero_estudante ?? "";
  },
  { immediate: true }
);

const isValid = computed(
  () => form.nome.trim() && form.email.trim() && form.numero_estudante.trim()
);

function submit() {
  if (!isValid.value || props.loading) return;
  emit("submit", { ...form });
}
</script>

<template>
  <form class="bg-white rounded-xl shadow p-6 space-y-4" @submit.prevent="submit">
    <input v-model="form.nome" placeholder="Nome" class="border rounded px-3 py-2 w-full" />
    <input v-model="form.email" type="email" placeholder="Email" class="border rounded px-3 py-2 w-full" />
    <input v-model="form.numero_estudante" placeholder="Número de Estudante" class="border rounded px-3 py-2 w-full" />

    <div class="flex justify-end gap-2 pt-4">
      <button type="button" class="border px-4 py-2 rounded" @click="$emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </div>
  </form>
</template>
