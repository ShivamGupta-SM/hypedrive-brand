import { ArrowLeftIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, KeyIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useUpdatePassword } from "@/features/auth/hooks";
import { useConfetti } from "@/hooks";
import { useAutofillSync } from "@/hooks/use-autofill-sync";
import { Route } from "@/routes/_auth/reset-password";
import { FormError } from "./components";
import { AuthShell } from "./login";

const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(/[A-Z]/, "Must contain an uppercase letter")
			.regex(/[a-z]/, "Must contain a lowercase letter")
			.regex(/[0-9]/, "Must contain a number"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Password strength ────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
	if (!password) return null;

	const checks = [
		{ label: "8+ characters", valid: password.length >= 8 },
		{ label: "Uppercase", valid: /[A-Z]/.test(password) },
		{ label: "Lowercase", valid: /[a-z]/.test(password) },
		{ label: "Number", valid: /[0-9]/.test(password) },
	];

	return (
		<div className="mt-2 grid grid-cols-2 gap-1.5">
			{checks.map((check) => (
				<div key={check.label} className="flex items-center gap-1.5">
					{check.valid ? (
						<CheckCircleIcon className="size-3.5 shrink-0 text-emerald-500" />
					) : (
						<XCircleIcon className="size-3.5 shrink-0 text-zinc-300 dark:text-zinc-600" />
					)}
					<span
						className={`text-xs ${check.valid ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400 dark:text-zinc-500"}`}
					>
						{check.label}
					</span>
				</div>
			))}
		</div>
	);
}

// ─── Invalid token ────────────────────────────────────────────────────────────

function InvalidToken() {
	return (
		<AuthShell>
			<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />

			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
					<XCircleIcon className="size-7 text-red-500 dark:text-red-400" />
				</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Link expired</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					This password reset link is invalid or has expired.
				</p>
			</div>

			<Button href="/forgot-password" className="w-full" color="dark/zinc">
				Request a new link
			</Button>

			<div className="text-center">
				<TextLink
					href="/login"
					className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					<ArrowLeftIcon className="size-3.5" />
					Back to sign in
				</TextLink>
			</div>
		</AuthShell>
	);
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState() {
	const navigate = useNavigate();
	const { fire } = useConfetti();

	useEffect(() => {
		fire("burst");
	}, [fire]);
	useEffect(() => {
		const t = setTimeout(() => navigate({ to: "/login" }), 3000);
		return () => clearTimeout(t);
	}, [navigate]);

	return (
		<AuthShell>
			<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />

			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
					<CheckCircleIcon className="size-7 text-emerald-500 dark:text-emerald-400" />
				</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Password updated</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					Your password has been reset. Redirecting to sign in…
				</p>
			</div>

			<Button href="/login" className="w-full" color="dark/zinc">
				Sign in now
			</Button>
		</AuthShell>
	);
}

// ─── Reset password ───────────────────────────────────────────────────────────

export function ResetPassword() {
	const { token } = Route.useSearch();
	const resetPassword = useUpdatePassword();
	const isPending = resetPassword.isPending;
	const [success, setSuccess] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<ResetPasswordFormData>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	const { formRef, syncAutofill } = useAutofillSync(setValue, {
		password: 'input[name="password"]',
		confirmPassword: 'input[name="confirmPassword"]',
	});

	const passwordValue = watch("password");

	if (!token) return <InvalidToken />;
	if (success) return <SuccessState />;

	const onSubmit = (data: ResetPasswordFormData) => {
		setServerError(null);
		resetPassword.mutate(
			{ token, newPassword: data.password },
			{
				onSuccess: () => setSuccess(true),
				onError: (err) => setServerError(err.message || "Failed to reset password. The link may have expired."),
			}
		);
	};

	const displayError = errors.password?.message || errors.confirmPassword?.message || serverError;

	return (
		<AuthShell
			footer={
				<p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
					Remembered it?{" "}
					<TextLink href="/login">
						<Strong>Sign in</Strong>
					</TextLink>
				</p>
			}
		>
			{/* Header */}
			<div>
				<Logo className="mb-4 h-7 w-auto text-zinc-950 dark:text-white" />
				<div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
					<KeyIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
				</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Create new password</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Choose a strong password for your account.</p>
			</div>

			{/* Form */}
			<form
				ref={formRef}
				onSubmit={(e) => {
					syncAutofill();
					handleSubmit(onSubmit)(e);
				}}
				className="space-y-3"
			>
				<FormError message={displayError} />

				<Field>
					<Label>New password</Label>
					<div className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							{...register("password")}
							disabled={isPending}
							autoComplete="new-password"
							placeholder="Enter new password"
							data-invalid={errors.password ? true : undefined}
						/>
						<button
							type="button"
							onClick={() => setShowPassword((p) => !p)}
							tabIndex={-1}
							aria-label={showPassword ? "Hide password" : "Show password"}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
						>
							{showPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
						</button>
					</div>
					<PasswordStrength password={passwordValue} />
				</Field>

				<Field>
					<Label>Confirm password</Label>
					<div className="relative">
						<Input
							type={showConfirmPassword ? "text" : "password"}
							{...register("confirmPassword")}
							disabled={isPending}
							autoComplete="new-password"
							placeholder="Confirm new password"
							data-invalid={errors.confirmPassword ? true : undefined}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword((p) => !p)}
							tabIndex={-1}
							aria-label={showConfirmPassword ? "Hide password" : "Show password"}
							className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
						>
							{showConfirmPassword ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
						</button>
					</div>
				</Field>

				<Button type="submit" className="w-full" color="dark/zinc" disabled={isPending}>
					{isPending ? "Resetting…" : "Reset password"}
				</Button>
			</form>

			<div className="text-center">
				<TextLink
					href="/login"
					className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
				>
					<ArrowLeftIcon className="size-3.5" />
					Back to sign in
				</TextLink>
			</div>
		</AuthShell>
	);
}
