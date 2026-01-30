<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoginCard from "../components/LoginCard.vue";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const route = useRoute();

const error = ref("");

const darkMode = ref(false);

const { login, loading } = useAuth();

onMounted(() => {
  document.body.classList.toggle("dark-mode", darkMode.value);
});

async function handleLogin({ username, password, tipo }) {
  error.value = "";
  try {
    await login({
      email: username,
      senha: password,
      tipo: tipo || "docente",
    });

    router.push(route.query.next?.toString() || "/propostas");
  } catch (e) {
    error.value = e.message || "Erro no login";
  }
}
</script>

<template>

<main class="min-h-[calc(100vh-128px)] flex items-center justify-center px-6">
  <div class="w-full max-w-4xl space-y-9">
    <LoginCard
      @submit-login="handleLogin"
      :error="error"
      :loading="loading"
    />
    
  </div>
</main>
  
</template>
