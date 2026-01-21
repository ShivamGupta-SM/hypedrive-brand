import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useRegister } from "@refinedev/core";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  TicketIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  name: z
    .string()
    .min(1, "Please enter your full name")
    .min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(1, "Please enter a password")
    .min(8, "Password must be at least 8 characters"),
  acceptTerms: z
    .boolean()
    .refine((val) => val === true, "Please accept the terms and conditions"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

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
// BENEFITS LIST
// =============================================================================

const benefits = [
  {
    id: "events",
    text: "Create and manage unlimited events",
    icon: CalendarDaysIcon,
  },
  { id: "tickets", text: "Sell tickets with zero hassle", icon: TicketIcon },
  {
    id: "analytics",
    text: "Real-time analytics and insights",
    icon: ChartBarIcon,
  },
  { id: "marketing", text: "Built-in marketing tools", icon: SparklesIcon },
];

// =============================================================================
// SOCIAL LOGIN BUTTON
// =============================================================================

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

function SocialButton({ icon, label, disabled, onClick }: SocialButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
    >
      {icon}
      <span className="text-[15px]">{label}</span>
    </button>
  );
}

// =============================================================================
// STAT ITEM
// =============================================================================

interface StatItemProps {
  value: string;
  label: string;
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}

// =============================================================================
// REGISTER PAGE
// =============================================================================

export function Register() {
  const { mutate: registerUser, isPending } = useRegister();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      name: "",
      password: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    registerUser(
      { email: data.email, password: data.password, name: data.name },
      {
        onSuccess: (result) => {
          if (result?.redirectTo) {
            navigate(result.redirectTo);
          }
        },
        onError: (err) => {
          const error = err as Error;
          setServerError(
            error.message || "Registration failed. Please try again."
          );
        },
      }
    );
  };

  const displayError =
    errors.email?.message ||
    errors.name?.message ||
    errors.password?.message ||
    errors.acceptTerms?.message ||
    serverError;

  return (
    <div className="flex min-h-dvh bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop: Left visual panel */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="sticky top-0 flex h-dvh flex-col bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800">
          {/* Decorative pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Gradient orbs */}
          <div className="pointer-events-none absolute -left-40 -top-40 size-80 rounded-full bg-purple-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 size-80 rounded-full bg-indigo-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative flex flex-1 flex-col justify-center p-12">
            <div className="mx-auto w-full max-w-md">
              {/* Brand */}
              <div className="mb-10">
                <Logo className="h-8 brightness-0 invert" />
                <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-indigo-400">
                  Start for free
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
                  Everything you need to run successful events
                </h2>
              </div>

              {/* Benefits */}
              <ul className="space-y-4">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <li key={benefit.id} className="flex items-center gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-500/30">
                        <Icon className="size-5 text-indigo-400" />
                      </div>
                      <span className="text-base text-white/80">
                        {benefit.text}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-3">
                <StatItem value="$2.5M+" label="Tickets sold" />
                <StatItem value="10K+" label="Events hosted" />
                <StatItem value="500+" label="Organizers" />
              </div>

              {/* Trust indicator */}
              <div className="mt-8 flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 ring-1 ring-emerald-500/20">
                <CheckCircleIcon className="size-5 shrink-0 text-emerald-400" />
                <p className="text-sm text-emerald-300">
                  No credit card required. Start hosting events in minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form section */}
      <div className="flex flex-1 flex-col lg:w-1/2">
        {/* Mobile header */}
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 lg:hidden">
          <Logo className="h-7" />
          <TextLink href="/login" className="text-sm">
            <Strong>Sign in</Strong>
          </TextLink>
        </header>

        {/* Main form content */}
        <div className="flex flex-1 flex-col justify-center px-4 pb-8 sm:px-6 lg:px-12">
          <div className="mx-auto w-full max-w-sm">
            {/* Desktop logo */}
            <Logo className="mb-8 hidden h-8 lg:block" />

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Start hosting events and selling tickets in minutes.
              </p>
            </div>

            {/* Social login - moved to top for quick access */}
            <div className="space-y-3">
              <SocialButton
                disabled={isPending}
                icon={
                  <svg
                    className="size-5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                }
                label="Continue with Google"
              />

              <SocialButton
                disabled={isPending}
                icon={
                  <svg
                    className="size-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                  </svg>
                }
                label="Continue with Apple"
              />
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-zinc-50 px-4 text-sm text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormError message={displayError} />

              <div className="space-y-4">
                <Field>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    {...register("name")}
                    disabled={isPending}
                    autoComplete="name"
                    autoCapitalize="words"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="John Doe"
                    data-invalid={errors.name ? true : undefined}
                  />
                </Field>

                <Field>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    inputMode="email"
                    spellCheck={false}
                    enterKeyHint="next"
                    placeholder="you@example.com"
                    data-invalid={errors.email ? true : undefined}
                  />
                </Field>

                <Field>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      disabled={isPending}
                      autoComplete="new-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      placeholder="Min. 8 characters"
                      data-invalid={errors.password ? true : undefined}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </Field>

                <CheckboxField>
                  <Checkbox
                    name="terms"
                    checked={acceptTerms}
                    onChange={(checked) =>
                      setValue("acceptTerms", checked, { shouldValidate: true })
                    }
                    disabled={isPending}
                  />
                  <Label className="text-sm">
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
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </div>
            </form>

            {/* Sign in link */}
            <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <TextLink href="/login">
                <Strong>Sign in</Strong>
              </TextLink>
            </p>

            {/* Mobile benefits - show on small screens */}
            <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-4 lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
              <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                What you get:
              </p>
              <ul className="space-y-2">
                {benefits.slice(0, 3).map((benefit) => (
                  <li
                    key={benefit.id}
                    className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <CheckCircleIcon className="size-4 shrink-0 text-emerald-500" />
                    {benefit.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-4 pb-6 sm:px-6 lg:px-12">
          <div className="mx-auto max-w-sm">
            <p className="text-center text-xs text-zinc-400 dark:text-zinc-600">
              &copy; {new Date().getFullYear()} Hypedrive. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
