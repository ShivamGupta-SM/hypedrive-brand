import {
	CheckCircleIcon,
	EnvelopeIcon,
	EyeIcon,
	EyeSlashIcon,
	ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useConfetti, useSendVerificationEmail } from "@/hooks";
import { useRegister, useSocialLogin } from "@/store/auth-store";
import { FormError } from "./components";
import { AuthShell } from "./login";

const registerSchema = z.object({
	email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
	name: z.string().min(1, "Please enter your full name").min(2, "Name must be at least 2 characters"),
	password: z.string().min(1, "Please enter a password").min(8, "Password must be at least 8 characters"),
	acceptTerms: z.boolean().refine((val) => val === true, "Please accept the terms and conditions"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

function GoogleIcon() {
	return (
		<svg className="size-4.5" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
		</svg>
	);
}

function AppleIcon() {
	return (
		<svg className="size-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
		</svg>
	);
}

function OAuthButton({
	icon,
	label,
	disabled,
	onClick,
}: {
	icon: React.ReactNode;
	label: string;
	disabled?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			className="flex h-10 w-full items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
		>
			{icon}
			{label}
		</button>
	);
}

// ─── Verify email screen ──────────────────────────────────────────────────────

function VerifyEmailScreen({
	email,
	onResend,
	isResending,
}: {
	email: string;
	onResend: () => void;
	isResending: boolean;
}) {
	const { fire } = useConfetti();
	useEffect(() => { fire("side-cannons"); }, [fire]);

	return (
		<AuthShell>
			<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />

			<div className="text-center">
				<div className="relative mx-auto mb-5 flex size-16 items-center justify-center">
					<div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
					<div className="relative flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
						<CheckCircleIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
					</div>
				</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Check your inbox</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					We sent a verification link to{" "}
					<span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
				</p>
			</div>

			<div className="space-y-3">
				<div className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs dark:bg-zinc-700">
						<EnvelopeIcon className="size-4 text-zinc-500 dark:text-zinc-400" />
					</div>
					<div>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">Didn't receive it?</p>
						<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
							Check spam or{" "}
							<button
								type="button"
								onClick={onResend}
								disabled={isResending}
								className="font-medium text-zinc-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-zinc-300"
							>
								{isResending ? "sending…" : "resend"}
							</button>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
					<ShieldCheckIcon className="size-4 shrink-0 text-amber-500" />
					<p className="text-xs text-amber-700 dark:text-amber-300">Links expire after 24 hours</p>
				</div>

				<Button href="/login" className="w-full" outline>Back to sign in</Button>
			</div>
		</AuthShell>
	);
}

// ─── Register ─────────────────────────────────────────────────────────────────

export function Register() {
	const { mutate: registerUser, isPending } = useRegister();
	const { mutate: socialLogin, isPending: isSocialPending } = useSocialLogin();
	const sendVerification = useSendVerificationEmail();
	const [showPassword, setShowPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

	const handleSocialLogin = useCallback(
		(provider: "google" | "apple") => {
			socialLogin(provider, {
				onSuccess: (redirectUrl) => { if (redirectUrl) window.location.href = redirectUrl; },
				onError: (err) => setServerError(err.message || "Social login failed."),
			});
		},
		[socialLogin]
	);

	const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: { email: "", name: "", password: "", acceptTerms: false },
	});

	const acceptTerms = watch("acceptTerms");

	const handleResendVerification = useCallback(() => {
		if (!registeredEmail) return;
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		sendVerification.mutate({ email: registeredEmail, callbackURL: `${origin}/verify-email` });
	}, [registeredEmail, sendVerification]);

	const onSubmit = async (data: RegisterFormData) => {
		setServerError(null);
		registerUser(
			{ email: data.email, password: data.password, name: data.name },
			{
				onSuccess: () => {
					const origin = typeof window !== "undefined" ? window.location.origin : "";
					sendVerification.mutate({ email: data.email, callbackURL: `${origin}/verify-email` });
					setRegisteredEmail(data.email);
				},
				onError: (err) => {
					const error = err as Error;
					setServerError(error.message || "Registration failed. Please try again.");
				},
			}
		);
	};

	if (registeredEmail) {
		return (
			<VerifyEmailScreen
				email={registeredEmail}
				onResend={handleResendVerification}
				isResending={sendVerification.isPending}
			/>
		);
	}

	const displayError = errors.email?.message || errors.name?.message || errors.password?.message || errors.acceptTerms?.message || serverError;
	const anyPending = isPending || isSocialPending;

	return (
		<AuthShell
			footer={
				<p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
					Already have an account?{" "}
					<TextLink href="/login"><Strong>Sign in</Strong></TextLink>
				</p>
			}
		>
			{/* Header */}
			<div>
				<Logo className="mb-4 h-7" />
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Create an account</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Launch campaigns, manage enrollments, and grow your brand</p>
			</div>

			{/* OAuth */}
			<div className="grid grid-cols-2 gap-2">
				<OAuthButton disabled={anyPending} onClick={() => handleSocialLogin("google")} icon={<GoogleIcon />} label="Google" />
				<OAuthButton disabled={anyPending} onClick={() => handleSocialLogin("apple")} icon={<AppleIcon />} label="Apple" />
			</div>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-white px-2 text-xs text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">or continue with email</span>
				</div>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<FormError message={displayError} />

				<Field>
					<Label>Full name</Label>
					<Input
						type="text"
						{...register("name")}
						disabled={anyPending}
						autoComplete="name"
						autoCapitalize="words"
						placeholder="John Doe"
						data-invalid={errors.name ? true : undefined}
					/>
				</Field>

				<Field>
					<Label>Email</Label>
					<Input
						type="email"
						{...register("email")}
						disabled={anyPending}
						autoComplete="email"
						autoCapitalize="none"
						inputMode="email"
						placeholder="you@example.com"
						data-invalid={errors.email ? true : undefined}
					/>
				</Field>

				<Field>
					<Label>Password</Label>
					<div className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							{...register("password")}
							disabled={anyPending}
							autoComplete="new-password"
							placeholder="Min. 8 characters"
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
				</Field>

				<CheckboxField>
					<Checkbox
						name="terms"
						checked={acceptTerms}
						onChange={(checked) => setValue("acceptTerms", checked, { shouldValidate: true })}
						disabled={anyPending}
					/>
					<Label className="text-sm font-normal text-zinc-600 dark:text-zinc-400">
						I agree to the{" "}
						<TextLink href="/terms" target="_blank">Terms of Service</TextLink>
						{" "}and{" "}
						<TextLink href="/privacy" target="_blank">Privacy Policy</TextLink>
					</Label>
				</CheckboxField>

				<Button type="submit" className="w-full" color="dark/zinc" disabled={anyPending}>
					{isPending ? "Creating account…" : "Create account"}
				</Button>
			</form>
		</AuthShell>
	);
}
