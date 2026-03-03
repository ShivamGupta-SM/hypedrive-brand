/**
 * NotFoundPage — Polished 404 page with postcard illustration
 * Adapted from pixeleted-404 to Hypedrive design system:
 * - Catalyst Button + TanStack Router Link (no shadcn/lucide/Next)
 * - Geist + Instrument Serif fonts (no Google Fonts CDN)
 * - Emerald brand accents, zinc neutrals, full dark mode
 */

import { ArrowRightIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { Button } from "@/components/button";

interface NotFoundPageProps {
	/** Image URL for the postcard */
	postcardImage?: string;
	postcardAlt?: string;
	/** Text around the circular stamp */
	curvedTextTop?: string;
	curvedTextBottom?: string;
	heading?: string;
	subtext?: string;
	backButtonLabel?: string;
	backButtonHref?: string;
	/** When false, fills parent container instead of full viewport (for use inside sidebar layout) */
	fullScreen?: boolean;
	className?: string;
}

export function NotFoundPage({
	postcardImage = "https://images.unsplash.com/photo-1696070188645-67be6a7a8124?w=720&h=440&fit=crop&q=75&auto=format",
	postcardAlt = "India Gate, New Delhi",
	curvedTextTop = "Hypedrive",
	curvedTextBottom = "Brand Dashboard",
	heading = "(404) Looks like the page you were looking for took a wrong turn.",
	subtext = "But hey, even the best explorers get lost sometimes. Let's get you back on track.",
	backButtonLabel = "Back to Home",
	backButtonHref = "/",
	fullScreen = true,
	className,
}: NotFoundPageProps) {
	return (
		<div
			className={clsx(
				"flex items-center justify-center px-4",
				fullScreen ? "min-h-dvh py-16" : "min-h-[calc(100dvh-8rem)] py-12",
				className,
			)}
		>
			<div className="flex flex-col items-center">
				{/* Postcard + Stamp */}
				<div className="relative mb-14">
					{/* Rotating circular stamp */}
					<svg
						className="pointer-events-none absolute -top-14 -left-10 z-20 size-[120px] animate-spin-slow"
						viewBox="0 0 120 120"
						aria-hidden="true"
					>
						<defs>
							<path
								id="stampCircle"
								d="M 60,60 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
								fill="transparent"
							/>
						</defs>
						<text
							className="fill-zinc-700 font-serif text-[10px] uppercase dark:fill-zinc-300"
							style={{ fontWeight: 400, letterSpacing: "0.18em" }}
						>
							<textPath href="#stampCircle" startOffset="0%">
								{curvedTextTop} &bull; {curvedTextBottom} &bull;
							</textPath>
						</text>
					</svg>

					{/* Postcard */}
					<div className="relative z-10">
						<div
							className={clsx(
								"relative rotate-[4deg] bg-white p-2.5 shadow-2xl transition-transform duration-300 hover:rotate-0",
								"dark:bg-zinc-800"
							)}
						>
							<div className="relative overflow-hidden">
								<img
									src={postcardImage}
									alt={postcardAlt}
									className="h-[200px] w-[320px] object-cover sm:h-[220px] sm:w-[360px]"
								/>
								{/* 404 overlay — gradient fade from bottom for depth */}
								<div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-zinc-950/50 via-zinc-950/10 to-transparent">
									<span className="font-serif text-7xl tracking-tight text-white drop-shadow-lg sm:text-8xl">
										404
									</span>
								</div>
							</div>
						</div>

						{/* Postal wave marks */}
						<svg
							className="absolute -right-14 top-1/2 h-16 w-24 -translate-y-1/2"
							viewBox="0 0 100 60"
							aria-hidden="true"
						>
							<path
								d="M 10 15 Q 20 10 30 15 Q 40 20 50 15 Q 60 10 70 15 Q 80 20 90 15"
								className="stroke-zinc-300 dark:stroke-zinc-600"
								strokeWidth="1.5"
								fill="none"
								opacity="0.6"
							/>
							<path
								d="M 10 25 Q 20 20 30 25 Q 40 30 50 25 Q 60 20 70 25 Q 80 30 90 25"
								className="stroke-zinc-300 dark:stroke-zinc-600"
								strokeWidth="1.5"
								fill="none"
								opacity="0.6"
							/>
							<path
								d="M 10 35 Q 20 30 30 35 Q 40 40 50 35 Q 60 30 70 35 Q 80 40 90 35"
								className="stroke-zinc-300 dark:stroke-zinc-600"
								strokeWidth="1.5"
								fill="none"
								opacity="0.6"
							/>
						</svg>
					</div>
				</div>

				{/* Text content */}
				<div className="max-w-2xl text-center">
					{/* Heading — (404) inline, Geist sans bold for clean modern feel */}
					<h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-zinc-900 md:text-5xl dark:text-white">
						{heading}
					</h1>

					{/* Subtext — slightly larger, generous spacing */}
					<p className="mt-6 text-base leading-relaxed text-zinc-500 md:text-lg dark:text-zinc-400">
						{subtext}
					</p>

					<div className="mt-10">
						<Button href={backButtonHref} color="dark/zinc">
							{backButtonLabel}
							<ArrowRightIcon />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
