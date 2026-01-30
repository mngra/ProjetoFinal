// src/stores/authStore.js
import { ref, computed } from "vue";

const TOKEN_KEY = "token"; // mantém igual ao que já tinhas
const USER_KEY = "user";

const token = ref(localStorage.getItem(TOKEN_KEY) || "");
const user = ref(null);

const isAdmin = computed(() => {
  const u = user.value;
  if (!u) return false;

  if (u.permissao) return u.permissao === "admin";
  if (u.role) return u.role === "admin";
  if (Array.isArray(u.roles)) return u.roles.includes("admin");

  return false;
});


try {
  user.value = JSON.parse(localStorage.getItem(USER_KEY) || "null");
} catch {
  user.value = null;
}

function setSession(newToken, newUser) {
  token.value = newToken;
  user.value = newUser;
  localStorage.setItem(TOKEN_KEY, newToken);
  localStorage.setItem(USER_KEY, JSON.stringify(newUser));
}

function clearSession() {
  token.value = "";
  user.value = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function loadUser() {
  try {
    user.value = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    user.value = null;
  }
}

const isAuthenticated = computed(() => !!token.value);

export const authStore = { token, user, isAuthenticated, isAdmin, setSession, clearSession,loadUser };
