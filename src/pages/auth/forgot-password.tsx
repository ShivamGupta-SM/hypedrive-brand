import {
	ArrowLeftIcon,
	CheckCircleIcon,
	EnvelopeIcon,
	LockClosedIcon,
	ShieldCheckIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useForgotPassword } from "@/hooks/use-auth";
import { FormError } from "./components";
import { AuthShell } from "./login";

const forgotPasswordSchema = z.object({
	email: z.string().min(1, "Please enter your email address").email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

function SuccessState({ email, onTryAgain }: { email: string; onTryAgain: () => void }) {
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
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Check your email</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					We sent a reset link to <span className="font-medium text-zinc-700 dark:text-zinc-300">{email}</span>
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
								onClick={onTryAgain}
								className="font-medium text-zinc-700 underline-offset-2 hover:underline dark:text-zinc-300"
							>
								try again
							</button>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
					<ShieldCheckIcon className="size-4 shrink-0 text-amber-500" />
					<p className="text-xs text-amber-700 dark:text-amber-300">Reset links expire after 1 hour</p>
				</div>

				<Button href="/login" className="w-full" outline>
					<ArrowLeftIcon className="size-4" />
					Back to sign in
				</Button>
			</div>
		</AuthShell>
	);
}

export function ForgotPassword() {
	const forgotPassword = useForgotPassword();
	const isPending = forgotPassword.isPending;
	const [submitted, setSubmitted] = useState(false);
	const [submittedEmail, setSubmittedEmail] = useState("");
	const [serverError, setServerError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: { email: "" },
	});

	const onSubmit = (data: ForgotPasswordFormData) => {
		setServerError(null);
		forgotPassword.mutate(
			{ email: data.email },
			{
				onSuccess: () => {
					setSubmittedEmail(data.email);
					setSubmitted(true);
				},
				onError: (err) => {
					setServerError(err.message || "Failed to send reset email. Please try again.");
				},
			}
		);
	};

	if (submitted) {
		return <SuccessState email={submittedEmail} onTryAgain={() => setSubmitted(false)} />;
	}

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
					<LockClosedIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
				</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Forgot password?</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No worries, we'll send you reset instructions.</p>
			</div>

			{/* Form */}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<FormError message={errors.email?.message || serverError} />

				<Field>
					<Label>Email</Label>
					<Input
						type="email"
						{...register("email")}
						disabled={isPending}
						autoComplete="username"
						autoCapitalize="none"
						inputMode="email"
						placeholder="you@example.com"
						data-invalid={errors.email ? true : undefined}
					/>
				</Field>

				<Button type="submit" className="w-full" color="dark/zinc" disabled={isPending}>
					{isPending ? "Sending…" : "Send reset link"}
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
