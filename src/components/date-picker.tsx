/**
 * DatePicker - Themed wrapper for react-day-picker
 * Provides date selection with Tailwind theme integration
 */

import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import clsx from "clsx";

// =============================================================================
// SHARED
// =============================================================================

const sizeClasses = {
	sm: "h-8 px-2 text-sm",
	md: "h-[38px] px-3 text-sm",
	lg: "h-11 px-4 text-base",
};

function TriggerInput({
	displayValue,
	placeholder,
	disabled,
	error,
	size,
	inputClassName,
	onClick,
}: {
	displayValue: string;
	placeholder: string;
	disabled?: boolean;
	error?: boolean;
	size: "sm" | "md" | "lg";
	inputClassName?: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className={clsx(
				"w-full rounded-lg border bg-transparent text-left outline-none transition-colors",
				"text-zinc-900 dark:text-white",
				!displayValue && "text-zinc-400 dark:text-zinc-500",
				error
					? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
					: "border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500",
				"disabled:cursor-not-allowed disabled:opacity-50",
				sizeClasses[size],
				inputClassName
			)}
		>
			{displayValue || placeholder}
		</button>
	);
}

function Popover({
	open,
	onClose,
	children,
}: {
	open: boolean;
	onClose: () => void;
	children: React.ReactNode;
}) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				onClose();
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div
			ref={ref}
			className="absolute z-50 mt-1 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800"
		>
			{children}
		</div>
	);
}

// Shared DayPicker class names for Tailwind theming
const dayPickerClassNames = {
	root: "p-3 font-sans",
	months: "flex gap-4",
	month: "flex flex-col gap-2",
	month_caption: "flex items-center justify-between px-1 py-1",
	caption_label: "text-sm font-semibold text-zinc-900 dark:text-white",
	nav: "flex items-center gap-1",
	button_previous:
		"flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white",
	button_next:
		"flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-white",
	month_grid: "w-full border-collapse",
	weekdays: "flex",
	weekday: "w-9 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400",
	week: "flex mt-1",
	day: "w-9 h-9 flex items-center justify-center",
	day_button:
		"h-8 w-8 rounded-lg text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
	selected:
		"[&>button]:bg-blue-500 [&>button]:text-white [&>button]:hover:bg-blue-600 dark:[&>button]:hover:bg-blue-400",
	today: "[&>button]:font-bold",
	outside: "[&>button]:text-zinc-400 dark:[&>button]:text-zinc-600",
	disabled: "[&>button]:text-zinc-300 dark:[&>button]:text-zinc-600 [&>button]:cursor-not-allowed",
	range_start:
		"[&>button]:bg-blue-500 [&>button]:text-white [&>button]:rounded-lg",
	range_end:
		"[&>button]:bg-blue-500 [&>button]:text-white [&>button]:rounded-lg",
	range_middle:
		"[&>button]:bg-blue-100 [&>button]:text-blue-900 [&>button]:rounded-none dark:[&>button]:bg-blue-900/30 dark:[&>button]:text-blue-100",
};

// =============================================================================
// DATE PICKER
// =============================================================================

export interface DatePickerProps {
	value?: Date | null;
	onChange?: (date: Date | null) => void;
	className?: string;
	inputClassName?: string;
	error?: boolean;
	size?: "sm" | "md" | "lg";
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
	size = "md",
	placeholderText = "Select date",
	dateFormat = "MMM d, yyyy",
	disabled,
	minDate,
	maxDate,
}: DatePickerProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className={clsx("relative", className)}>
			<TriggerInput
				displayValue={value ? format(value, dateFormat) : ""}
				placeholder={placeholderText}
				disabled={disabled}
				error={error}
				size={size}
				inputClassName={inputClassName}
				onClick={() => setOpen((v) => !v)}
			/>
			<Popover open={open} onClose={() => setOpen(false)}>
				<DayPicker
					mode="single"
					selected={value ?? undefined}
					onSelect={(day) => {
						onChange?.(day ?? null);
						setOpen(false);
					}}
					disabled={[
						...(minDate ? [{ before: minDate }] : []),
						...(maxDate ? [{ after: maxDate }] : []),
					]}
					classNames={dayPickerClassNames}
				/>
			</Popover>
		</div>
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
	size?: "sm" | "md" | "lg";
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
	size = "md",
	placeholderText = "Select date range",
	dateFormat = "MMM d, yyyy",
	disabled,
	minDate,
	maxDate,
}: DateRangePickerProps) {
	const [open, setOpen] = useState(false);

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
		<div className={clsx("relative", className)}>
			<TriggerInput
				displayValue={displayValue}
				placeholder={placeholderText}
				disabled={disabled}
				error={error}
				size={size}
				inputClassName={inputClassName}
				onClick={() => setOpen((v) => !v)}
			/>
			<Popover open={open} onClose={() => setOpen(false)}>
				<DayPicker
					mode="range"
					selected={range}
					onSelect={(r) => {
						onChange?.([r?.from ?? null, r?.to ?? null]);
						if (r?.from && r?.to) setOpen(false);
					}}
					disabled={[
						...(minDate ? [{ before: minDate }] : []),
						...(maxDate ? [{ after: maxDate }] : []),
					]}
					classNames={dayPickerClassNames}
				/>
			</Popover>
		</div>
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
	size?: "sm" | "md" | "lg";
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
	size = "md",
	timeIntervals = 15,
	placeholderText = "Select time",
	disabled,
}: TimePickerProps) {
	const [open, setOpen] = useState(false);
	const options = generateTimeOptions(timeIntervals);

	const displayValue = value ? format(value, "h:mm aa") : "";
	const selectedValue = value
		? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
		: "";

	return (
		<div className={clsx("relative", className)}>
			<TriggerInput
				displayValue={displayValue}
				placeholder={placeholderText}
				disabled={disabled}
				error={error}
				size={size}
				inputClassName={inputClassName}
				onClick={() => setOpen((v) => !v)}
			/>
			<Popover open={open} onClose={() => setOpen(false)}>
				<div className="max-h-56 overflow-y-auto p-1 w-36">
					{options.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => {
								const [h, m] = opt.value.split(":").map(Number);
								const d = value ? new Date(value) : new Date();
								d.setHours(h, m, 0, 0);
								onChange?.(d);
								setOpen(false);
							}}
							className={clsx(
								"w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
								selectedValue === opt.value
									? "bg-blue-500 text-white"
									: "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-700"
							)}
						>
							{opt.label}
						</button>
					))}
				</div>
			</Popover>
		</div>
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
	size?: "sm" | "md" | "lg";
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
	size = "md",
	timeIntervals = 15,
	placeholderText = "Select date and time",
	dateFormat = "MMM d, yyyy h:mm aa",
	disabled,
	minDate,
	maxDate,
}: DateTimePickerProps) {
	const [open, setOpen] = useState(false);
	const timeOptions = generateTimeOptions(timeIntervals);

	const selectedTimeValue = value
		? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
		: "";

	return (
		<div className={clsx("relative", className)}>
			<TriggerInput
				displayValue={value ? format(value, dateFormat) : ""}
				placeholder={placeholderText}
				disabled={disabled}
				error={error}
				size={size}
				inputClassName={inputClassName}
				onClick={() => setOpen((v) => !v)}
			/>
			<Popover open={open} onClose={() => setOpen(false)}>
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
						disabled={[
							...(minDate ? [{ before: minDate }] : []),
							...(maxDate ? [{ after: maxDate }] : []),
						]}
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
									setOpen(false);
								}}
								className={clsx(
									"w-full rounded-md px-2 py-1 text-left text-sm transition-colors",
									selectedTimeValue === opt.value
										? "bg-blue-500 text-white"
										: "text-zinc-900 hover:bg-zinc-100 dark:text-white dark:hover:bg-zinc-700"
								)}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>
			</Popover>
		</div>
	);
}
