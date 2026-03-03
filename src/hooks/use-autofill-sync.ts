import { useCallback, useRef } from "react";
import type { UseFormSetValue } from "react-hook-form";

/**
 * Syncs browser-autofilled DOM values into react-hook-form state before submit.
 *
 * Browsers (especially Chrome and Safari) set input values programmatically on
 * autofill without firing React's synthetic onChange. This leaves react-hook-form
 * with stale defaultValues, causing validation to fail on submit.
 *
 * Usage:
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

	const syncAutofill = useCallback(() => {
		const form = formRef.current;
		if (!form) return;
		for (const [field, selector] of Object.entries(fields)) {
			const el = form.querySelector<HTMLInputElement>(selector as string);
			if (el?.value) {
				// biome-ignore lint: dynamic field name from caller
				setValue(field as any, el.value as any);
			}
		}
	}, [setValue, fields]);

	return { formRef, syncAutofill };
}
