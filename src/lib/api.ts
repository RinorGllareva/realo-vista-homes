// Normalize base URL and build safe URLs for requests.
export const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const PUBLIC_API_ORIGIN = API ? new URL(API).origin : "https://api.realo-realestate.com";

export const apiUrl = (path: string) => {
  const p = path.replace(/^\/+/, "");
  return API ? `${API}/${p}` : `/${p}`;
};

export const normalizeMediaUrl = (url?: string | null) => {
  const value = String(url ?? "").trim();
  if (!value) return "";
  return value.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i, PUBLIC_API_ORIGIN);
};
