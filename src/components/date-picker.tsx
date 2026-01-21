/**
 * DatePicker - Themed wrapper for react-datepicker
 * Provides date selection with Catalyst theme integration
 */

import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import clsx from "clsx";

// =============================================================================
// SIZE CLASSES
// =============================================================================

const sizeClasses = {
  sm: "h-8 px-2 text-sm",
  md: "h-[38px] px-3 text-sm",
  lg: "h-11 px-4 text-base",
};

// =============================================================================
// DATE PICKER
// =============================================================================

export interface DatePickerProps {
  /** Selected date */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Container class name */
  className?: string;
  /** Input class name */
  inputClassName?: string;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Placeholder text */
  placeholderText?: string;
  /** Date format */
  dateFormat?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Min date */
  minDate?: Date;
  /** Max date */
  maxDate?: Date;
  /** Show month dropdown */
  showMonthDropdown?: boolean;
  /** Show year dropdown */
  showYearDropdown?: boolean;
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
  showMonthDropdown,
  showYearDropdown,
}: DatePickerProps) {
  return (
    <div className={clsx("date-picker-wrapper", className)}>
      <ReactDatePicker
        selected={value}
        onChange={(date: Date | null) => onChange?.(date)}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        showMonthDropdown={showMonthDropdown}
        showYearDropdown={showYearDropdown}
        dropdownMode="select"
        className={clsx(
          "w-full rounded-lg border bg-transparent outline-none transition-colors",
          "text-zinc-900 placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500",
          sizeClasses[size],
          inputClassName
        )}
        calendarClassName="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !rounded-xl !shadow-xl"
        dayClassName={() =>
          "!rounded-lg hover:!bg-zinc-100 dark:hover:!bg-zinc-700"
        }
      />
    </div>
  );
}

// =============================================================================
// DATE RANGE PICKER
// =============================================================================

export interface DateRangePickerProps {
  /** Start date */
  startDate?: Date | null;
  /** End date */
  endDate?: Date | null;
  /** Change handler */
  onChange?: (dates: [Date | null, Date | null]) => void;
  /** Container class name */
  className?: string;
  /** Input class name */
  inputClassName?: string;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Placeholder text */
  placeholderText?: string;
  /** Date format */
  dateFormat?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Min date */
  minDate?: Date;
  /** Max date */
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
  return (
    <div className={clsx("date-picker-wrapper", className)}>
      <ReactDatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={(dates) => {
          const [start, end] = dates as [Date | null, Date | null];
          onChange?.([start, end]);
        }}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        className={clsx(
          "w-full rounded-lg border bg-transparent outline-none transition-colors",
          "text-zinc-900 placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500",
          sizeClasses[size],
          inputClassName
        )}
        calendarClassName="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !rounded-xl !shadow-xl"
        dayClassName={() =>
          "!rounded-lg hover:!bg-zinc-100 dark:hover:!bg-zinc-700"
        }
      />
    </div>
  );
}

// =============================================================================
// TIME PICKER
// =============================================================================

export interface TimePickerProps {
  /** Selected time */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Container class name */
  className?: string;
  /** Input class name */
  inputClassName?: string;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Time interval in minutes */
  timeIntervals?: number;
  /** Placeholder text */
  placeholderText?: string;
  /** Date format */
  dateFormat?: string;
  /** Disabled state */
  disabled?: boolean;
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
  dateFormat = "h:mm aa",
  disabled,
}: TimePickerProps) {
  return (
    <div className={clsx("date-picker-wrapper", className)}>
      <ReactDatePicker
        selected={value}
        onChange={(date: Date | null) => onChange?.(date)}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={timeIntervals}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        disabled={disabled}
        className={clsx(
          "w-full rounded-lg border bg-transparent outline-none transition-colors",
          "text-zinc-900 placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500",
          sizeClasses[size],
          inputClassName
        )}
        calendarClassName="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !rounded-xl !shadow-xl"
      />
    </div>
  );
}

// =============================================================================
// DATE TIME PICKER
// =============================================================================

export interface DateTimePickerProps {
  /** Selected date/time */
  value?: Date | null;
  /** Change handler */
  onChange?: (date: Date | null) => void;
  /** Container class name */
  className?: string;
  /** Input class name */
  inputClassName?: string;
  /** Error state */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Time interval in minutes */
  timeIntervals?: number;
  /** Placeholder text */
  placeholderText?: string;
  /** Date format */
  dateFormat?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Min date */
  minDate?: Date;
  /** Max date */
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
  return (
    <div className={clsx("date-picker-wrapper", className)}>
      <ReactDatePicker
        selected={value}
        onChange={(date: Date | null) => onChange?.(date)}
        showTimeSelect
        timeIntervals={timeIntervals}
        placeholderText={placeholderText}
        dateFormat={dateFormat}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        className={clsx(
          "w-full rounded-lg border bg-transparent outline-none transition-colors",
          "text-zinc-900 placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500",
          sizeClasses[size],
          inputClassName
        )}
        calendarClassName="!bg-white dark:!bg-zinc-800 !border-zinc-200 dark:!border-zinc-700 !rounded-xl !shadow-xl"
        dayClassName={() =>
          "!rounded-lg hover:!bg-zinc-100 dark:hover:!bg-zinc-700"
        }
      />
    </div>
  );
}
