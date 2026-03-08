import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "sidebar-collapsed";

let listeners: Array<() => void> = [];
let collapsed = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) === "true" : false;

function emitChange() {
  for (const listener of listeners) listener();
}

const store = {
  subscribe(listener: () => void) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot() {
    return collapsed;
  },
  getServerSnapshot() {
    return false;
  },
};

export function useSidebarCollapsed() {
  const isCollapsed = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

  const toggle = useCallback(() => {
    collapsed = !collapsed;
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    emitChange();
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    collapsed = value;
    localStorage.setItem(STORAGE_KEY, String(value));
    emitChange();
  }, []);

  return { isCollapsed, toggle, setCollapsed };
}
