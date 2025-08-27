// If you use Netlify proxy, set VITE_API_URL=/api in Netlify env
export const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
