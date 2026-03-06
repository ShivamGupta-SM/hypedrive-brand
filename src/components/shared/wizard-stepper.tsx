import { CheckIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";

export function WizardStepper({
	steps,
	currentStep,
	completedSteps,
	onStepClick,
}: {
	steps: readonly string[];
	currentStep: number;
	completedSteps: boolean[];
	onStepClick: (step: number) => void;
}) {
	return (
		<nav aria-label="Progress">
			<ol className="flex w-full items-start">
				{steps.map((label, i) => {
					const isCompleted = completedSteps[i] && i !== currentStep;
					const isCurrent = i === currentStep;
					const isPast = i < currentStep;
					const canClick = i < currentStep || completedSteps[i];
					const isLast = i === steps.length - 1;

					return (
						<li key={label} className={clsx("flex items-start", isLast ? "shrink-0" : "w-full")}>
							<button
								type="button"
								aria-current={isCurrent ? "step" : undefined}
								aria-label={`Step ${i + 1}: ${label}`}
								onClick={() => canClick && onStepClick(i)}
								className={clsx(
									"group flex flex-col items-center gap-2",
									canClick ? "cursor-pointer" : "cursor-default"
								)}
							>
								{/* Circle + connector row */}
								<div className="flex items-center">
									<span
										className={clsx(
											"relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
											isCurrent &&
												"bg-zinc-900 text-white ring-[3px] ring-zinc-900/10 dark:bg-white dark:text-zinc-900 dark:ring-white/15",
											isCompleted && "bg-emerald-500 text-white group-hover:bg-emerald-600",
											!isCurrent &&
												!isCompleted &&
												"border-2 border-zinc-200 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
										)}
									>
										{isCompleted ? <CheckIcon className="size-4" /> : i + 1}
									</span>
								</div>

								{/* Label */}
								<span
									className={clsx(
										"text-center text-xs font-medium transition-colors duration-200",
										isCurrent && "text-zinc-900 dark:text-white",
										isCompleted && "text-emerald-600 dark:text-emerald-400",
										!isCurrent && !isCompleted && "text-zinc-500 dark:text-zinc-400"
									)}
								>
									{label}
								</span>
							</button>

							{/* Connector line */}
							{!isLast && (
								<div className="mt-4 h-0.5 w-full self-start rounded-full bg-zinc-100 dark:bg-zinc-800">
									<div
										className={clsx(
											"h-full rounded-full transition-all duration-500 ease-out",
											isPast ? "bg-emerald-500" : "bg-transparent"
										)}
										style={{ width: isPast ? "100%" : "0%" }}
									/>
								</div>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
