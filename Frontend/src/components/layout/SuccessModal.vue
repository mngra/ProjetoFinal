<script setup>
import { watch, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const props = defineProps({
  open: Boolean,
  message: {
    type: String,
    default: "Operação realizada com sucesso",
  },
});

const visible = ref(false);

watch(
  () => props.open,
  (v) => {
    if (v) {
      visible.value = true;
      setTimeout(() => {
        visible.value = false;
        router.replace("/login");
      }, 2000);
    }
  }
);
</script>

<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        class="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-3"
      >
        <!-- ícone -->
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <p class="text-gray-800 font-medium text-center">
          {{ message }}
        </p>
      </div>
    </div>
  </transition>
</template>
