// =============================================================================
// SHARED AUTH COMPONENTS
// =============================================================================

export function FormError({ message }: { message?: string | null }) {
	if (!message) return null;

	return (
		<div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-950/30">
			<svg className="mt-0.5 size-4 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
				<path
					fillRule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
					clipRule="evenodd"
				/>
			</svg>
			<p className="text-sm text-red-700 dark:text-red-300">{message}</p>
		</div>
	);
}

interface SocialButtonProps {
	icon: React.ReactNode;
	label: string;
	shortLabel?: string;
	disabled?: boolean;
	onClick?: () => void;
}

export function SocialButton({ icon, label, shortLabel, disabled, onClick }: SocialButtonProps) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-zinc-950/10 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700/80"
		>
			{icon}
			{/* Show short label when in 2-col grid (≥380px), full label when stacked */}
			{shortLabel ? (
				<>
					<span className="min-[380px]:hidden">{label}</span>
					<span className="hidden min-[380px]:inline">{shortLabel}</span>
				</>
			) : (
				<span>{label}</span>
			)}
		</button>
	);
}
