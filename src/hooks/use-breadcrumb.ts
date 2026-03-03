import { useEffect } from "react";
import { create } from "zustand";

interface BreadcrumbStore {
	pageTitle: string | null;
	setPageTitle: (title: string | null) => void;
}

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
	pageTitle: null,
	setPageTitle: (title) => set({ pageTitle: title }),
}));

/**
 * Call from detail pages to set the breadcrumb page title.
 * Automatically clears when the component unmounts.
 *
 * @example
 * usePageTitle(campaign?.title ?? null);
 */
export function usePageTitle(title: string | null | undefined) {
	const setPageTitle = useBreadcrumbStore((s) => s.setPageTitle);

	useEffect(() => {
		setPageTitle(title ?? null);
		return () => setPageTitle(null);
	}, [title, setPageTitle]);
}
