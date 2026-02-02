import { defineStore } from "pinia";
import { loginRequest, logoutRequest } from "@/services/auth.service";

const STORAGE_KEY = "auth";

function loadPersistedAuth() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { token: "", user: null };
        return JSON.parse(raw);
    } catch {
        return { token: "", user: null };
    }
}

function normalizeUser(user) {
  if (!user) return null;

  const roles = Array.isArray(user.roles)
    ? user.roles
    : user.roles
      ? [user.roles]
      : user.role
        ? [user.role]
        : [];

  return {
    ...user,
    roles
  };
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: "",
        user: null,
        loading: false,
    }),

    getters: {
        isAuthenticated: (s) => !!s.token,
        roles: (s) => s.user?.roles ?? [],
        isAdmin: (s) => Array.isArray(s.user?.roles) && s.user.roles.includes('admin'),
        canManageDocentes: (s) => Array.isArray(s.user?.roles) &&
           (s.user.roles.includes('admin') ||
           s.user.roles.includes('docente')),
    },

    actions: {
        hydrate() {
            const { token, user } = loadPersistedAuth();
            this.token = token;
            this.user = normalizeUser(user);
        },

        async login(payload) {
            this.loading = true;
            try {
                const { token, user } = await loginRequest(payload);
                const normalizedUser = normalizeUser(user);

                this.token = token;
                this.user = normalizedUser;

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ token, user: normalizedUser })
                );

                return normalizedUser;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            try {
                await logoutRequest();
            } finally {
                this.clearSession();
            }
        },

        clearSession() {
            this.token = "";
            this.user = null;
            localStorage.removeItem(STORAGE_KEY);
        },
    },
});
