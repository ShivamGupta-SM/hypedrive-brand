import { XCircleIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { useLogout } from "@/features/auth/hooks";

export function Rejected({ organization }: { organization: { name: string } | null }) {
	const logout = useLogout();
	const navigate = useNavigate();

	const handleSignOut = async () => {
		const result = await logout.mutateAsync();
		if (result.success && result.redirectTo) {
			navigate({ to: result.redirectTo as "/" | "/login" });
		}
	};

	return (
		<div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
			<div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
				<div className="w-full max-w-md text-center">
					{/* Logo */}
					<Logo className="mx-auto mb-8 h-8 w-auto text-zinc-950 dark:text-white" />

					{/* Icon */}
					<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
						<XCircleIcon className="size-8 text-red-600 dark:text-red-400" />
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Application Not Approved</h1>

					{/* Organization name */}
					{organization && (
						<p className="mt-2 text-lg font-medium text-zinc-600 dark:text-zinc-400">{organization.name}</p>
					)}

					{/* Description */}
					<p className="mt-4 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
						Unfortunately, your organization application was not approved at this time. Please review the details below.
					</p>

					{/* Rejection notice */}
					<div className="mt-6 rounded-xl bg-red-50 p-5 text-left dark:bg-red-950/30">
						<h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Application Status</h3>
						<p className="mt-2 text-sm text-red-700 dark:text-red-400">
							Your application has been reviewed and was not approved. Please contact support for more details.
						</p>
					</div>

					{/* What you can do */}
					<div className="mt-6 rounded-xl bg-zinc-50 p-6 text-left dark:bg-zinc-900">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">What you can do</h3>
						<ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
							<li className="flex items-start gap-2">
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
								Review the rejection reason above
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
								Contact support if you have questions
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
								Submit a new application with updated information
							</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="mt-8 flex flex-col gap-3">
						<Button href="/onboarding" color="dark/zinc" className="w-full">
							Submit New Application
						</Button>

						<Button onClick={handleSignOut} outline className="w-full">
							Sign Out
						</Button>
					</div>

					{/* Support */}
					<p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
						Need help?{" "}
						<a
							href="mailto:support@hypedrive.com"
							className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-500 dark:text-white dark:decoration-zinc-600 dark:hover:decoration-zinc-400"
						>
							Contact support
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
