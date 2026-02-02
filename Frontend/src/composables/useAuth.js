import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";

export function useAuth() {
  const auth = useAuthStore();

  return {
    user: computed(() => auth.user),
    token: computed(() => auth.token),
    isAuthenticated: computed(() => auth.isAuthenticated),
    isAdmin:  auth.isAdmin,
    roles: auth.roles,
    canManageDocentes: auth.canManageDocentes,
    loading: computed(() => auth.loading),
    login: auth.login,
    logout: auth.logout,
    clearSession: auth.clearSession,
  };
}
