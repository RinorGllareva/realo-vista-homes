import axios from "axios";
import { API, apiUrl } from "@/lib/api";

// The admin token comes from the API's /api/Auth/Login and is kept for this browser tab
// only. The API checks it on every change; the website never knows the password.
const KEY = "realo:admin-token";

type Session = { token: string; expiresAt: number };

const read = (): Session | null => {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(KEY) || "null");
    return parsed && parsed.expiresAt > Date.now() ? parsed : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => read() !== null;

export const logout = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
};

export const login = async (username: string, password: string) => {
  const { data } = await axios.post<Session>(apiUrl("api/Auth/Login"), { username, password });
  sessionStorage.setItem(KEY, JSON.stringify({ token: data.token, expiresAt: data.expiresAt }));
};

const isApiRequest = (url = "") => (API ? url.startsWith(API) : url.startsWith("/api"));

// Attach the token to every API call, and send the admin back to the login page if the
// API says the session is no longer valid (expired, or the password was changed).
axios.interceptors.request.use((config) => {
  const session = read();
  if (session && isApiRequest(config.url)) {
    config.headers.set("Authorization", `Bearer ${session.token}`);
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error?.config?.url ?? "";
    if (error?.response?.status === 401 && isApiRequest(url) && !url.includes("api/Auth/Login")) {
      logout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      }
    }
    return Promise.reject(error);
  }
);
