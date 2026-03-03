import { createFileRoute } from "@tanstack/react-router";
import type React from "react";
import satori from "satori";

// Singleton WASM init — only runs once per server process
let wasmInitialized = false;
async function initResvg() {
	if (wasmInitialized) return;
	const { initWasm } = await import("@resvg/resvg-wasm");
	const wasmModule = await import("@resvg/resvg-wasm/index_bg.wasm?url");
	const response = await fetch(wasmModule.default);
	await initWasm(response);
	wasmInitialized = true;
}

export const Route = createFileRoute("/api/og")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const url = new URL(request.url);
				const title = url.searchParams.get("title") || "Hypedrive Brand";
				const description = url.searchParams.get("description") || "Influencer Marketing — Brand Admin Panel";

				// Load font from public/fonts (stable URL, no hash)
				const baseUrl = `${url.protocol}//${url.host}`;
				const [fontData] = await Promise.all([
					fetch(`${baseUrl}/fonts/geist-latin-wght-normal.woff2`).then((r) => r.arrayBuffer()),
				]);

				const svg = await satori(
					// JSX-compatible object tree (satori accepts React-like elements)
					{
						type: "div",
						props: {
							style: {
								display: "flex",
								flexDirection: "column",
								width: "100%",
								height: "100%",
								backgroundColor: "#fafafa",
								padding: "72px 80px",
								fontFamily: "Geist Variable",
								position: "relative",
							},
							children: [
								// Red left accent bar
								{
									type: "div",
									props: {
										style: {
											position: "absolute",
											left: 0,
											top: 0,
											bottom: 0,
											width: 6,
											backgroundColor: "#E50914",
										},
									},
								},
								// Top: arrow icon + wordmark row
								{
									type: "div",
									props: {
										style: { display: "flex", alignItems: "center", gap: 20 },
										children: [
											// Arrow icon (SVG as img via data URI)
											{
												type: "img",
												props: {
													src: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 116" fill="none"><path d="M2 0H43L111 75 65 116H30L53 75Z" fill="%23E50914"/></svg>')}`,
													width: 48,
													height: 50,
												},
											},
											// "HYPEDRIVE" wordmark text
											{
												type: "span",
												props: {
													style: {
														fontSize: 36,
														fontWeight: 700,
														color: "#09090b",
														letterSpacing: "-0.02em",
													},
													children: "HYPEDRIVE",
												},
											},
										],
									},
								},
								// Spacer
								{
									type: "div",
									props: { style: { flex: 1 } },
								},
								// Title
								{
									type: "div",
									props: {
										style: {
											fontSize: title === "Hypedrive Brand" ? 52 : 58,
											fontWeight: 700,
											color: "#09090b",
											letterSpacing: "-0.03em",
											lineHeight: 1.1,
											marginBottom: 20,
											maxWidth: 900,
										},
										children: title,
									},
								},
								// Description
								{
									type: "div",
									props: {
										style: {
											fontSize: 24,
											fontWeight: 400,
											color: "#71717a",
											letterSpacing: "-0.01em",
											lineHeight: 1.4,
										},
										children: description,
									},
								},
							],
						},
					} as React.ReactNode,
					{
						width: 1200,
						height: 630,
						fonts: [
							{
								name: "Geist Variable",
								data: fontData,
								weight: 400,
								style: "normal",
							},
							{
								name: "Geist Variable",
								data: fontData,
								weight: 700,
								style: "normal",
							},
						],
					}
				);

				// Convert SVG → PNG via resvg-wasm
				await initResvg();
				const { Resvg } = await import("@resvg/resvg-wasm");
				const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
				const png = resvg.render().asPng();

				return new Response(png as unknown as BodyInit, {
					headers: {
						"Content-Type": "image/png",
						"Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
					},
				});
			},
		},
	},
});
