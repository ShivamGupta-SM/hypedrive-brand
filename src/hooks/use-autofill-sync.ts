import { useCallback, useEffect, useRef } from "react";
import type { UseFormSetValue } from "react-hook-form";

/**
 * Syncs browser-autofilled DOM values into react-hook-form state.
 *
 * Browsers (Chrome, Safari, Edge) set input values on autofill without firing
 * React's synthetic onChange, leaving react-hook-form with stale defaultValues.
 *
 * Two complementary strategies:
 *
 * 1. **CSS animation detection** (instant) — Chromium fires a CSS animation on
 *    `:-webkit-autofill`. We listen for `animationstart` and sync values via
 *    `requestAnimationFrame`. Covers Chrome, Edge, Safari (desktop + mobile).
 *
 * 2. **Pre-submit sync** (safety net) — `syncAutofill()` reads DOM values right
 *    before `handleSubmit`, catching Firefox, older browsers, and third-party
 *    password managers (1Password, Bitwarden) that inject after load.
 *
 * Requires the CSS keyframes defined in App.css:
 * ```css
 * @keyframes onAutoFillStart { from {} to {} }
 * input:-webkit-autofill { animation-name: onAutoFillStart; }
 * ```
 *
 * @example
 * ```tsx
 * const { formRef, syncAutofill } = useAutofillSync(setValue, {
 *   email: 'input[name="email"]',
 *   password: 'input[name="password"]',
 * });
 *
 * <form ref={formRef} onSubmit={(e) => { syncAutofill(); handleSubmit(onSubmit)(e); }}>
 * ```
 */
export function useAutofillSync<T extends Record<string, unknown>>(
	setValue: UseFormSetValue<T>,
	fields: Partial<Record<keyof T & string, string>>
) {
	const formRef = useRef<HTMLFormElement>(null);
	const setValueRef = useRef(setValue);
	const fieldsRef = useRef(fields);
	setValueRef.current = setValue;
	fieldsRef.current = fields;

	const syncAllFields = useCallback(() => {
		const form = formRef.current;
		if (!form) return;
		for (const [field, selector] of Object.entries(fieldsRef.current)) {
			const el = form.querySelector<HTMLInputElement>(selector as string);
			if (el?.value) {
				// biome-ignore lint: dynamic field name from caller
				setValueRef.current(field as any, el.value as any, { shouldValidate: true });
			}
		}
	}, []);

	// CSS animation detection — attaches once, never re-attaches
	useEffect(() => {
		const form = formRef.current;
		if (!form) return;

		const onAnimationStart = (e: AnimationEvent) => {
			if (e.animationName === "onAutoFillStart") {
				requestAnimationFrame(syncAllFields);
			}
		};

		form.addEventListener("animationstart", onAnimationStart);
		return () => form.removeEventListener("animationstart", onAnimationStart);
	}, [syncAllFields]);

	return { formRef, syncAutofill: syncAllFields };
}
