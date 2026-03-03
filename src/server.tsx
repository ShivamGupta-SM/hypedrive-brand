import { isCancelledError } from "@tanstack/react-query";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

// During Vite SSR program reloads, TanStack Start clears the QueryClient which
// cancels in-flight queries. The resulting CancelledError is intentionally silent
// (silent: true) but goes unhandled at the process level, crashing Node.
// Catch it here so dev server stays alive across HMR reloads.
// Guard against duplicate listeners from repeated SSR module evaluations.
const GUARD = Symbol.for("__hdCancelledErrorHandler");
const g = globalThis as Record<symbol, boolean>;
if (!g[GUARD]) {
	g[GUARD] = true;
	process.on("unhandledRejection", (reason) => {
		if (isCancelledError(reason)) return;
		console.error("Unhandled rejection:", reason);
	});
}

const handler = createStartHandler(defaultStreamHandler);

export default {
	fetch: handler,
};
