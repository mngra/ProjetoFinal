<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { AcademicCapIcon } from "@heroicons/vue/24/outline";


const emit = defineEmits(["toggle-theme"]);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userName = computed(() => authStore.user?.name || "");

const mobileOpen = ref(false);
const userMenuOpen = ref(false);

const initials = computed(() => {
  const n = userName.value.trim();
  if (!n) return "U";
  const parts = n.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
});

function logout() {
  authStore.logout();
}

async function handleLogout() {
  await logout();
  router.replace("/login");
}

function closeAll() {
  mobileOpen.value = false;
  userMenuOpen.value = false;
}

function toggleMobile() {
  mobileOpen.value = !mobileOpen.value;
  if (mobileOpen.value) userMenuOpen.value = false;
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value;
}

function onKeydown(e) {
  if (e.key === "Escape") closeAll();
}

// fecha dropdown ao clicar fora
function onDocClick(e) {
  const t = e.target;
  if (!t.closest?.("[data-user-menu]")) userMenuOpen.value = false;
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  document.addEventListener("click", onDocClick);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.removeEventListener("click", onDocClick);
});

// Fecha menu mobile quando navega
function onNavigate() {
  mobileOpen.value = false;
}

// helper para manter ativo em sub-rotas (ex: /docentes/123)
function isActivePrefix(prefix) {
  return route.path === prefix || route.path.startsWith(prefix + "/");
}

const linkBase = "hover:underline underline-offset-4";
const linkActive = "underline underline-offset-4 decoration-2 font-semibold";
</script>

<template>
  <nav class="fixed top-0 left-0 w-full z-50 bg-blue-900 text-white" style="height: var(--navbar-h)">
    <div class="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-4">
      <!-- LEFT -->
      <RouterLink to="/propostas" class="flex font-semibold text-lg hover:opacity-90 whitespace-nowrap">
        <AcademicCapIcon class="w-5 h-5 " /> <span class="text-base ml-1 tracking-wide">Gestão de Propostas</span>
      </RouterLink>

      <!-- DESKTOP NAV -->
<div class="hidden md:flex flex-1 justify-end">
  <div class="flex items-center gap-6 text-sm font-medium">
    
    <!-- Só para autenticados -->
    <RouterLink
      v-if="isAuthenticated"
      to="/propostas"
      :class="[linkBase, isActivePrefix('/propostas') && linkActive]"
    >
      Propostas
    </RouterLink>
<!-- Só Admin -->
    <RouterLink 
    v-if="authStore.isAdmin" 
    to="/alunos" 
    :class="[linkBase, isActivePrefix('/alunos') && linkActive]">
      Alunos
    </RouterLink>
    
    <!-- Público -->
    <RouterLink
      to="/docentes"
      :class="[linkBase, isActivePrefix('/docentes') && linkActive]"
    >
      Docentes
    </RouterLink>

  </div>
</div>


      <!-- RIGHT -->
      <div class="flex items-center gap-2">
        <!-- MOBILE: hamburger -->
        <button
          type="button"
          class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/15"
          @click="toggleMobile"
          aria-label="Abrir menu"
        >
          <!-- ícone hamburger simples -->
          <span class="block w-5">
            <span class="block h-0.5 bg-white mb-1"></span>
            <span class="block h-0.5 bg-white mb-1"></span>
            <span class="block h-0.5 bg-white"></span>
          </span>
        </button>

      

        <div v-if="isAuthenticated" class="hidden md:block relative" data-user-menu>
          <button
            type="button"
            class="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-3 py-1.5"
            @click="toggleUserMenu"
            aria-haspopup="menu"
            :aria-expanded="userMenuOpen ? 'true' : 'false'"
          >
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-blue-900 text-xs font-bold">
              {{ initials }}
            </span>
            <span class="text-sm font-medium max-w-[160px] truncate">
              {{ userName || "Conta" }}
            </span>
            <span class="text-xs opacity-90">▾</span>
          </button>

          <!-- dropdown desktop -->
          <div
            v-show="userMenuOpen"
            class="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-lg border overflow-hidden"
            role="menu"
          >
            <div class="px-4 py-3 border-b">
              <p class="text-xs text-gray-500">Sessão iniciada como</p>
              <p class="text-sm font-semibold truncate">{{ userName }}</p>
            </div>

            <RouterLink
              to="/conta"
              class="block px-4 py-2 text-sm hover:bg-gray-50"
              role="menuitem"
              @click="userMenuOpen = false"
            >
              Gerir conta
            </RouterLink>

            <RouterLink
              to="/conta/password"
              class="block px-4 py-2 text-sm hover:bg-gray-50"
              role="menuitem"
              @click="userMenuOpen = false"
            >
              Alterar palavra-passe
            </RouterLink>

            <button
              type="button"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
              role="menuitem"
              @click = "handleLogout"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE MENU (overlay + panel) -->
    <div v-if="mobileOpen" class="md:hidden">
      <div class="fixed inset-0 bg-black/40" @click="closeAll"></div>

      <div class="fixed top-[var(--navbar-h)] left-0 right-0 bg-white text-gray-900 border-b shadow-lg">
        <div class="max-w-6xl mx-auto px-4 py-4 space-y-4">
          <!-- nav links -->
          <div v-if="isAuthenticated" class="space-y-2">
            <RouterLink
              to="/propostas"
              class="block px-3 py-2 rounded-lg"
              :class="isActivePrefix('/propostas') ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'"
              @click="onNavigate"
            >
              Propostas
            </RouterLink>
            
          </div>
          <RouterLink
              to="/docentes"
              class="block px-3 py-2 rounded-lg"
              :class="isActivePrefix('/docentes') ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'"
              @click="onNavigate"
            >
              Docentes
            </RouterLink>

          <!-- auth / account -->
          <div class="border-t pt-3">
            <div v-if="!isAuthenticated">
              <RouterLink
                to="/login"
                class="block px-3 py-2 rounded-lg hover:bg-gray-50 font-medium"
                @click="onNavigate"
              >
                Entrar
              </RouterLink>
            </div>

            <div v-else class="space-y-2">
              <div class="px-3 py-2">
                <p class="text-xs text-gray-500">Sessão iniciada como</p>
                <p class="text-sm font-semibold truncate">{{ userName }}</p>
              </div>

              <RouterLink
                to="/conta"
                class="block px-3 py-2 rounded-lg hover:bg-gray-50"
                @click="onNavigate"
              >
                Gerir conta
              </RouterLink>

              <RouterLink
                to="/conta/password"
                class="block px-3 py-2 rounded-lg hover:bg-gray-50"
                @click="onNavigate"
              >
                Alterar palavra-passe
              </RouterLink>

              <button
                type="button"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600 font-medium"
                @click="() => { closeAll(); emit('logout'); }"
              >
                Sair
              </button>
            </div>
          </div>

          <!-- (opcional) theme toggle aqui -->
          <!--
          <button class="w-full border rounded-lg px-3 py-2" @click="emit('toggle-theme')">
            {{ isDark ? "Modo escuro" : "Modo claro" }}
          </button>
          -->
        </div>
      </div>
    </div>
  </nav>
</template>
