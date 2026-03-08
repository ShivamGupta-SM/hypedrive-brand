import { isCancelledError, type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { SkeletonTheme } from "react-loading-skeleton";
import { Toaster } from "sonner";
import type { Organization } from "@/components/app-layout";
import { NotFoundPage } from "@/components/shared/not-found-page";
import { CACHE } from "@/hooks/api-client";
import { useTheme } from "@/hooks/use-theme";
import type { types } from "@/lib/brand-client";
import { getServerAuthWithOrgs } from "@/server/auth-queries";

// Import global CSS here so it's included in SSR (not just client hydration)
import "../App.css";

// Router context type - available to all routes via beforeLoad chain
export interface RouterContext {
	queryClient: QueryClient;
	// Auth data from cookie — set in root beforeLoad
	auth: {
		isAuthenticated: boolean;
		user: types.UserResponse | null;
	};
	// Organization data — set in _app and $orgSlug beforeLoad
	organizations?: Organization[];
	organization?: Organization | null;
	orgSlug?: string;
	activeMember?: { role: string } | null;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	beforeLoad: async ({ context }) => {
		// Single server round-trip: auth session + organizations fetched in parallel.
		// Cached 5 min so client-side navigations are instant.
		const result = await context.queryClient.ensureQueryData({
			queryKey: ["auth", "session-with-orgs"],
			queryFn: () => getServerAuthWithOrgs(),
			staleTime: CACHE.auth,
		});
		return {
			auth: {
				isAuthenticated: result.isAuthenticated,
				user: result.user,
			},
			organizations: result.organizations,
		};
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
			{ rel: "manifest", href: "/manifest.webmanifest" },
		],
	}),
	component: RootComponent,
	errorComponent: RootErrorComponent,
	notFoundComponent: () => <NotFoundPage />,
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

const toastIcons = {
	success: (
		<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
			<path
				fillRule="evenodd"
				d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.354-8.646a.5.5 0 0 0-.708-.708L7 9.293 5.354 7.646a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l4-4Z"
				clipRule="evenodd"
			/>
		</svg>
	),
	error: (
		<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
			<path
				fillRule="evenodd"
				d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM5.854 5.146a.5.5 0 1 0-.708.708L7.293 8l-2.147 2.146a.5.5 0 0 0 .708.708L8 8.707l2.146 2.147a.5.5 0 0 0 .708-.708L8.707 8l2.147-2.146a.5.5 0 0 0-.708-.708L8 7.293 5.854 5.146Z"
				clipRule="evenodd"
			/>
		</svg>
	),
	warning: (
		<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
			<path
				fillRule="evenodd"
				d="M7.134 1.496a1 1 0 0 1 1.732 0l6.25 10.834A1 1 0 0 1 14.25 14H1.75a1 1 0 0 1-.866-1.5l.116-.17L7.134 1.496ZM8 5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0v-3A.5.5 0 0 1 8 5Zm.5 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Z"
				clipRule="evenodd"
			/>
		</svg>
	),
	info: (
		<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
			<path
				fillRule="evenodd"
				d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.5-10.5a.5.5 0 0 0-1 0v4a.5.5 0 0 0 1 0v-4ZM8 12.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
				clipRule="evenodd"
			/>
		</svg>
	),
	close: (
		<svg
			aria-hidden="true"
			width="12"
			height="12"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
			strokeLinecap="round"
		>
			<path d="M9 3 3 9M3 3l6 6" />
		</svg>
	),
};

function AppToaster() {
	const theme = useTheme();
	return (
		<Toaster
			theme={theme}
			position="bottom-right"
			closeButton
			icons={toastIcons}
			duration={4000}
			gap={8}
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
				<Outlet />
				<AppToaster />
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
				{/* Font preloads MUST be hardcoded here, NOT in head().
				    head() only renders after beforeLoad resolves (async auth call),
				    which delays font discovery and causes 3 visible font swaps. */}
				<link
					rel="preload"
					href="/fonts/geist-latin-wght-normal.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<link
					rel="preload"
					href="/fonts/instrument-serif-latin-400-normal.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
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
