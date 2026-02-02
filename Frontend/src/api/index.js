import { createHttpClient } from "./http";
import { useAuthStore } from "@/stores/auth.store";

let httpInstance;
function getTokenFromStorage() {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed.token || null;
  } catch {
    return null;
  }
}

export function getHttp() {
  if (!httpInstance) {
    httpInstance = createHttpClient({
      getToken: getTokenFromStorage,
      onUnauthorized: () => {
        const auth = useAuthStore();
        auth.clearSession();
      },
    });
  }
  return httpInstance;
}
