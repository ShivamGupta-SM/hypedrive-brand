import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tsconfigPaths(),
		tanstackStart({
			router: {
				routesDirectory: "./routes",
				generatedRouteTree: "./routeTree.gen.ts",
			},
		}),
		react(),
		tailwindcss(),
	],
	optimizeDeps: {
		include: [
			"use-sync-external-store/shim/with-selector.js",
			"recharts",
			"country-state-city",
			"@headlessui/react",
			"@heroicons/react/16/solid",
			"@heroicons/react/20/solid",
			"@heroicons/react/24/outline",
			"react-hook-form",
			"@hookform/resolvers/zod",
			"date-fns",
			"zod",
			"clsx",
			"sonner",
			"react-day-picker",
			"react-dropzone",
			"react-number-format",
			"react-loading-skeleton",
		],
	},
	build: {
		// Split large vendor libraries into separate chunks for better caching
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (!id.includes("node_modules")) return;
					// Recharts + d3 (large, rarely changes)
					if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-")) {
						return "vendor-charts";
					}
					// Headless UI + Heroicons (UI primitives)
					if (id.includes("@headlessui") || id.includes("@heroicons")) {
						return "vendor-ui";
					}
				},
			},
		},
	},
});
