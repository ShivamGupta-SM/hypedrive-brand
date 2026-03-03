import * as Headless from "@headlessui/react";
import { Link, useLocation } from "@tanstack/react-router";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";

function MenuIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<line x1="4" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
			<line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
			<line x1="4" y1="17" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
		</svg>
	);
}

function MobileSidebar({ open, close, children }: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
	return (
		<Headless.Dialog open={open} onClose={close} className="lg:hidden">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/40 backdrop-blur-sm transition data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
			/>
			<Headless.DialogPanel
				transition
				className="fixed inset-y-0 left-0 w-full max-w-72 p-2 transition duration-300 ease-in-out data-closed:-translate-x-full"
			>
				<div className="relative flex h-full flex-col rounded-2xl bg-white shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<Headless.CloseButton
						aria-label="Close navigation"
						className="absolute right-3 top-3.5 z-10 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-950/5 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
					>
						<svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
						</svg>
					</Headless.CloseButton>
					{children}
				</div>
			</Headless.DialogPanel>
		</Headless.Dialog>
	);
}

export function SidebarLayout({
	navbar,
	mobileNavbar,
	sidebar,
	contentHeader,
	mobileOrgSwitcher,
	logoHref,
	children,
}: React.PropsWithChildren<{
	navbar: React.ReactNode;
	mobileNavbar?: React.ReactNode;
	sidebar: React.ReactNode;
	contentHeader?: React.ReactNode;
	mobileOrgSwitcher?: React.ReactNode;
	logoHref?: string;
}>) {
	const [showSidebar, setShowSidebar] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const { pathname } = useLocation();

	// Reset scroll position when route changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is intentionally used as a trigger
	useEffect(() => {
		scrollRef.current?.scrollTo(0, 0);
	}, [pathname]);

	return (
		<div
			className="relative isolate flex h-dvh w-full bg-zinc-100 max-lg:flex-col dark:bg-zinc-950"
			style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
		>
			{/* Desktop sidebar — z-10 ensures dropdowns render above content */}
			<div className="fixed inset-y-0 left-0 z-10 hidden w-60 lg:block">{sidebar}</div>

			{/* Mobile sidebar */}
			<MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
				{sidebar}
			</MobileSidebar>

			{/* Mobile header */}
			<header className="flex h-12 shrink-0 items-center gap-3 border-b border-zinc-950/10 bg-white px-3 lg:hidden dark:border-white/10 dark:bg-zinc-900">
				<button
					type="button"
					onClick={() => setShowSidebar(true)}
					aria-label="Open navigation"
					className="-ml-1 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-950/5 hover:text-zinc-700 active:bg-zinc-950/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200 dark:active:bg-white/5"
				>
					<MenuIcon className="size-5" />
				</button>
				<Link to={logoHref || "/"} className="shrink-0">
					<Logo className="h-4.5 w-auto text-zinc-950 dark:text-white" />
				</Link>
				<div className="h-5 w-px bg-zinc-950/10 dark:bg-white/10" />
				{mobileOrgSwitcher}
				<div className="min-w-0 flex-1" />
				<div className="flex shrink-0 items-center gap-1">{mobileNavbar ?? navbar}</div>
			</header>

			{/* Main content — offset by sidebar width on desktop */}
			<main className="flex min-h-0 flex-1 flex-col lg:pl-60">
				<div className="flex min-h-0 flex-1 flex-col lg:p-2.5 lg:pl-2">
					<div className="flex min-h-0 flex-1 flex-col bg-white lg:rounded-2xl lg:shadow-sm lg:ring-1 lg:ring-zinc-950/5 dark:bg-zinc-900 dark:lg:ring-white/10">
						{contentHeader}
						<div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
							<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8">{children}</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
