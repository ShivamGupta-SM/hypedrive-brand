/**
 * NumberInput - Themed wrapper for react-number-format
 * Provides formatted number inputs (currency, percentages, phone numbers)
 */

import clsx from "clsx";
import { forwardRef } from "react";
import {
	NumericFormat,
	type NumericFormatProps,
	PatternFormat,
	type PatternFormatProps,
} from "react-number-format";

// =============================================================================
// BASE STYLES
// =============================================================================

const baseInputStyles = (size: "sm" | "md" | "lg", error?: boolean) =>
	clsx(
		"w-full rounded-lg border bg-transparent outline-none transition-colors",
		"text-zinc-900 placeholder:text-zinc-400 dark:text-white dark:placeholder:text-zinc-500",
		error
			? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
			: "border-zinc-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:focus:border-blue-500",
		size === "sm"
			? "h-8 px-2 text-sm"
			: size === "lg"
				? "h-11 px-4 text-base"
				: "h-[38px] px-3 text-sm"
	);

// =============================================================================
// NUMERIC INPUT
// =============================================================================

export interface NumberInputProps extends Omit<NumericFormatProps, "customInput" | "size"> {
	/** Size variant */
	size?: "sm" | "md" | "lg";
	/** Error state */
	error?: boolean;
	/** Container class name */
	containerClassName?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
	({ size = "md", error, className, containerClassName, ...props }, ref) => {
		return (
			<div className={containerClassName}>
				<NumericFormat
					getInputRef={ref}
					className={clsx(baseInputStyles(size, error), className)}
					{...props}
				/>
			</div>
		);
	}
);

NumberInput.displayName = "NumberInput";

// =============================================================================
// CURRENCY INPUT
// =============================================================================

export interface CurrencyInputProps
	extends Omit<
		NumberInputProps,
		"prefix" | "thousandSeparator" | "decimalScale" | "fixedDecimalScale"
	> {
	/** Currency symbol */
	currency?: string;
	/** Number of decimal places */
	decimals?: number;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
	({ currency = "$", decimals = 2, placeholder = "0.00", ...props }, ref) => {
		return (
			<NumberInput
				ref={ref}
				prefix={currency}
				thousandSeparator=","
				decimalScale={decimals}
				fixedDecimalScale
				placeholder={`${currency}${placeholder}`}
				{...props}
			/>
		);
	}
);

CurrencyInput.displayName = "CurrencyInput";

// =============================================================================
// PERCENTAGE INPUT
// =============================================================================

export interface PercentageInputProps extends Omit<NumberInputProps, "suffix" | "decimalScale"> {
	/** Number of decimal places */
	decimals?: number;
}

export const PercentageInput = forwardRef<HTMLInputElement, PercentageInputProps>(
	({ decimals = 1, placeholder = "0", ...props }, ref) => {
		return (
			<NumberInput
				ref={ref}
				suffix="%"
				decimalScale={decimals}
				placeholder={`${placeholder}%`}
				{...props}
			/>
		);
	}
);

PercentageInput.displayName = "PercentageInput";

// =============================================================================
// PATTERN INPUT (Phone, Credit Card, etc.)
// =============================================================================

export interface PatternInputProps extends Omit<PatternFormatProps, "customInput" | "size"> {
	/** Size variant */
	size?: "sm" | "md" | "lg";
	/** Error state */
	error?: boolean;
	/** Container class name */
	containerClassName?: string;
}

export const PatternInput = forwardRef<HTMLInputElement, PatternInputProps>(
	({ size = "md", error, className, containerClassName, ...props }, ref) => {
		return (
			<div className={containerClassName}>
				<PatternFormat
					getInputRef={ref}
					className={clsx(baseInputStyles(size, error), className)}
					{...props}
				/>
			</div>
		);
	}
);

PatternInput.displayName = "PatternInput";

// =============================================================================
// PHONE INPUT
// =============================================================================

export interface PhoneInputProps extends Omit<PatternInputProps, "format" | "mask"> {
	/** Phone format pattern */
	format?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
	({ format = "(###) ###-####", placeholder = "(555) 123-4567", ...props }, ref) => {
		return (
			<PatternInput
				ref={ref}
				format={format}
				mask="_"
				placeholder={placeholder}
				type="tel"
				{...props}
			/>
		);
	}
);

PhoneInput.displayName = "PhoneInput";

// =============================================================================
// CREDIT CARD INPUT
// =============================================================================

export interface CreditCardInputProps extends Omit<PatternInputProps, "format" | "mask"> {}

export const CreditCardInput = forwardRef<HTMLInputElement, CreditCardInputProps>(
	({ placeholder = "1234 5678 9012 3456", ...props }, ref) => {
		return (
			<PatternInput
				ref={ref}
				format="#### #### #### ####"
				mask="_"
				placeholder={placeholder}
				{...props}
			/>
		);
	}
);

CreditCardInput.displayName = "CreditCardInput";

// =============================================================================
// EXPIRY DATE INPUT
// =============================================================================

export interface ExpiryDateInputProps extends Omit<PatternInputProps, "format" | "mask"> {}

export const ExpiryDateInput = forwardRef<HTMLInputElement, ExpiryDateInputProps>(
	({ placeholder = "MM/YY", ...props }, ref) => {
		return (
			<PatternInput
				ref={ref}
				format="##/##"
				mask={["M", "M", "Y", "Y"]}
				placeholder={placeholder}
				{...props}
			/>
		);
	}
);

ExpiryDateInput.displayName = "ExpiryDateInput";

// =============================================================================
// CVV INPUT
// =============================================================================

export interface CvvInputProps extends Omit<PatternInputProps, "format" | "mask"> {
	/** CVV length (3 or 4) */
	length?: 3 | 4;
}

export const CvvInput = forwardRef<HTMLInputElement, CvvInputProps>(
	({ length = 3, placeholder, ...props }, ref) => {
		return (
			<PatternInput
				ref={ref}
				format={length === 4 ? "####" : "###"}
				mask="_"
				placeholder={placeholder || (length === 4 ? "0000" : "000")}
				type="password"
				{...props}
			/>
		);
	}
);

CvvInput.displayName = "CvvInput";

// =============================================================================
// ZIP CODE INPUT
// =============================================================================

export interface ZipCodeInputProps extends Omit<PatternInputProps, "format" | "mask"> {
	/** Include +4 extension */
	extended?: boolean;
}

export const ZipCodeInput = forwardRef<HTMLInputElement, ZipCodeInputProps>(
	({ extended = false, placeholder, ...props }, ref) => {
		return (
			<PatternInput
				ref={ref}
				format={extended ? "#####-####" : "#####"}
				mask="_"
				placeholder={placeholder || (extended ? "12345-6789" : "12345")}
				{...props}
			/>
		);
	}
);

ZipCodeInput.displayName = "ZipCodeInput";
