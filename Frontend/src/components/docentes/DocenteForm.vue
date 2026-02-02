<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDocentesStore } from "@/stores/docentes.store";
import SuccessModal from "@/components/layout/SuccessModal.vue";

const route = useRoute();
const router = useRouter();
const store = useDocentesStore();
const showSuccess = ref(false);

const isEdit = computed(() => !!route.params.id);

const form = ref({
  nome: "",
  email: "",
  departamento: "",
  password: "",
  confirmPassword: "",
});

const errors = ref({});

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",.<>/?\\|]).{8,}$/;

function validate() {
  errors.value = {};

  if (!form.value.nome) {
    errors.value.nome = "O nome é obrigatório";
  }

  if (!form.value.email) {
    errors.value.email = "O email é obrigatório";
  }

  if (!isEdit.value) {
    if (!form.value.password) {
      errors.value.password = "A password é obrigatória";
    } else if (!passwordRegex.test(form.value.password)) {
      errors.value.password =
        "A password deve ter pelo menos 8 caracteres, 1 maiúscula, 1 número e 1 caracter especial";
    }

    if (!form.value.confirmPassword) {
      errors.value.confirmPassword = "Confirma a password";
    } else if (form.value.password !== form.value.confirmPassword) {
      errors.value.confirmPassword = "As passwords não coincidem";
    }
  }

  return Object.keys(errors.value).length === 0;
}

async function submit() {
  if (!validate()) return;

  if (isEdit.value) {
    await store.update(route.params.id, {
      nome: form.value.nome,
      email: form.value.email,
      departamento: form.value.departamento,
    });
  } else {
    await store.add({
      nome: form.value.nome,
      email: form.value.email,
      departamento: form.value.departamento,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword,
    });
  }

  showSuccess.value = true;

  setTimeout(() => {
    showSuccess.value = false;
    router.push("/docentes");
  }, 2000);
}

// carregar dados se for edição
onMounted(async () => {
  if (isEdit.value) {
    const docente = await store.fetchOne(route.params.id);
    form.value.nome = docente.nome;
    form.value.email = docente.email;
    form.value.departamento = docente.departamento;
  }
});
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4">

    <div>
      <label class="block text-sm font-medium">Nome</label>
      <input
        v-model="form.nome"
        class="w-full border rounded px-3 py-2"
      />
      <p v-if="errors.nome" class="text-red-600 text-sm">
        {{ errors.nome }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium">Email</label>
      <input
        v-model="form.email"
        type="email"
        class="w-full border rounded px-3 py-2"
      />
      <p v-if="errors.email" class="text-red-600 text-sm">
        {{ errors.email }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium">Departamento</label>
      <input
        v-model="form.departamento"
        class="w-full border rounded px-3 py-2"
      />
    </div>

    <div>
      <label class="block text-sm font-medium">Password</label>
      <input
        v-model="form.password"
        type="password"
        class="w-full border rounded px-3 py-2"
      />
      <p v-if="errors.password" class="text-red-600 text-sm">
        {{ errors.password }}
      </p>
    </div>

    <div>
      <label class="block text-sm font-medium">Confirmar Password</label>
      <input
        v-model="form.confirmPassword"
        type="password"
        class="w-full border rounded px-3 py-2"
      />
      <p v-if="errors.confirmPassword" class="text-red-600 text-sm">
        {{ errors.confirmPassword }}
      </p>
    </div>

    <button
      type="submit"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      Alterar docente
    </button>
  </form>
<SuccessModal
  :open="showSuccess"
  message="Docente registado com sucesso!"
/>

</template>
