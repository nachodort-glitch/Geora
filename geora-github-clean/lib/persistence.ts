import { emptyStore, type Store } from "./game";
import { byId, contentVersion } from "./content";
import { validateStore } from "./store-validation";
export const STORAGE_KEY = "geora.progress.v1";
export function parseStore(raw: string): Store {
  const s: unknown = JSON.parse(raw);
  validateStore(s, new Set(Object.keys(byId)), contentVersion);
  return s;
}
export function load(): Store {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? parseStore(raw) : emptyStore();
}
export function save(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
export const localDay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
