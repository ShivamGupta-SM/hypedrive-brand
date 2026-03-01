/**
 * Highlight matching text in search results
 */
export function HighlightText({ text, query }: { text: string; query: string }) {
	if (!query.trim() || query.length < 2) return <>{text}</>;

	try {
		const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(`(${escapedQuery})`, "gi");
		const parts = text.split(regex);

		return (
			<>
				{parts.map((part, i) =>
					regex.test(part) ? (
						<mark
							key={i}
							className="rounded bg-amber-200 text-amber-900 dark:bg-amber-500/30 dark:text-amber-200"
						>
							{part}
						</mark>
					) : (
						<span key={i}>{part}</span>
					)
				)}
			</>
		);
	} catch {
		return <>{text}</>;
	}
}
