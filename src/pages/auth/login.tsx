import { Button } from "@/components/button";
import { Checkbox, CheckboxField } from "@/components/checkbox";
import { Field, Label } from "@/components/fieldset";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Strong, TextLink } from "@/components/text";
import { useLogin } from "@refinedev/core";
import {
  ArrowTrendingUpIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  TicketIcon,
  UsersIcon,
} from "@heroicons/react/16/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email")
    .email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

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
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ icon: Icon, value, label, trend, trendUp }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/20">
          <Icon className="size-5 text-indigo-400" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
          <p className="text-sm text-zinc-400">{label}</p>
        </div>
      </div>
      {trend && (
        <div
          className={`mt-3 flex items-center gap-1.5 text-sm ${
            trendUp ? "text-emerald-400" : "text-red-400"
          }`}
        >
          <ArrowTrendingUpIcon
            className={`size-4 ${!trendUp ? "rotate-180 transform" : ""}`}
          />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// TESTIMONIAL CARD
// =============================================================================

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  initials: string;
}

function TestimonialCard({ quote, author, role, initials }: TestimonialProps) {
  return (
    <figure className="mt-8 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
      <div className="mb-4 flex" role="img" aria-label="5 star rating">
        {["star-1", "star-2", "star-3", "star-4", "star-5"].map((id) => (
          <svg
            key={id}
            className="size-5 text-amber-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
              clipRule="evenodd"
            />
          </svg>
        ))}
      </div>
      <blockquote className="text-base font-medium leading-relaxed text-white/90">
        "{quote}"
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
        <div className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{author}</p>
          <p className="text-sm text-zinc-500">{role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

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
      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white font-medium text-zinc-700 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-700"
    >
      {icon}
      <span className="text-[15px]">{label}</span>
    </button>
  );
}

// =============================================================================
// LOGIN PAGE
// =============================================================================

export function Login() {
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);

    login(
      { email: data.email, password: data.password },
      {
        onSuccess: (result) => {
          if (result?.redirectTo) {
            navigate(result.redirectTo);
          }
        },
        onError: (err) => {
          const error = err as Error;
          setServerError(
            error.message || "Invalid email or password. Please try again."
          );
        },
      }
    );
  };

  const displayError =
    errors.email?.message || errors.password?.message || serverError;

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
          <div className="pointer-events-none absolute -left-40 -top-40 size-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 size-80 rounded-full bg-purple-500/20 blur-3xl" />

          {/* Content */}
          <div className="relative flex flex-1 flex-col justify-center p-12">
            <div className="mx-auto w-full max-w-md">
              {/* Brand */}
              <div className="mb-10">
                <Logo className="h-8 brightness-0 invert" />
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
                  Your events, supercharged
                </h2>
                <p className="mt-3 text-base text-zinc-400">
                  Join thousands of organizers who trust Hypedrive to power their
                  events.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  icon={TicketIcon}
                  value="$2.5M+"
                  label="Tickets sold"
                  trend="+24% this month"
                  trendUp
                />
                <StatCard
                  icon={UsersIcon}
                  value="50K+"
                  label="Attendees"
                  trend="+18% this month"
                  trendUp
                />
              </div>

              {/* Testimonial */}
              <TestimonialCard
                quote="Hypedrive has transformed how we manage our events. Ticket sales are up 40% since we started using it."
                author="Michael Johnson"
                role="Event Organizer"
                initials="MJ"
              />

              {/* Trust badges */}
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <SparklesIcon className="size-4 text-amber-500" />
                  <span>10,000+ events hosted</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <svg className="size-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                  </svg>
                  <span>99.9% uptime</span>
                </div>
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
          <TextLink href="/register" className="text-sm">
            <Strong>Create account</Strong>
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
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-zinc-600 sm:text-base dark:text-zinc-400">
                Sign in to manage your events and track sales.
              </p>
            </div>

            {/* Social login - moved to top for quick access */}
            <div className="space-y-3">
              <SocialButton
                disabled={isPending}
                icon={
                  <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
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
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    autoComplete="username email"
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <TextLink
                      href="/forgot-password"
                      className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      Forgot password?
                    </TextLink>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      disabled={isPending}
                      autoComplete="current-password"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      enterKeyHint="done"
                      placeholder="••••••••"
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
                  <Checkbox name="remember" disabled={isPending} />
                  <Label className="text-sm">Keep me signed in</Label>
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
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
            </form>

            {/* Sign up link */}
            <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
              New to Hypedrive?{" "}
              <TextLink href="/register">
                <Strong>Create an account</Strong>
              </TextLink>
            </p>

            {/* Terms - mobile only */}
            <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500 lg:hidden dark:text-zinc-500">
              By continuing, you agree to our{" "}
              <TextLink
                href="/terms"
                target="_blank"
                className="font-medium text-zinc-600 underline underline-offset-2 dark:text-zinc-400"
              >
                Terms
              </TextLink>{" "}
              and{" "}
              <TextLink
                href="/privacy"
                target="_blank"
                className="font-medium text-zinc-600 underline underline-offset-2 dark:text-zinc-400"
              >
                Privacy Policy
              </TextLink>
            </p>
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
