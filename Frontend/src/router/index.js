import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "../stores/authStore";

import MainLayout from "../layouts/MainLayout.vue";
import LoginView from "../views/LoginView.vue";
import DocentesView from "../views/DocentesView.vue";
import PropostasView from "../views/PropostasView.vue"; 
import PropostaDetalheView from "../views/PropostaDetalheView.vue";
import PropostaNovaView from "../views/PropostaNovaView.vue";
import PropostaEditarView from "../views/PropostaEditarView.vue";

const routes = [  
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "login", name: "login", component: LoginView, meta: { hideBreadcrumbs: true } },
      { path: "", redirect: "/propostas" }, // após login vai para propostas
      { path: "propostas", name: "propostas", component: PropostasView, meta: { requiresAuth: true } },
      { path: "docentes", name: "docentes", component: DocentesView },
      { path: "propostas/:id", name: "PropostaDetalhe", component: PropostaDetalheView, meta: { requiresAuth: true } },
      { path: "propostas/nova", name: "PropostaNova", component: PropostaNovaView, meta: { requiresAuth: true } },
      { path: "propostas/:id/editar", name: "PropostaEditarView", component: PropostaEditarView , meta: { requiresAuth: true } },
      
    ],
  },

  //{ path: "/:pathMatch(.*)*", redirect: "/propostas" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  // se não está autenticado e tenta ir a página protegida
  if (to.meta.requiresAuth && !authStore.isAuthenticated.value) {
    return { name: "login", query: { next: to.fullPath } };
  }

  // se já está autenticado e vai ao login, manda para propostas
  if (to.name === "login" && authStore.isAuthenticated.value) {
    return { name: "propostas" };
  }
});

export default router;
