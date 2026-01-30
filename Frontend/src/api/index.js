import { createHttpClient } from "./http";
import { useAuthStore } from "../stores/authStore";

export function makeApiClient() {
  const auth = useAuthStore();

  return createHttpClient({
    getToken: () => auth.token,          // se token for string normal
    onUnauthorized: () => auth.clearSession(),
  });
}
