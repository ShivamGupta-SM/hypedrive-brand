import {
	ArrowsRightLeftIcon,
	CurrencyRupeeIcon,
	SparklesIcon,
} from "@heroicons/react/16/solid";

export const CAMPAIGN_TYPE_CONFIG: Record<
	string,
	{ label: string; color: "emerald" | "amber" | "sky"; icon: typeof CurrencyRupeeIcon }
> = {
	cashback: { label: "Cashback", color: "emerald", icon: CurrencyRupeeIcon },
	barter: { label: "Barter", color: "amber", icon: ArrowsRightLeftIcon },
	hybrid: { label: "Hybrid", color: "sky", icon: SparklesIcon },
};

export function formatDate(dateStr?: string) {
	if (!dateStr) return "Not set";
	return new Date(dateStr).toLocaleDateString("en-IN", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}
