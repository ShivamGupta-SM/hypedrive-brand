import {
	EyeIcon,
	EyeSlashIcon,
	KeyIcon,
	ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { startAuthentication } from "@simplewebauthn/browser";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import {
	usePasskeyAuthenticate,
	usePasskeyAuthenticateOptions,
	useTwoFactorVerifyBackupCode,
	useTwoFactorVerifyTotp,
} from "@/hooks";
import { setServerAuthCookie } from "@/lib/server-auth";
import { useAuthStore, useLogin, useSocialLogin } from "@/store/auth-store";
import { FormError } from "./components";

const loginSchema = z.object({
	email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
	password: z.string().min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Icons ────────────────────────────────────────────────────────────────────

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

// ─── OAuthButton ──────────────────────────────────────────────────────────────

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

// ─── Login ────────────────────────────────────────────────────────────────────

export function Login() {
	const { mutate: login, isPending } = useLogin();
	const { mutate: socialLogin, isPending: isSocialPending } = useSocialLogin();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
	const [twoFactorMode, setTwoFactorMode] = useState<"totp" | "backup">("totp");
	const [twoFactorCode, setTwoFactorCode] = useState("");
	const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

	const verifyTotp = useTwoFactorVerifyTotp();
	const verifyBackupCode = useTwoFactorVerifyBackupCode();
	const passkeyAuthOptions = usePasskeyAuthenticateOptions();
	const passkeyAuth = usePasskeyAuthenticate();

	const handleSocialLogin = useCallback(
		(provider: "google" | "apple") => {
			socialLogin(provider, {
				onSuccess: (redirectUrl) => { if (redirectUrl) window.location.href = redirectUrl; },
				onError: (err) => setServerError(err.message || "Social login failed."),
			});
		},
		[socialLogin]
	);

	const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "" },
	});

	const onSubmit = async (data: LoginFormData) => {
		setServerError(null);
		const result = await login(
			{ email: data.email, password: data.password },
			{
				onSuccess: () => navigate({ to: "/" }),
				onError: (err) => {
					const error = err as { message: string; code?: string };
					if (error.code === "TWO_FACTOR_REQUIRED") return;
					setServerError(error.message || "Invalid email or password.");
				},
			}
		);
		if (result && "twoFactorRedirect" in result && result.twoFactorRedirect && "twoFactorToken" in result) {
			setTwoFactorToken(result.twoFactorToken as string);
			setTwoFactorMode("totp");
			setTwoFactorCode("");
			setTwoFactorError(null);
		}
	};

	const handleTwoFactorVerify = async () => {
		if (!twoFactorToken || !twoFactorCode.trim()) return;
		setTwoFactorError(null);
		try {
			const args = { twoFactorToken, code: twoFactorCode.trim(), trustDevice: true };
			const result = twoFactorMode === "totp"
				? await verifyTotp.mutateAsync(args)
				: await verifyBackupCode.mutateAsync(args);
			if (result.token) {
				await setServerAuthCookie({ data: { token: result.token } });
				useAuthStore.getState().setAuthenticated(true);
				navigate({ to: "/" });
			}
		} catch (err) {
			setTwoFactorError(err instanceof Error ? err.message
				: twoFactorMode === "totp" ? "Invalid code." : "Invalid backup code.");
		}
	};

	const handlePasskeyLogin = async () => {
		setServerError(null);
		try {
			const { options, challengeCookie } = await passkeyAuthOptions.mutateAsync();
			const assertion = await startAuthentication({
				optionsJSON: options as Parameters<typeof startAuthentication>[0]["optionsJSON"],
			});
			const result = await passkeyAuth.mutateAsync({ response: assertion, challengeCookie });
			if (result.token) {
				await setServerAuthCookie({ data: { token: result.token } });
				useAuthStore.getState().setAuthenticated(true);
				navigate({ to: "/" });
			}
		} catch (err) {
			if (err instanceof Error && err.message !== "Authentication cancelled") {
				setServerError(err.message || "Passkey authentication failed");
			}
		}
	};

	const anyPending = isPending || isSocialPending;

	// ── 2FA ───────────────────────────────────────────────────────────────────
	if (twoFactorToken) {
		return (
			<AuthShell>
				<div className="mb-6">
					<div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/40">
						<ShieldCheckIcon className="size-5 text-emerald-500" />
					</div>
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Two-factor auth</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						{twoFactorMode === "totp"
							? "Enter the 6-digit code from your authenticator app."
							: "Enter one of your backup codes."}
					</p>
				</div>

				<div className="space-y-4">
					<FormError message={twoFactorError} />
					<Field>
						<Label>{twoFactorMode === "totp" ? "Authentication code" : "Backup code"}</Label>
						<Input
							type="text"
							value={twoFactorCode}
							onChange={(e) => setTwoFactorCode(e.target.value)}
							placeholder={twoFactorMode === "totp" ? "000000" : "Enter backup code"}
							autoFocus
							autoComplete="one-time-code"
							inputMode={twoFactorMode === "totp" ? "numeric" : "text"}
							maxLength={twoFactorMode === "totp" ? 6 : undefined}
							onKeyDown={(e) => e.key === "Enter" && handleTwoFactorVerify()}
						/>
					</Field>
					<Button
						className="w-full"
						color="dark/zinc"
						onClick={handleTwoFactorVerify}
						disabled={verifyTotp.isPending || verifyBackupCode.isPending || !twoFactorCode.trim()}
					>
						{verifyTotp.isPending || verifyBackupCode.isPending ? "Verifying…" : "Verify"}
					</Button>
				</div>

				<div className="mt-4 flex items-center justify-between">
					<button
						type="button"
						onClick={() => { setTwoFactorMode(twoFactorMode === "totp" ? "backup" : "totp"); setTwoFactorCode(""); setTwoFactorError(null); }}
						className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						<KeyIcon className="size-3.5" />
						{twoFactorMode === "totp" ? "Use backup code" : "Use authenticator"}
					</button>
					<button
						type="button"
						onClick={() => { setTwoFactorToken(null); setTwoFactorCode(""); setTwoFactorError(null); }}
						className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						Back to login
					</button>
				</div>
			</AuthShell>
		);
	}

	// ── Main ──────────────────────────────────────────────────────────────────
	return (
		<AuthShell
			footer={
				<p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
					Don't have an account?{" "}
					<TextLink href="/register"><Strong>Sign up</Strong></TextLink>
				</p>
			}
		>
			{/* Header — logo + title, no bottom margin (space-y-5 on parent handles gap) */}
			<div>
				<Logo className="mb-4 h-7 w-auto text-zinc-950 dark:text-white" />
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Sign in</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Welcome back — manage your campaigns and enrollments</p>
			</div>

			{/* OAuth — 2 col, full label */}
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

			{/* Form fields — tighter gap than sections */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<FormError message={errors.email?.message || errors.password?.message || serverError} />

				<Field>
					<Label>Email</Label>
					<Input
						type="email"
						{...register("email")}
						disabled={anyPending}
						autoComplete="username email"
						autoCapitalize="none"
						inputMode="email"
						placeholder="you@example.com"
						data-invalid={errors.email ? true : undefined}
					/>
				</Field>

				<Field>
					<div className="flex items-center justify-between">
						<Label>Password</Label>
						<TextLink href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
							Forgot password?
						</TextLink>
					</div>
					<div className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							{...register("password")}
							disabled={anyPending}
							autoComplete="current-password"
							placeholder="••••••••"
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
					<Checkbox name="remember" disabled={anyPending} />
					<Label className="text-sm font-normal text-zinc-600 dark:text-zinc-400">Keep me signed in</Label>
				</CheckboxField>

				<Button type="submit" className="w-full" color="dark/zinc" disabled={anyPending}>
					{isPending ? "Signing in…" : "Sign in"}
				</Button>
			</form>

			{/* Passkey — sits below form, same gap as other sections */}
			<div className="text-center">
				<button
					type="button"
					onClick={handlePasskeyLogin}
					disabled={anyPending || passkeyAuthOptions.isPending || passkeyAuth.isPending}
					className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 disabled:opacity-40 dark:text-zinc-500 dark:hover:text-zinc-300"
				>
					<KeyIcon className="size-3.5" />
					Sign in with a passkey instead
				</button>
			</div>
		</AuthShell>
	);
}

// ─── AuthShell ────────────────────────────────────────────────────────────────

export function AuthShell({
	children,
	footer,
}: {
	children: React.ReactNode;
	footer?: React.ReactNode;
}) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
			<div className="w-full max-w-95">
				<div className="rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
					<div className="space-y-5 p-8">
						{children}
					</div>
					{footer && (
						<div className="border-t border-zinc-100 px-8 py-4 dark:border-zinc-800">
							{footer}
						</div>
					)}
				</div>
				<p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-600">
					© {new Date().getFullYear()} Hypedrive, Inc.
				</p>
			</div>
		</div>
	);
}
