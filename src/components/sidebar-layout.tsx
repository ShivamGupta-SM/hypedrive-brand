"use client";

import * as Headless from "@headlessui/react";
import type React from "react";
import { useState } from "react";
import { Logo } from "./logo";
import { NavbarItem } from "./navbar";

function OpenMenuIcon() {
	return (
		<svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
			<path d="M2 6.75C2 6.33579 2.33579 6 2.75 6H17.25C17.6642 6 18 6.33579 18 6.75C18 7.16421 17.6642 7.5 17.25 7.5H2.75C2.33579 7.5 2 7.16421 2 6.75ZM2 13.25C2 12.8358 2.33579 12.5 2.75 12.5H17.25C17.6642 12.5 18 12.8358 18 13.25C18 13.6642 17.6642 14 17.25 14H2.75C2.33579 14 2 13.6642 2 13.25Z" />
		</svg>
	);
}

function CloseMenuIcon() {
	return (
		<svg data-slot="icon" viewBox="0 0 20 20" aria-hidden="true">
			<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
		</svg>
	);
}

function MobileSidebar({
	open,
	close,
	children,
}: React.PropsWithChildren<{ open: boolean; close: () => void }>) {
	return (
		<Headless.Dialog open={open} onClose={close} className="lg:hidden">
			<Headless.DialogBackdrop
				transition
				className="fixed inset-0 bg-black/40 backdrop-blur-sm transition data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
			/>
			<Headless.DialogPanel
				transition
				className="fixed inset-y-0 left-0 w-full max-w-70 p-2 transition duration-300 ease-in-out data-closed:-translate-x-full"
			>
				<div className="flex h-full flex-col rounded-2xl bg-white shadow-xl ring-1 ring-zinc-950/5 dark:bg-zinc-900 dark:ring-white/10">
					<div className="-mb-3 px-4 pt-3">
						<Headless.CloseButton as={NavbarItem} aria-label="Close navigation">
							<CloseMenuIcon />
						</Headless.CloseButton>
					</div>
					{children}
				</div>
			</Headless.DialogPanel>
		</Headless.Dialog>
	);
}

export function SidebarLayout({
	navbar,
	sidebar,
	children,
}: React.PropsWithChildren<{ navbar: React.ReactNode; sidebar: React.ReactNode }>) {
	const [showSidebar, setShowSidebar] = useState(false);

	return (
		<div className="relative isolate flex h-dvh w-full max-lg:flex-col bg-zinc-100 dark:bg-zinc-950"
			style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
		>
			{/* ============================================ */}
			{/* DESKTOP LAYOUT — Inset sidebar + floating content card */}
			{/* ============================================ */}

			{/* Sidebar — desktop: fixed inset, sits on the gray shell */}
			<div className="fixed inset-y-0 left-0 hidden w-60 lg:block">
				{sidebar}
			</div>

			{/* Sidebar on mobile */}
			<MobileSidebar open={showSidebar} close={() => setShowSidebar(false)}>
				{sidebar}
			</MobileSidebar>

			{/* Mobile header bar */}
			<header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center">
					<NavbarItem onClick={() => setShowSidebar(true)} aria-label="Open navigation">
						<OpenMenuIcon />
					</NavbarItem>
				</div>
				<div className="flex min-w-0 flex-1 items-center justify-center">
					<Logo className="h-6 w-auto text-zinc-950 dark:text-white" />
				</div>
				<div className="flex items-center">{navbar}</div>
			</header>

			{/* Main content area — offset by sidebar width on desktop */}
			{/* The content sits inside a white floating card with rounded corners */}
			<main className="flex min-h-0 flex-1 flex-col lg:pl-60">
				{/* Desktop: padding creates the "inset" effect; the card has its own bg */}
				<div className="flex flex-1 flex-col min-h-0 lg:p-3">
					<div className="flex flex-1 flex-col min-h-0 lg:rounded-2xl lg:bg-white lg:shadow-md lg:ring-1 lg:ring-zinc-950/5 dark:lg:bg-zinc-900 dark:lg:ring-white/10">
						{/* Scrollable content */}
						<div className="flex-1 min-h-0 overflow-y-auto">
							<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8">
								{children}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
