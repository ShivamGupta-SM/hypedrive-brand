import { useSyncExternalStore } from "react";

/**
 * Reactively tracks the current theme ("light" | "dark") from the
 * `data-theme` attribute on `<html>`. Uses useSyncExternalStore so
 * all consumers update synchronously when the theme changes.
 */

type Theme = "light" | "dark";

function getSnapshot(): Theme {
	return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
	return "light";
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
	listeners.add(callback);

	// Start the MutationObserver on first subscriber
	if (listeners.size === 1) {
		startObserver();
	}

	return () => {
		listeners.delete(callback);
		if (listeners.size === 0) {
			stopObserver();
		}
	};
}

let observer: MutationObserver | null = null;

function startObserver() {
	if (typeof document === "undefined") return;
	observer = new MutationObserver(() => {
		for (const cb of listeners) cb();
	});
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["data-theme"],
	});
}

function stopObserver() {
	observer?.disconnect();
	observer = null;
}

export function useTheme(): Theme {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsDark(): boolean {
	return useTheme() === "dark";
}
