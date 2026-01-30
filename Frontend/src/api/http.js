import axios from "axios";
import { ApiError } from "./errors";

export function createHttpClient({ getToken, onUnauthorized } = {}) {
  const http = axios.create({
    baseURL: "/api",
    timeout: 10000,
  });

  http.interceptors.request.use(
    (config) => {
      const token = getToken?.();
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error)
  );

  http.interceptors.response.use(
    (response) => response,
    (error) => {
      // Timeout / network
      if (error.code === "ECONNABORTED") {
        return Promise.reject(new ApiError("Tempo de espera excedido", { code: error.code }));
      }

      if (error.response) {
        const { status, data } = error.response;

        if (status === 401) {
          onUnauthorized?.();
        }

        const message =
          data?.message ||
          data?.error ||
          (Array.isArray(data?.errors) ? data.errors.join(", ") : null) ||
          `Erro HTTP ${status}`;

        return Promise.reject(new ApiError(message, { status, data, code: error.code }));
      }

      if (error.request) {
        return Promise.reject(new ApiError("Não foi possível contactar o servidor", { code: error.code }));
      }

      return Promise.reject(error);
    }
  );

  return http;
}
