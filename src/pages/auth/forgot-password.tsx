import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useForgotPassword } from "@refinedev/core";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// =============================================================================
// FORM ERROR COMPONENT
// =============================================================================

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40">
      <svg
        className="mt-0.5 size-5 shrink-0 text-red-500"
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

// =============================================================================
// SUCCESS STATE COMPONENT
// =============================================================================

interface SuccessStateProps {
  email: string;
  onTryAgain: () => void;
}

function SuccessState({ email, onTryAgain }: SuccessStateProps) {
  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center px-4 py-4 sm:px-6">
          <Logo className="h-7" />
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-4 pb-12 sm:px-6">
          <div className="mx-auto w-full max-w-sm">
            {/* Success animation container */}
            <div className="relative mx-auto flex size-20 items-center justify-center">
              {/* Animated rings */}
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20" />
              <div className="absolute inset-2 rounded-full bg-emerald-500/10" />
              {/* Icon */}
              <div className="relative flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <CheckCircleIcon className="size-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Header */}
            <div className="mt-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                Check your email
              </h1>
              <p className="mt-3 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                We've sent a password reset link to
              </p>
              <p className="mt-1 text-base font-semibold text-zinc-900 dark:text-white">
                {email}
              </p>
            </div>

            {/* Help box */}
            <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <EnvelopeIcon className="size-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    Didn't receive the email?
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Check your spam folder or{" "}
                    <button
                      type="button"
                      onClick={onTryAgain}
                      className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      try again
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
              <ShieldCheckIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Reset links expire after 1 hour for security
              </p>
            </div>

            <Button href="/login" className="mt-6 w-full" outline>
              <ArrowLeftIcon className="size-4" />
              Back to sign in
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 pb-6 sm:px-6">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

// =============================================================================
// FORGOT PASSWORD PAGE
// =============================================================================

export function ForgotPassword() {
  const { mutate: forgotPassword, isPending } = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    setServerError(null);

    forgotPassword(
      { email: data.email },
      {
        onSuccess: () => {
          setSubmittedEmail(data.email);
          setSubmitted(true);
        },
        onError: (err) => {
          const error = err as Error;
          setServerError(
            error.message || "Failed to send reset email. Please try again."
          );
        },
      }
    );
  };

  const displayError = errors.email?.message || serverError;

  // Success state
  if (submitted) {
    return (
      <SuccessState email={submittedEmail} onTryAgain={() => setSubmitted(false)} />
    );
  }

  // Form state
  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-4 sm:px-6">
          <Logo className="h-7" />
          <TextLink href="/login" className="text-sm">
            <Strong>Sign in</Strong>
          </TextLink>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-4 pb-12 sm:px-6">
          <div className="mx-auto w-full max-w-sm">
            {/* Icon */}
            <div className="relative mx-auto flex size-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-zinc-200/50 dark:bg-zinc-700/30" />
              <div className="relative flex size-14 items-center justify-center rounded-full bg-zinc-100 ring-4 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-800">
                <LockClosedIcon className="size-6 text-zinc-500 dark:text-zinc-400" />
              </div>
            </div>

            {/* Header */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                Forgot password?
              </h1>
              <p className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
              <FormError message={displayError} />

              <div className="space-y-5">
                <Field>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    autoComplete="email username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="email"
                    spellCheck={false}
                    enterKeyHint="send"
                    placeholder="you@example.com"
                    data-invalid={errors.email ? true : undefined}
                  />
                </Field>

                <Button
                  type="submit"
                  className="w-full"
                  color="dark/zinc"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="size-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </div>
            </form>

            {/* Back to login */}
            <div className="mt-8 text-center">
              <TextLink
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <ArrowLeftIcon className="size-4" />
                Back to sign in
              </TextLink>
            </div>

            {/* Help text */}
            <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                Need help?{" "}
                <TextLink
                  href="mailto:support@hypedrive.com"
                  className="font-medium text-zinc-900 dark:text-white"
                >
                  Contact support
                </TextLink>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 pb-6 sm:px-6">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
