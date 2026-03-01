import { CheckIcon, Square2StackIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import { showToast } from "@/lib/toast";

interface CopyButtonProps {
	value: string;
	label?: string;
	className?: string;
}

export function CopyButton({ value, label, className = "" }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(value);
		showToast.copy(label);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<button
			type="button"
			onClick={handleCopy}
			title={label ? `Copy ${label}` : "Copy"}
			className={`rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 ${className}`}
		>
			{copied ? (
				<CheckIcon className="size-3.5 text-emerald-500" />
			) : (
				<Square2StackIcon className="size-3.5" />
			)}
		</button>
	);
}
