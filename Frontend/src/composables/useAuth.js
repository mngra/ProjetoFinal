import { computed, ref } from "vue";
import { authStore } from "../stores/authStore";
import { loginRequest, logoutRequest } from "../api/authService";

const loading = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => authStore.isAuthenticated.value);
  const user = computed(() => authStore.user.value);

  async function login(payload) {
    loading.value = true;
    try {
      return await loginRequest(payload);
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    logoutRequest();
  }

  return { isAuthenticated, user, loading, login, logout };
}
