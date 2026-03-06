import { CheckCircleIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, ShieldCheckIcon } from "@heroicons/react/16/solid";
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
import { useRegister, useSocialLogin } from "@/features/auth/hooks";
import { useSendVerificationEmail } from "@/features/auth/hooks-account";
import { useAutofillSync } from "@/hooks/use-autofill-sync";
import { useConfetti } from "@/hooks/use-confetti";
import { AppleIcon, FormError, GoogleIcon, OAuthButton } from "./components";
import { AuthShell } from "./login";

const registerSchema = z.object({
	email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
	name: z.string().min(1, "Please enter your full name").min(2, "Name must be at least 2 characters"),
	password: z.string().min(1, "Please enter a password").min(8, "Password must be at least 8 characters"),
	acceptTerms: z.boolean().refine((val) => val === true, "Please accept the terms and conditions"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

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
	useEffect(() => {
		fire("side-cannons");
	}, [fire]);

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
					We sent a verification link to <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
				</p>
			</div>

			<div className="space-y-3">
				<div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
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

				<Button href="/login" className="w-full" outline>
					Back to sign in
				</Button>
			</div>
		</AuthShell>
	);
}

// ─── Register ─────────────────────────────────────────────────────────────────

export function Register() {
	const registerMutation = useRegister();
	const socialLogin = useSocialLogin();
	const sendVerification = useSendVerificationEmail();
	const [showPassword, setShowPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

	const isPending = registerMutation.isPending;
	const isSocialPending = socialLogin.isPending;

	const handleSocialLogin = useCallback(
		(provider: "google" | "apple") => {
			socialLogin.mutate(provider, {
				onSuccess: (data) => {
					if ("redirectUrl" in data && data.redirectUrl) window.location.href = data.redirectUrl;
				},
				onError: (err) => setServerError(err.message || "Social login failed."),
			});
		},
		[socialLogin]
	);

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: { email: "", name: "", password: "", acceptTerms: false },
	});

	const { formRef, syncAutofill } = useAutofillSync(setValue, {
		name: 'input[name="name"]',
		email: 'input[name="email"]',
		password: 'input[name="password"]',
	});

	const acceptTerms = watch("acceptTerms");

	const handleResendVerification = useCallback(() => {
		if (!registeredEmail) return;
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		sendVerification.mutate({ email: registeredEmail, callbackURL: `${origin}/verify-email` });
	}, [registeredEmail, sendVerification]);

	const onSubmit = (data: RegisterFormData) => {
		setServerError(null);
		registerMutation.mutate(
			{ email: data.email, password: data.password, name: data.name },
			{
				onSuccess: () => {
					const origin = typeof window !== "undefined" ? window.location.origin : "";
					sendVerification.mutate({ email: data.email, callbackURL: `${origin}/verify-email` });
					setRegisteredEmail(data.email);
				},
				onError: (err) => {
					setServerError(err.message || "Registration failed. Please try again.");
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

	const displayError =
		errors.email?.message ||
		errors.name?.message ||
		errors.password?.message ||
		errors.acceptTerms?.message ||
		serverError;
	const anyPending = isPending || isSocialPending;

	return (
		<AuthShell
			footer={
				<p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
					Already have an account?{" "}
					<TextLink href="/login">
						<Strong>Sign in</Strong>
					</TextLink>
				</p>
			}
		>
			{/* Header */}
			<div>
				<Logo className="mb-4 h-7 w-auto text-zinc-950 dark:text-white" />
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Create an account</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					Launch campaigns, manage enrollments, and grow your brand
				</p>
			</div>

			{/* OAuth */}
			<div className="grid grid-cols-2 gap-2">
				<OAuthButton
					disabled={anyPending}
					onClick={() => handleSocialLogin("google")}
					icon={<GoogleIcon />}
					label="Google"
				/>
				<OAuthButton
					disabled={anyPending}
					onClick={() => handleSocialLogin("apple")}
					icon={<AppleIcon />}
					label="Apple"
				/>
			</div>

			{/* Divider */}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
				</div>
				<div className="relative flex justify-center">
					<span className="bg-white px-2 text-xs text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500">
						or continue with email
					</span>
				</div>
			</div>

			{/* Form */}
			<form
				ref={formRef}
				onSubmit={(e) => {
					syncAutofill();
					handleSubmit(onSubmit)(e);
				}}
				className="space-y-3"
				autoComplete="on"
			>
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
						autoCorrect="off"
						spellCheck={false}
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
						<TextLink href="/terms" target="_blank">
							Terms of Service
						</TextLink>{" "}
						and{" "}
						<TextLink href="/privacy" target="_blank">
							Privacy Policy
						</TextLink>
					</Label>
				</CheckboxField>

				<Button type="submit" className="w-full" color="dark/zinc" disabled={anyPending}>
					{isPending ? "Creating account…" : "Create account"}
				</Button>
			</form>
		</AuthShell>
	);
}
