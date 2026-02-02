// src/api/http.js
import axios from "axios";

/**
 * Cria um cliente HTTP configurável
 */
export function createHttpClient({
  baseURL = "/api",
  getToken,
  onUnauthorized,
} = {}) {
  const http = axios.create({
    baseURL,
  });

  // 👉 Interceptor de request (token)
  http.interceptors.request.use(
    (config) => {
      const token = getToken?.();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`; 
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 👉 Interceptor de response (erros globais)
  http.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;

      if (status === 401) {
        // sessão inválida / expirada
        onUnauthorized?.();
      }

      if (status === 403) {
        error.message = "Não tem permissões para esta ação.";
      }

      return Promise.reject(error);
    }
  );

  return http;
}

/**
 * Instância global padrão (a mais usada)
 */
const http = createHttpClient({
  getToken: () => localStorage.getItem("token"),
  onUnauthorized: () => {
    localStorage.removeItem("token");
  },
});

export default http;
