import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import handler from "./dist/server/server.js";

const app = new Hono();

// Serve any static file from dist/client (assets, fonts, icons, images, etc.)
// Falls through to SSR handler if file doesn't exist
app.use("*", serveStatic({ root: "./dist/client" }));

// All other requests go to the TanStack Start SSR handler
app.all("*", (c) => handler.fetch(c.req.raw));

const port = Number(process.env.PORT) || 3000;
serve({ fetch: app.fetch, port }, () => {
	console.log(`Production server running at http://localhost:${port}`);
});
