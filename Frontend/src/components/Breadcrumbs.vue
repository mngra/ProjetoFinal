<template>
  <nav class="flex mb-1 max-w-6xl mx-auto pl-6 pt-2 pr-6" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <!-- Home -->
      <li class="inline-flex items-center">
        <RouterLink to="/" class="inline-flex items-center text-sm font-medium text-black hover:text-blue-600">
          <svg class="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
               viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
          </svg>
          Início
        </RouterLink>
      </li>

      <!-- Segmentos dinâmicos -->
      <li v-for="(segment, index) in breadcrumbs" :key="index" :aria-current="isLast(index) ? 'page' : null">
        <div class="flex items-center space-x-1.5">
          <svg class="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
               fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m9 5 7 7-7 7"/>
          </svg>

          <component
            :is="isLast(index) ? 'span' : RouterLink"
            :to="!isLast(index) ? segment.to : undefined"
            class="inline-flex items-center text-sm font-medium"
            :class="isLast(index) ? 'text-gray-500' : 'text-black hover:text-blue-600'"
          >
            {{ segment.name.charAt(0).toUpperCase() + segment.name.slice(1) }}

          </component>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const route = useRoute();

const breadcrumbs = computed(() => {
  const segments = route.path.split("/").filter(Boolean);

  return segments.map((segment, index) => ({
    name: decodeURIComponent(segment.replace(/-/g, " ")),
    to: "/" + segments.slice(0, index + 1).join("/"),
  }));
});

const isLast = (index) => index === breadcrumbs.value.length - 1;
</script>
