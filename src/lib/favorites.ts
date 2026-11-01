import { useSyncExternalStore } from "react";

// Favorites live in this browser's localStorage, so they survive closing the tab or
// phone browser without any account. Other tabs stay in sync through the storage event.
const KEY = "realo:favorites";
const listeners = new Set<() => void>();
let cache: string[] | null = null;

const read = (): string[] => {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    cache = Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    cache = [];
  }
  return cache;
};

const write = (ids: string[]) => {
  cache = ids;
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Private mode or storage disabled: keep the in-memory list for this visit.
  }
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

export const toggleFavorite = (id: string | number) => {
  const key = String(id);
  const ids = read();
  write(ids.includes(key) ? ids.filter((x) => x !== key) : [key, ...ids]);
};

export const addFavorites = (newIds: Array<string | number>) => {
  const ids = read();
  const fresh = newIds.map(String).filter((id) => id && !ids.includes(id));
  if (fresh.length) write([...fresh, ...ids]);
};

export const useFavorites =() => useSyncExternalStore(subscribe, read, () => []);

export const useIsFavorite = (id: string | number) => useFavorites().includes(String(id));
