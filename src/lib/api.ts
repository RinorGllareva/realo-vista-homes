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

export const apiErrorMessage = (error: unknown, fallback = "Request failed.") => {
  const responseError = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data;
  return responseError?.error || responseError?.message || fallback;
};

const API_IMAGE = /\/api\/Property\/GetPropertyImage\/\d+$/;

/** A smaller WebP of a photo stored by the API (?w=); other image URLs come back unchanged. */
export const sizedImage = (url: string, width: number) => (API_IMAGE.test(url) ? `${url}?w=${width}` : url);

/** srcSet for an API-stored photo, so the browser picks the size it needs. */
export const imageSrcSet = (url: string, widths: number[]) =>
  API_IMAGE.test(url) ? widths.map((w) => `${url}?w=${w} ${w}w`).join(", ") : undefined;

/** The HTML fetchpriority attribute (React 18 does not know the camelCase prop yet). */
export const fetchPriority = (high: boolean) => ({ fetchpriority: high ? "high" : "auto" }) as Record<string, string>;
