/**
 * NumberInput - Themed wrapper for react-number-format
 * Provides formatted number inputs (currency, percentages, phone numbers)
 */

import clsx from "clsx";
import { forwardRef } from "react";
import { NumericFormat, type NumericFormatProps, PatternFormat, type PatternFormatProps } from "react-number-format";

// =============================================================================
// CATALYST-MATCHING STYLES (mirrors src/components/input.tsx)
// =============================================================================

const wrapperStyles = (error?: boolean) =>
	clsx(
		"relative block w-full",
		"before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm",
		"dark:before:hidden",
		"after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset sm:focus-within:after:ring-2 sm:focus-within:after:ring-blue-500",
		error && "after:ring-red-500 sm:focus-within:after:ring-red-500"
	);

const inputStyles = (error?: boolean) =>
	clsx(
		"relative block w-full appearance-none rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]",
		"text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white",
		error
			? "border border-red-500 hover:border-red-500 dark:border-red-600 dark:hover:border-red-600"
			: "border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20",
		"bg-transparent dark:bg-white/5",
		"focus:outline-hidden"
	);

// =============================================================================
// NUMERIC INPUT
// =============================================================================

export interface NumberInputProps extends Omit<NumericFormatProps, "customInput" | "size"> {
	/** Error state */
	error?: boolean;
	/** Container class name */
	containerClassName?: string;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
	({ error, className, containerClassName, ...props }, ref) => {
		return (
			<span data-slot="control" className={clsx(wrapperStyles(error), containerClassName)}>
				<NumericFormat getInputRef={ref} className={clsx(inputStyles(error), className)} {...props} />
			</span>
		);
	}
);

NumberInput.displayName = "NumberInput";

// =============================================================================
// CURRENCY INPUT
// =============================================================================

export interface CurrencyInputProps
	extends Omit<NumberInputProps, "prefix" | "thousandSeparator" | "decimalScale" | "fixedDecimalScale"> {
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
		return <NumberInput ref={ref} suffix="%" decimalScale={decimals} placeholder={`${placeholder}%`} {...props} />;
	}
);

PercentageInput.displayName = "PercentageInput";

// =============================================================================
// PATTERN INPUT (Phone, Credit Card, etc.)
// =============================================================================

export interface PatternInputProps extends Omit<PatternFormatProps, "customInput" | "size"> {
	/** Error state */
	error?: boolean;
	/** Container class name */
	containerClassName?: string;
}

export const PatternInput = forwardRef<HTMLInputElement, PatternInputProps>(
	({ error, className, containerClassName, ...props }, ref) => {
		return (
			<span data-slot="control" className={clsx(wrapperStyles(error), containerClassName)}>
				<PatternFormat getInputRef={ref} className={clsx(inputStyles(error), className)} {...props} />
			</span>
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
		return <PatternInput ref={ref} format={format} mask="_" placeholder={placeholder} type="tel" {...props} />;
	}
);

PhoneInput.displayName = "PhoneInput";

// =============================================================================
// CREDIT CARD INPUT
// =============================================================================

export interface CreditCardInputProps extends Omit<PatternInputProps, "format" | "mask"> {}

export const CreditCardInput = forwardRef<HTMLInputElement, CreditCardInputProps>(
	({ placeholder = "1234 5678 9012 3456", ...props }, ref) => {
		return <PatternInput ref={ref} format="#### #### #### ####" mask="_" placeholder={placeholder} {...props} />;
	}
);

CreditCardInput.displayName = "CreditCardInput";

// =============================================================================
// EXPIRY DATE INPUT
// =============================================================================

export interface ExpiryDateInputProps extends Omit<PatternInputProps, "format" | "mask"> {}

export const ExpiryDateInput = forwardRef<HTMLInputElement, ExpiryDateInputProps>(
	({ placeholder = "MM/YY", ...props }, ref) => {
		return <PatternInput ref={ref} format="##/##" mask={["M", "M", "Y", "Y"]} placeholder={placeholder} {...props} />;
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

export const CvvInput = forwardRef<HTMLInputElement, CvvInputProps>(({ length = 3, placeholder, ...props }, ref) => {
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
});

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
