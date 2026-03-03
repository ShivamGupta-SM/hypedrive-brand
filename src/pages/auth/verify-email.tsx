import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { TextLink } from "@/components/text";
import { useVerifyEmail } from "@/features/auth/hooks-account";
import { Route } from "@/routes/_auth/verify-email";
import { AuthShell } from "./login";

export function VerifyEmail() {
	const { token } = Route.useSearch();
	const navigate = useNavigate();
	const verifyEmail = useVerifyEmail();
	const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
	const [errorMessage, setErrorMessage] = useState<string | null>(token ? null : "No verification token provided.");

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional run-once on mount
	useEffect(() => {
		if (!token) return;
		verifyEmail.mutate(
			{ token },
			{
				onSuccess: () => setStatus("success"),
				onError: (err) => {
					setStatus("error");
					setErrorMessage((err as Error).message || "Verification failed. The link may have expired.");
				},
			}
		);
	}, [token]);

	useEffect(() => {
		if (status !== "success") return;
		const t = setTimeout(() => navigate({ to: "/login" }), 3000);
		return () => clearTimeout(t);
	}, [status, navigate]);

	return (
		<AuthShell>
			<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />

			{status === "loading" && (
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
						<svg className="size-7 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>
					</div>
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Verifying your email…</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Please wait while we confirm your email address.
					</p>
				</div>
			)}

			{status === "success" && (
				<>
					<div className="text-center">
						<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
							<CheckCircleIcon className="size-7 text-emerald-500 dark:text-emerald-400" />
						</div>
						<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Email verified!</h1>
						<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
							Your email is confirmed. Redirecting to sign in…
						</p>
					</div>
					<Button href="/login" className="w-full" color="dark/zinc">
						Sign in now
					</Button>
				</>
			)}

			{status === "error" && (
				<>
					<div className="text-center">
						<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
							<XCircleIcon className="size-7 text-red-500 dark:text-red-400" />
						</div>
						<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Verification failed</h1>
						<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{errorMessage}</p>
					</div>
					<Button href="/register" className="w-full" color="dark/zinc">
						Try registering again
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
				</>
			)}
		</AuthShell>
	);
}
