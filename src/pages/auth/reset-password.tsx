import { Button } from "@/components/button";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useUpdatePassword } from "@/store/auth-store";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  XCircleIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// =============================================================================
// FORM ERROR COMPONENT
// =============================================================================

function FormError({ message }: { message?: string | null }) {
  if (!message) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 dark:bg-red-950/40">
      <svg className="mt-0.5 size-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
      <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
    </div>
  );
}

// =============================================================================
// PASSWORD STRENGTH INDICATOR
// =============================================================================

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Lowercase letter", valid: /[a-z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
  ];

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Password requirements:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            {check.valid ? (
              <CheckCircleIcon className="size-3.5 text-emerald-500" />
            ) : (
              <XCircleIcon className="size-3.5 text-zinc-300 dark:text-zinc-600" />
            )}
            <span
              className={`text-xs ${
                check.valid
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-400 dark:text-zinc-500"
              }`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// INVALID TOKEN STATE
// =============================================================================

function InvalidToken() {
  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center px-6 py-5 sm:px-10">
          <Logo className="h-7" />
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            {/* Error icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
              <XCircleIcon className="size-7 text-red-500 dark:text-red-400" />
            </div>

            {/* Header */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Invalid or expired link
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>

            <Button href="/forgot-password" className="mt-8 w-full" color="dark/zinc">
              Request new link
            </Button>

            <div className="mt-4 text-center">
              <TextLink href="/login" className="text-sm">
                <ArrowLeftIcon className="mr-1 inline size-3.5" />
                Back to sign in
              </TextLink>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 pb-6 sm:px-10">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

// =============================================================================
// SUCCESS STATE
// =============================================================================

function SuccessState() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center px-6 py-5 sm:px-10">
          <Logo className="h-7" />
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            {/* Success icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
              <CheckCircleIcon className="size-7 text-emerald-500 dark:text-emerald-400" />
            </div>

            {/* Header */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Password reset successful
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                Your password has been updated. You'll be redirected to sign in shortly.
              </p>
            </div>

            <Button href="/login" className="mt-8 w-full" color="dark/zinc">
              Sign in now
            </Button>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 pb-6 sm:px-10">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

// =============================================================================
// RESET PASSWORD PAGE
// =============================================================================

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const { mutate: resetPassword, isPending } = useUpdatePassword();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password");

  // Check for token
  if (!token) {
    return <InvalidToken />;
  }

  // Success state
  if (success) {
    return <SuccessState />;
  }

  const onSubmit = (data: ResetPasswordFormData) => {
    setServerError(null);

    resetPassword(
      { token, newPassword: data.password },
      {
        onSuccess: () => {
          setSuccess(true);
        },
        onError: (err) => {
          setServerError(err.message || "Failed to reset password. The link may have expired.");
        },
      }
    );
  };

  const displayError = errors.password?.message || errors.confirmPassword?.message || serverError;

  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      <div className="flex w-full flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Logo className="h-7" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Remember your password?{" "}
            <TextLink href="/login">
              <Strong>Sign in</Strong>
            </TextLink>
          </p>
        </header>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-6 pb-12 sm:px-10">
          <div className="mx-auto w-full max-w-sm">
            {/* Icon */}
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <KeyIcon className="size-7 text-zinc-500 dark:text-zinc-400" />
            </div>

            {/* Header */}
            <div className="mt-6 text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                Create new password
              </h1>
              <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
                Enter your new password below to complete the reset process.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
              <FormError message={displayError} />

              <div className="space-y-6">
                <Field>
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      disabled={isPending}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      data-invalid={errors.password ? true : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                  <PasswordStrength password={passwordValue} />
                </Field>

                <Field>
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      disabled={isPending}
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      data-invalid={errors.confirmPassword ? true : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <Button type="submit" className="w-full" color="dark/zinc" disabled={isPending}>
                  {isPending ? "Resetting..." : "Reset password"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <TextLink href="/login" className="text-sm">
                <ArrowLeftIcon className="mr-1 inline size-3.5" />
                Back to sign in
              </TextLink>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 pb-6 sm:px-10">
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
