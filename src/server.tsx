import { isCancelledError } from "@tanstack/react-query";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

// During Vite SSR program reloads, TanStack Start clears the QueryClient which
// cancels in-flight queries. The resulting CancelledError is intentionally silent
// (silent: true) but goes unhandled at the process level, crashing Node.
// Catch it here so dev server stays alive across HMR reloads.
process.on("unhandledRejection", (reason) => {
	if (isCancelledError(reason)) return;
	// Re-throw non-CancelledError rejections so they surface normally
	console.error("Unhandled rejection:", reason);
});

const handler = createStartHandler(defaultStreamHandler);

export default {
	fetch: handler,
};
