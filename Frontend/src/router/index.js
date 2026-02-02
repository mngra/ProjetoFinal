import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import MainLayout from "@/components/layout/MainLayout.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },

  /* 🔓 PÚBLICO (sem layout) */
  {
    path: "/login",
    component: () => import("@/pages/auth/LoginPage.vue"),
    meta: { public: true },
  },

  /* 🌍 MAIN LAYOUT (público e protegido) */
  {
    path: "/",
    component: MainLayout,
    children: [
      /* 🔓 Público com layout */
      {
        path: "docentes",
        component: () => import("@/pages/docentes/DocentesListPage.vue"),
        meta: { public: true },
      },
     {
        path: "/docente/registar",
        component: () => import("@/pages/docentes/DocenteCreatePage.vue"),
        meta: { public: true },
      },

      /* 🔐 Protegido com layout */
      {
        path: "propostas",
        name: "propostas",
        component: () => import("@/pages/propostas/PropostasListPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/propostas/:id/editar",
        name: "PropostaEditarView",
        component: () => import("@/pages/propostas/PropostaEditPage.vue"),
        meta: { requiresAuth: true },
      },
      { path: "propostas/:id", 
        name: "PropostaDetalhe", 
        component: () => import("@/pages/propostas/PropostaDetalhePage.vue"), 
        meta: { requiresAuth: true },
      },
      { path: "propostas/nova", 
        name: "PropostaNova",
        component: () => import("@/pages/propostas/PropostaCreatePage.vue"), 
        meta: { requiresAuth: true },
      },
      {
        path: "/docentes/:id/editar",
        name: "DocentesEditar",
        component: () => import("@/pages/docentes/DocenteEditPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/alunos",
        name: "AlunosList",
        component: () => import("@/pages/alunos/AlunosListPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/alunos/criar",
        name: "AlunosCreate",
        component: () => import("@/pages/alunos/AlunoCreatePage.vue"),
        meta: { requiresAuth: true, roles: ['admin'] },
      },
      {
        path: "/alunos/:id/editar",
        name: "AlunosEdit",
        component: () => import("@/pages/alunos/AlunoEditPage.vue"),
        meta: { requiresAuth: true, roles: ['admin'] },
      },

      
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/* AUTH GUARD */
router.beforeEach((to) => {
  const auth = useAuthStore();

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const isAuthenticated = auth.isAuthenticated;

  // 🔐 Não autenticado a tentar rota protegida
  if (requiresAuth && !isAuthenticated) {
    return {
      path: "/login",
      query: { next: to.fullPath },
    };
  }
  return true;
});


export default router;
