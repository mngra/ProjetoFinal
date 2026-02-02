<template>
  <AppNavBar />
  <RouterView />
  <AppFooter :text=appName />
</template>

<script setup>
import AppNavBar from "@/components/layout/AppNavBar.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
const appName = import.meta.env.VITE_APP_FOOTER

import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

watch(
  () => route.path,
  (newPath) => {
      document.title = "GestProp";
  },
  { immediate: true }
);
onMounted(() => {
  const link = document.querySelector("link[rel~='icon']");
  if (link) {
    link.href = "/favicon.svg"; // Caminho para o teu novo favicon
  }
});

</script>
