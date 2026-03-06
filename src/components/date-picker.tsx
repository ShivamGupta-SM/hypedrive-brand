/**
 * DatePicker - Themed wrapper for react-day-picker + Headless UI Popover
 * Provides date selection with proper positioning, focus trap, and animations
 */

import * as Headless from "@headlessui/react";
import { CalendarIcon } from "@heroicons/react/16/solid";
import clsx from "clsx";
import { format } from "date-fns";
import { type DateRange, DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

// =============================================================================
// SHARED — Catalyst-matching trigger (mirrors src/components/input.tsx)
// =============================================================================

function TriggerButton({
	displayValue,
	placeholder,
	disabled,
	error,
	inputClassName,
}: {
	displayValue: string;
	placeholder: string;
	disabled?: boolean;
	error?: boolean;
	inputClassName?: string;
}) {
	return (
		<Headless.PopoverButton
			as="span"
			data-slot="control"
			className={clsx(
				"relative block w-full cursor-pointer",
				"before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm",
				"dark:before:hidden",
				"after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500",
				error && "after:ring-red-500 sm:focus-within:after:ring-red-500",
				disabled && "pointer-events-none opacity-50 before:bg-zinc-950/5 before:shadow-none"
			)}
		>
			<span
				className={clsx(
					"relative flex w-full items-center justify-between gap-2 rounded-lg text-left px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]",
					"text-base/6 sm:text-sm/6",
					displayValue ? "text-zinc-950 dark:text-white" : "text-zinc-500 dark:text-zinc-500",
					error
						? "border border-red-500 hover:border-red-500 dark:border-red-600 dark:hover:border-red-600"
						: "border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20",
					"bg-transparent dark:bg-white/5",
					"focus:outline-hidden",
					inputClassName
				)}
			>
				<span className="truncate">{displayValue || placeholder}</span>
				<CalendarIcon className="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" />
			</span>
		</Headless.PopoverButton>
	);
}

// =============================================================================
// SHARED — Panel wrapper with Headless UI positioning + animations
// =============================================================================

function PickerPanel({ children }: { children: React.ReactNode }) {
	return (
		<Headless.PopoverPanel
			transition
			anchor="bottom start"
			className={clsx(
				"z-50 rounded-xl",
				"bg-white shadow-lg ring-1 ring-zinc-950/10 dark:bg-zinc-800 dark:ring-white/10",
				"[--anchor-gap:4px]",
				"transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
			)}
		>
			{children}
		</Headless.PopoverPanel>
	);
}

// =============================================================================
// Shared DayPicker class names for Tailwind theming
// =============================================================================

const dayPickerClassNames = {
	root: "p-3 font-sans",
	months: "flex gap-4",
	month: "flex flex-col gap-2",
	month_caption: "flex items-center justify-between px-1 py-1",
	caption_label: "text-sm font-semibold text-zinc-900 dark:text-white",
	nav: "flex items-center gap-1",
	button_previous:
		"flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors",
	button_next:
		"flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors",
	month_grid: "w-full border-collapse",
	weekdays: "flex",
	weekday: "w-9 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400",
	week: "flex mt-1",
	day: "w-9 h-9 flex items-center justify-center",
	day_button:
		"h-8 w-8 rounded-lg text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
	selected:
		"[&>button]:bg-zinc-900 [&>button]:text-white [&>button]:hover:bg-zinc-800 dark:[&>button]:bg-white dark:[&>button]:text-zinc-900 dark:[&>button]:hover:bg-zinc-100",
	today: "[&>button]:font-bold [&>button]:ring-1 [&>button]:ring-zinc-300 dark:[&>button]:ring-zinc-600",
	outside: "[&>button]:text-zinc-300 dark:[&>button]:text-zinc-600",
	disabled:
		"[&>button]:text-zinc-300 dark:[&>button]:text-zinc-600 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent dark:[&>button]:hover:bg-transparent",
	range_start:
		"[&>button]:bg-zinc-900 [&>button]:text-white [&>button]:rounded-lg dark:[&>button]:bg-white dark:[&>button]:text-zinc-900",
	range_end:
		"[&>button]:bg-zinc-900 [&>button]:text-white [&>button]:rounded-lg dark:[&>button]:bg-white dark:[&>button]:text-zinc-900",
	range_middle:
		"[&>button]:bg-zinc-100 [&>button]:text-zinc-900 [&>button]:rounded-none dark:[&>button]:bg-zinc-700 dark:[&>button]:text-zinc-100",
};

// =============================================================================
// DATE PICKER
// =============================================================================

export interface DatePickerProps {
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	onBlur?: () => void;
	className?: string;
	inputClassName?: string;
	error?: boolean;
	placeholderText?: string;
	dateFormat?: string;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
}

export function DatePicker({
	value,
	onChange,
	className,
	inputClassName,
	error,
	placeholderText = "Select date",
	dateFormat = "MMM d, yyyy",
	disabled,
	minDate,
	maxDate,
}: DatePickerProps) {
	return (
		<Headless.Popover className={clsx("relative", className)}>
			{({ close }) => (
				<>
					<TriggerButton
						displayValue={value ? format(value, dateFormat) : ""}
						placeholder={placeholderText}
						disabled={disabled}
						error={error}
						inputClassName={inputClassName}
					/>
					<PickerPanel>
						<DayPicker
							mode="single"
							selected={value ?? undefined}
							onSelect={(day) => {
								onChange?.(day ?? null);
								close();
							}}
							disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
							classNames={dayPickerClassNames}
						/>
					</PickerPanel>
				</>
			)}
		</Headless.Popover>
	);
}

// =============================================================================
// DATE RANGE PICKER
// =============================================================================

export interface DateRangePickerProps {
	startDate?: Date | null;
	endDate?: Date | null;
	onChange?: (dates: [Date | null, Date | null]) => void;
	className?: string;
	inputClassName?: string;
	error?: boolean;
	placeholderText?: string;
	dateFormat?: string;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
}

export function DateRangePicker({
	startDate,
	endDate,
	onChange,
	className,
	inputClassName,
	error,
	placeholderText = "Select date range",
	dateFormat = "MMM d, yyyy",
	disabled,
	minDate,
	maxDate,
}: DateRangePickerProps) {
	const range: DateRange = {
		from: startDate ?? undefined,
		to: endDate ?? undefined,
	};

	const displayValue =
		startDate && endDate
			? `${format(startDate, dateFormat)} – ${format(endDate, dateFormat)}`
			: startDate
				? format(startDate, dateFormat)
				: "";

	return (
		<Headless.Popover className={clsx("relative", className)}>
			{({ close }) => (
				<>
					<TriggerButton
						displayValue={displayValue}
						placeholder={placeholderText}
						disabled={disabled}
						error={error}
						inputClassName={inputClassName}
					/>
					<PickerPanel>
						<DayPicker
							mode="range"
							selected={range}
							onSelect={(r) => {
								onChange?.([r?.from ?? null, r?.to ?? null]);
								if (r?.from && r?.to) close();
							}}
							disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
							classNames={dayPickerClassNames}
						/>
					</PickerPanel>
				</>
			)}
		</Headless.Popover>
	);
}

// =============================================================================
// TIME PICKER
// =============================================================================

export interface TimePickerProps {
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	className?: string;
	inputClassName?: string;
	error?: boolean;
	timeIntervals?: number;
	placeholderText?: string;
	disabled?: boolean;
}

function generateTimeOptions(intervalMinutes: number): { label: string; value: string }[] {
	const options = [];
	for (let h = 0; h < 24; h++) {
		for (let m = 0; m < 60; m += intervalMinutes) {
			const hour12 = h % 12 || 12;
			const ampm = h < 12 ? "AM" : "PM";
			const label = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
			const value = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
			options.push({ label, value });
		}
	}
	return options;
}

export function TimePicker({
	value,
	onChange,
	className,
	inputClassName,
	error,
	timeIntervals = 15,
	placeholderText = "Select time",
	disabled,
}: TimePickerProps) {
	const options = generateTimeOptions(timeIntervals);

	const displayValue = value ? format(value, "h:mm aa") : "";
	const selectedValue = value
		? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
		: "";

	return (
		<Headless.Popover className={clsx("relative", className)}>
			{({ close }) => (
				<>
					<TriggerButton
						displayValue={displayValue}
						placeholder={placeholderText}
						disabled={disabled}
						error={error}
						inputClassName={inputClassName}
					/>
					<PickerPanel>
						<div className="max-h-56 w-36 overflow-y-auto p-1">
							{options.map((opt) => (
								<button
									key={opt.value}
									type="button"
									onClick={() => {
										const [h, m] = opt.value.split(":").map(Number);
										const d = value ? new Date(value) : new Date();
										d.setHours(h, m, 0, 0);
										onChange?.(d);
										close();
									}}
									className={clsx(
										"w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
										selectedValue === opt.value
											? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											: "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-700"
									)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</PickerPanel>
				</>
			)}
		</Headless.Popover>
	);
}

// =============================================================================
// DATE TIME PICKER
// =============================================================================

export interface DateTimePickerProps {
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	className?: string;
	inputClassName?: string;
	error?: boolean;
	timeIntervals?: number;
	placeholderText?: string;
	dateFormat?: string;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
}

export function DateTimePicker({
	value,
	onChange,
	className,
	inputClassName,
	error,
	timeIntervals = 15,
	placeholderText = "Select date and time",
	dateFormat = "MMM d, yyyy h:mm aa",
	disabled,
	minDate,
	maxDate,
}: DateTimePickerProps) {
	const timeOptions = generateTimeOptions(timeIntervals);

	const selectedTimeValue = value
		? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
		: "";

	return (
		<Headless.Popover className={clsx("relative", className)}>
			{({ close }) => (
				<>
					<TriggerButton
						displayValue={value ? format(value, dateFormat) : ""}
						placeholder={placeholderText}
						disabled={disabled}
						error={error}
						inputClassName={inputClassName}
					/>
					<PickerPanel>
						<div className="flex">
							<DayPicker
								mode="single"
								selected={value ?? undefined}
								onSelect={(day) => {
									if (!day) return;
									const d = value ? new Date(value) : new Date();
									d.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
									onChange?.(d);
								}}
								disabled={[...(minDate ? [{ before: minDate }] : []), ...(maxDate ? [{ after: maxDate }] : [])]}
								classNames={dayPickerClassNames}
							/>
							<div className="max-h-72 w-32 overflow-y-auto border-l border-zinc-200 p-1 dark:border-zinc-700">
								{timeOptions.map((opt) => (
									<button
										key={opt.value}
										type="button"
										onClick={() => {
											const [h, m] = opt.value.split(":").map(Number);
											const d = value ? new Date(value) : new Date();
											d.setHours(h, m, 0, 0);
											onChange?.(d);
											close();
										}}
										className={clsx(
											"w-full rounded-md px-2 py-1 text-left text-sm transition-colors",
											selectedTimeValue === opt.value
												? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
												: "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-700"
										)}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>
					</PickerPanel>
				</>
			)}
		</Headless.Popover>
	);
}
