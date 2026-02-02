<script setup>
  import { RouterView } from "vue-router";
  import AppNavBar from "@/components/layout/AppNavBar.vue";
  import AppFooter from "@/components/layout/AppFooter.vue";
  const appName = import.meta.env.VITE_APP_FOOTER
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <!-- NAVBAR -->
    <AppNavBar />

    <!-- CONTEÚDO DAS PÁGINAS -->
    <main class="flex-1">
      <RouterView />
    </main>
      <AppFooter :text=appName />

  </div>
</template>
