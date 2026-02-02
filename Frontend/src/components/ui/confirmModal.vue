<script setup>
  defineProps({
    open: Boolean,
    title: {
      type: String,
      default: "Confirmar ação",
    },
    message: {
      type: String,
      required: true,
    },
    confirmText: {
      type: String,
      default: "Confirmar",
    },
    cancelText: {
      type: String,
      default: "Cancelar",
    },
  });
  const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
  >
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">
        {{ title }}
      </h2>

      <p class="text-gray-700 mb-6">
        {{ message }}
      </p>

      <div class="flex justify-end gap-3">
        <button
          class="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </button>

        <button
          class="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
