// Normalize base URL and build safe URLs for requests.
export const API = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export const apiUrl = (path: string) => {
  const p = path.replace(/^\/+/, "");
  return API ? `${API}/${p}` : `/${p}`;
};
