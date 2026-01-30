<script setup>
import { watch, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import AppNavbar from "@/components/AppNavbar.vue";
import AppFooter from "@/components/AppFooter.vue";
import { useAuth } from "@/composables/useAuth";
import Breadcrumbs from "@/components/Breadcrumbs.vue";

const router = useRouter();
const route = useRoute();

const { isAuthenticated, user, logout } = useAuth();

// tema
const THEME_KEY = "theme";
const darkMode = ref(false);

function applyTheme(isDark) {
  document.body.classList.toggle("dark-mode", isDark);
}

function toggleTheme() {
  darkMode.value = !darkMode.value;
}

function handleLogout() {
  logout();
  router.push("/login");
}

onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark") darkMode.value = true;
  if (saved === "light") darkMode.value = false;

  applyTheme(darkMode.value);
});

watch(darkMode, (isDark) => {
  applyTheme(isDark);
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
});
</script>

<template>
  <AppNavbar
    title="Gestão de Propostas"
    :is-authenticated="isAuthenticated"
    :is-dark="darkMode"
    :userName="user?.nome"
    @logout="handleLogout"
    @toggle-theme="toggleTheme"
  />
    

<main class="flex-grow pb-14 pt-[var(--navbar-h)]">
<Breadcrumbs v-if="!route.meta?.hideBreadcrumbs" />
  <router-view />
</main>


  <AppFooter text="Programação Web Avançada @ Universidade Aberta 2026" />
</template>
