import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import "@/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

/* 🔁 hidratar auth ANTES do router */
import { useAuthStore } from "@/stores/auth.store";
const auth = useAuthStore(pinia);
auth.hydrate();

app.use(router);
app.mount("#app");
