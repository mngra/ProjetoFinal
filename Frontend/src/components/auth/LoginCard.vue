<script setup>
import { ref } from "vue";
defineProps({
  error: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["submit-login"]);

const username = ref("");
const password = ref("");
const tipo = ref("docente"); // default


function submit() {
  emit("submit-login", {
    username: username.value.trim(),
    password: password.value,
    /*tipo: tipo.value,*/

  });
}
</script>

<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden flex w-full max-w-8xl transition-colors duration-300">
    <!-- IMAGEM LATERAL -->
    <div class="hidden md:block w-1/2">
      <img
        src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=900"
        alt="Estudante a escrever"
        class="h-full w-full object-cover"
      />
    </div>

    <!-- FORMULÁRIO -->
    <div class="w-full md:w-1/2 p-8">
      <h2 class="text-3xl font-bold text-center mb-6">Autenticação</h2>

      <form class="space-y-5" @submit.prevent="submit">
        <!--<div class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Sou:
        </label>

        <div class="flex gap-4">
          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="docente"
              v-model="tipo"
            />
            Professor
          </label>

          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="aluno"
              v-model="tipo"
            />
            Estudante
          </label>
        </div>
      </div> -->
        <div>
          <label class="block font-semibold mb-1">Utilizador</label>
          <input
            v-model="username"
            type="text"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <div>
          <label class="block font-semibold mb-1">Palavra-passe</label>
          <input
            v-model="password"
            type="password"
            class="w-full border p-2 rounded focus:ring focus:ring-blue-300"
            required
          />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button class="btn-login w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition">
          Entrar
        </button>
      </form>
      <p class="text-sm text-center text-gray-600 mt-4">
        É docente?
        <RouterLink
          to="/docente/registar"
          class="text-blue-600 hover:underline font-medium">
          Registe-se aqui
        </RouterLink>
      </p>
    </div>
  </div>
</template>
