import { useEffect, useSyncExternalStore } from "react";

// Simple external store — replaces Zustand for this single-value case.
let pageTitle: string | null = null;
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

function getSnapshot() {
	return pageTitle;
}

function setPageTitle(title: string | null) {
	pageTitle = title;
	for (const cb of listeners) cb();
}

/** Read the current page title (for breadcrumbs). */
export function useBreadcrumbStore() {
	const title = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
	return { pageTitle: title };
}

/**
 * Call from detail pages to set the breadcrumb page title.
 * Automatically clears when the component unmounts.
 *
 * @example
 * usePageTitle(campaign?.title ?? null);
 */
export function usePageTitle(title: string | null | undefined) {
	useEffect(() => {
		setPageTitle(title ?? null);
		return () => setPageTitle(null);
	}, [title]);
}
