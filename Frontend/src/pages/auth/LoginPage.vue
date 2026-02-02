<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LoginCard from "@/components/auth/LoginCard.vue";
import { useAuth } from "@/composables/useAuth";

const router = useRouter();
const route = useRoute();

const error = ref("");

const { login, loading } = useAuth();

async function handleLogin({ username, password, tipo }) {
  error.value = "";

  try {
    await login({
      email: username,
      senha: password,
      tipo: "docente",
    });

    router.push(route.query.next?.toString() || "/propostas");
  } catch (e) {
    error.value = "Erro no login";
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center px-6 bg-gray-50">
    <div class="w-full max-w-4xl space-y-9">
      <LoginCard
        @submit-login="handleLogin"
        :error="error"
        :loading="loading"
      />
    </div>
  </main>
</template>
