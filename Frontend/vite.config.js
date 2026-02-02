import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    plugins: [vue(), tailwindcss()],
    server: { 
      port: Number(env.VITE_PORT) || 5173,
      proxy: {
      "/api": {
        target: "http://localhost:9000",
        changeOrigin: true,
        secure: false,
        
      },
    },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  }
});
