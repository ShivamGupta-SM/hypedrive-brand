import { ArrowPathIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import { useLogout } from "@/hooks/use-auth";
import { useCurrentOrganization } from "@/store/organization-store";

export function PendingApproval() {
	const organization = useCurrentOrganization();
	const logout = useLogout();
	const navigate = useNavigate();
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const handleCheckStatus = async () => {
		setLoading(true);
		try {
			// Re-run route guards — if org is now approved, _approval's beforeLoad will redirect
			await router.invalidate();
		} finally {
			setLoading(false);
		}
	};

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
					<div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
						<ClockIcon className="size-8 text-amber-600 dark:text-amber-400" />
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Awaiting Approval</h1>

					{/* Organization name */}
					{organization && (
						<p className="mt-2 text-lg font-medium text-zinc-600 dark:text-zinc-400">{organization.name}</p>
					)}

					{/* Description */}
					<p className="mt-4 text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
						Your organization is currently being reviewed by our team. This usually takes 1-2 business days. We'll
						notify you by email once your account has been approved.
					</p>

					{/* What happens next */}
					<div className="mt-8 rounded-xl bg-zinc-50 p-6 text-left dark:bg-zinc-900">
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">What happens next?</h3>
						<ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
							<li className="flex items-start gap-2">
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-500" />
								Our team reviews your organization details
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
								You'll receive an email notification
							</li>
							<li className="flex items-start gap-2">
								<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
								Access your dashboard once approved
							</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="mt-8 flex flex-col gap-3">
						<Button onClick={handleCheckStatus} disabled={loading} color="dark/zinc" className="w-full">
							<ArrowPathIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
							{loading ? "Checking..." : "Check Status"}
						</Button>

						<Button onClick={handleSignOut} outline className="w-full">
							Sign Out
						</Button>
					</div>

					{/* Support */}
					<p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
						Questions?{" "}
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
