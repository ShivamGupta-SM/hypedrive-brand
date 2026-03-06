import { EyeIcon, EyeSlashIcon, KeyIcon, ShieldCheckIcon } from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { startAuthentication } from "@simplewebauthn/browser";
import { useQueryClient } from "@tanstack/react-query";
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
import { useLogin, useSocialLogin } from "@/features/auth/hooks";
import { useTwoFactorVerifyBackupCode, useTwoFactorVerifyTotp } from "@/features/auth/hooks-2fa";
import { usePasskeyAuthenticate, usePasskeyAuthenticateOptions } from "@/features/auth/hooks-passkeys";
import { useAutofillSync } from "@/hooks/use-autofill-sync";
import { setServerAuthCookie } from "@/server/auth-queries";
import { AppleIcon, FormError, GoogleIcon, OAuthButton } from "./components";

const loginSchema = z.object({
	email: z.string().min(1, "Please enter your email").email("Please enter a valid email address"),
	password: z.string().min(1, "Please enter your password"),
	rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Login ────────────────────────────────────────────────────────────────────

export function Login() {
	const login = useLogin();
	const socialLogin = useSocialLogin();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);

	const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
	const [twoFactorMode, setTwoFactorMode] = useState<"totp" | "backup">("totp");
	const [twoFactorCode, setTwoFactorCode] = useState("");
	const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

	const isPending = login.isPending;
	const isSocialPending = socialLogin.isPending;

	const verifyTotp = useTwoFactorVerifyTotp();
	const verifyBackupCode = useTwoFactorVerifyBackupCode();
	const passkeyAuthOptions = usePasskeyAuthenticateOptions();
	const passkeyAuth = usePasskeyAuthenticate();

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
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: { email: "", password: "", rememberMe: false },
	});

	const rememberMe = watch("rememberMe");

	const onSubmit = async (data: LoginFormData) => {
		setServerError(null);
		try {
			const result = await login.mutateAsync({
				email: data.email,
				password: data.password,
				rememberMe: data.rememberMe,
			});
			if ("twoFactorRedirect" in result && result.twoFactorRedirect && "twoFactorToken" in result) {
				setTwoFactorToken(result.twoFactorToken as string);
				setTwoFactorMode("totp");
				setTwoFactorCode("");
				setTwoFactorError(null);
			} else {
				queryClient.removeQueries({ queryKey: ["auth", "session-with-orgs"] });
				navigate({ to: "/" });
			}
		} catch (err) {
			const error = err as { message: string; code?: string };
			if (error.code === "TWO_FACTOR_REQUIRED") return;
			setServerError(error.message || "Invalid email or password.");
		}
	};

	const handleTwoFactorVerify = async () => {
		if (!twoFactorToken || !twoFactorCode.trim()) return;
		setTwoFactorError(null);
		try {
			const args = { twoFactorToken, code: twoFactorCode.trim(), trustDevice: true };
			const result =
				twoFactorMode === "totp" ? await verifyTotp.mutateAsync(args) : await verifyBackupCode.mutateAsync(args);
			if (result.token) {
				await setServerAuthCookie({ data: { token: result.token } });
				queryClient.removeQueries({ queryKey: ["auth", "session-with-orgs"] });
				navigate({ to: "/" });
			}
		} catch (err) {
			setTwoFactorError(
				err instanceof Error ? err.message : twoFactorMode === "totp" ? "Invalid code." : "Invalid backup code."
			);
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
				queryClient.removeQueries({ queryKey: ["auth", "session-with-orgs"] });
				navigate({ to: "/" });
			} else if (result.success) {
				// Authenticated but no token returned — try navigating anyway
				// (the server may have set the session cookie directly)
				queryClient.removeQueries({ queryKey: ["auth", "session-with-orgs"] });
				navigate({ to: "/" });
			} else {
				setServerError("Passkey authentication failed. Please try again.");
			}
		} catch (err) {
			if (err instanceof DOMException && err.name === "NotAllowedError") {
				// User cancelled the passkey prompt — don't show error
				return;
			}
			if (err instanceof Error && err.message !== "Authentication cancelled") {
				setServerError(err.message || "Passkey authentication failed");
			}
		}
	};

	const { formRef, syncAutofill } = useAutofillSync(setValue, {
		email: 'input[name="email"]',
		password: 'input[name="password"]',
	});

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
						onClick={() => {
							setTwoFactorMode(twoFactorMode === "totp" ? "backup" : "totp");
							setTwoFactorCode("");
							setTwoFactorError(null);
						}}
						className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					>
						<KeyIcon className="size-3.5" />
						{twoFactorMode === "totp" ? "Use backup code" : "Use authenticator"}
					</button>
					<button
						type="button"
						onClick={() => {
							setTwoFactorToken(null);
							setTwoFactorCode("");
							setTwoFactorError(null);
						}}
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
					<TextLink href="/register">
						<Strong>Sign up</Strong>
					</TextLink>
				</p>
			}
		>
			{/* Header — logo + title, no bottom margin (space-y-5 on parent handles gap) */}
			<div>
				<Logo className="mb-4 h-7 w-auto text-zinc-950 dark:text-white" />
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Sign in</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					Welcome back — manage your campaigns and enrollments
				</p>
			</div>

			{/* OAuth — 2 col, full label */}
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

			{/* Form fields — tighter gap than sections */}
			<form
				ref={formRef}
				onSubmit={(e) => {
					syncAutofill();
					handleSubmit(onSubmit)(e);
				}}
				className="space-y-3"
				autoComplete="on"
			>
				<FormError message={errors.email?.message || errors.password?.message || serverError} />

				<Field>
					<Label>Email</Label>
					<Input
						type="email"
						{...register("email")}
						disabled={anyPending}
						autoComplete="username"
						autoCapitalize="none"
						autoCorrect="off"
						spellCheck={false}
						inputMode="email"
						placeholder="you@example.com"
						data-invalid={errors.email ? true : undefined}
					/>
				</Field>

				<Field>
					<div className="flex items-center justify-between">
						<Label>Password</Label>
						<TextLink
							href="/forgot-password"
							className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
						>
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
					<Checkbox
						checked={rememberMe}
						onChange={(checked) => setValue("rememberMe", checked)}
						disabled={anyPending}
					/>
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

export function AuthShell({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
	return (
		<div className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
			<div className="w-full max-w-95">
				<div className="rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
					<div className="space-y-5 p-8">{children}</div>
					{footer && <div className="border-t border-zinc-200 px-8 py-4 dark:border-zinc-800">{footer}</div>}
				</div>
				<p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
					© {new Date().getFullYear()} Hypedrive, Inc.
				</p>
			</div>
		</div>
	);
}
