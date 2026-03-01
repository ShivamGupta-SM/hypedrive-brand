import { isCancelledError, type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import { Toaster } from "sonner";
import type { types } from "@/lib/brand-client";
import { getSessionFromCookie } from "@/lib/server-auth";
import { AbilityProvider } from "@/providers/ability-provider";
import type { Organization } from "@/store/organization-store";

// Import global CSS here so it's included in SSR (not just client hydration)
import "../App.css";

// Router context type - available to all routes via beforeLoad chain
export interface RouterContext {
	queryClient: QueryClient;
	// Auth data from cookie — set in root beforeLoad
	auth: {
		isAuthenticated: boolean;
		user: types.UserResponse | null;
		token: string | null;
	};
	// Organization data — set in _app and $orgSlug beforeLoad
	organizations?: Organization[];
	organization?: Organization | null;
	orgSlug?: string;
	activeMember?: { role: string } | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context }) => {
		// Validate session from cookie, cache for 5 minutes to avoid re-validating on every navigation
		const auth = await context.queryClient.ensureQueryData({
			queryKey: ["auth", "session"],
			queryFn: () => getSessionFromCookie(),
			staleTime: 5 * 60 * 1000,
		});
		return { auth };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
			{ name: "mobile-web-app-capable", content: "yes" },
			{ name: "apple-mobile-web-app-status-bar-style", content: "default" },
			{ name: "theme-color", content: "#f5f5f4", media: "(prefers-color-scheme: light)" },
			{ name: "theme-color", content: "#09090b", media: "(prefers-color-scheme: dark)" },
			{
				name: "description",
				content: "Hypedrive Brand - Manage your influencer marketing campaigns",
			},
			{ property: "og:title", content: "Hypedrive Brand" },
			{ property: "og:description", content: "Influencer marketing brand admin panel" },
			{ property: "og:image", content: "/api/og" },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:type", content: "image/png" },
			{ property: "og:type", content: "website" },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:image", content: "/api/og" },
		],
		links: [
			{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
			{
				rel: "preload",
				href: "/fonts/geist-latin-wght-normal.woff2",
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				href: "/fonts/instrument-serif-latin-400-normal.woff2",
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
		],
	}),
	component: RootComponent,
	errorComponent: RootErrorComponent,
});

function RootErrorComponent({ error }: { error: unknown }) {
	if (isCancelledError(error)) return null;

	const message = error instanceof Error ? error.message : String(error);
	const isDev = typeof import.meta !== "undefined" && import.meta.env?.DEV;

	if (isDev) {
		console.error("[RootErrorComponent]", error);
	}

	return (
		<div className="flex min-h-dvh items-center justify-center p-6">
			<div className="text-center max-w-md">
				<p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">Something went wrong</p>
				{isDev && (
					<p className="mb-4 wrap-break-word rounded bg-red-50 px-3 py-2 text-left font-mono text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
						{message}
					</p>
				)}
				<button
					type="button"
					onClick={() => window.location.reload()}
					className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
				>
					Refresh page
				</button>
			</div>
		</div>
	);
}

/** Reactively reads data-theme from <html> via MutationObserver. */
function useTheme() {
	const [theme, setTheme] = useState<"light" | "dark">(() => {
		if (typeof document === "undefined") return "light";
		return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
	});

	useEffect(() => {
		const observer = new MutationObserver(() => {
			const t = document.documentElement.getAttribute("data-theme");
			setTheme(t === "dark" ? "dark" : "light");
		});
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
		return () => observer.disconnect();
	}, []);

	return theme;
}

function AppToaster() {
	const theme = useTheme();
	return (
		<Toaster
			theme={theme}
			position="bottom-right"
			closeButton
			duration={4000}
			gap={10}
			richColors={false}
			visibleToasts={3}
		/>
	);
}

const SKELETON_COLORS = {
	light: { base: "#e4e4e7", highlight: "#f4f4f5" }, // zinc-200 / zinc-100
	dark: { base: "#27272a", highlight: "#3f3f46" }, // zinc-800 / zinc-700
};

function AppSkeletonTheme({ children }: { children: React.ReactNode }) {
	const theme = useTheme();
	const colors = SKELETON_COLORS[theme];
	return (
		<SkeletonTheme baseColor={colors.base} highlightColor={colors.highlight}>
			{children}
		</SkeletonTheme>
	);
}

function RootComponent() {
	return (
		<RootDocument>
			<AppSkeletonTheme>
				<AbilityProvider>
					<Outlet />
					<AppToaster />
				</AbilityProvider>
			</AppSkeletonTheme>
		</RootDocument>
	);
}

// Theme init script — runs synchronously before first paint to prevent flash.
// Minified intentionally: single string, no user input, no dynamic values.
const THEME_INIT_SCRIPT =
	'(function(){try{var s=localStorage.getItem("theme")||"system",r=document.documentElement;r.setAttribute("data-theme",s==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):s)}catch(e){}})();';

function RootDocument({ children }: { children: React.ReactNode }) {
	const { queryClient } = Route.useRouteContext();

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
			</head>
			<body>
				<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
				<Scripts />
			</body>
		</html>
	);
}
