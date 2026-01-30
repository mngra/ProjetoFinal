<script setup>
defineProps({
  text: { type: String, default: "" },
});
</script>

<template>
    <footer class="fixed bottom-0 left-0 w-full z-50 bg-blue-900 text-white text-center p-3" style="height: var(--footer-h)">
        {{ text }}
    </footer>
</template>
