import {
	BuildingOffice2Icon,
	CheckCircleIcon,
	ExclamationTriangleIcon,
	XCircleIcon,
} from "@heroicons/react/16/solid";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { Logo } from "@/components/logo";
import {
	getAPIErrorMessage,
	useAcceptInvitation,
	useGetInvitation,
	useRejectInvitation,
} from "@/hooks";
import { AuthShell } from "./login";

type InviteState = "loading" | "preview" | "accepted" | "rejected" | "error";

export function AcceptInvite() {
	const navigate = useNavigate();
	const search = useSearch({ strict: false }) as { invitationId?: string };
	const invitationId = search.invitationId;

	const getInvitation = useGetInvitation();
	const acceptInvitation = useAcceptInvitation();
	const rejectInvitation = useRejectInvitation();

	const [state, setState] = useState<InviteState>("loading");
	const [error, setError] = useState<string | null>(null);
	const [invitation, setInvitation] = useState<{
		id: string;
		organizationId: string;
		organizationName?: string;
		role?: string;
		email?: string;
		inviterEmail?: string;
	} | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional run-once on mount
	useEffect(() => {
		if (!invitationId) {
			setError("No invitation ID provided.");
			setState("error");
			return;
		}

		getInvitation.mutateAsync(invitationId).then(
			(result) => {
				const data = result as Record<string, unknown>;
				setInvitation({
					id: invitationId,
					organizationId: (data.organizationId as string) || "",
					organizationName: (data.organizationName as string) || "Organization",
					role: (data.role as string) || "member",
					email: (data.email as string) || "",
					inviterEmail: (data.inviterEmail as string) || "",
				});
				setState("preview");
			},
			(err) => {
				setError(getAPIErrorMessage(err, "This invitation is invalid or has expired."));
				setState("error");
			}
		);
	}, [invitationId]);

	const handleAccept = async () => {
		if (!invitation) return;
		try {
			await acceptInvitation.mutateAsync({
				organizationId: invitation.organizationId,
				invitationId: invitation.id,
			});
			setState("accepted");
			setTimeout(() => navigate({ to: "/" }), 2000);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to accept invitation."));
		}
	};

	const handleReject = async () => {
		if (!invitation) return;
		try {
			await rejectInvitation.mutateAsync({
				organizationId: invitation.organizationId,
				invitationId: invitation.id,
			});
			setState("rejected");
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to decline invitation."));
		}
	};

	if (state === "loading") {
		return (
			<AuthShell>
				<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
						<svg className="size-7 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
							<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
							<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
						</svg>
					</div>
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Loading invitation…</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Please wait while we fetch your invite.
					</p>
				</div>
			</AuthShell>
		);
	}

	if (state === "accepted") {
		return (
			<AuthShell>
				<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
						<CheckCircleIcon className="size-7 text-emerald-500 dark:text-emerald-400" />
					</div>
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Welcome aboard!</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						You've joined {invitation?.organizationName}. Redirecting…
					</p>
				</div>
			</AuthShell>
		);
	}

	if (state === "rejected") {
		return (
			<AuthShell>
				<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
						<XCircleIcon className="size-7 text-zinc-500 dark:text-zinc-400" />
					</div>
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Invitation declined</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						You've declined the invitation.
					</p>
				</div>
				<Button className="w-full" color="dark/zinc" onClick={() => navigate({ to: "/" })}>
					Go to Dashboard
				</Button>
			</AuthShell>
		);
	}

	if (state === "error") {
		return (
			<AuthShell>
				<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />
				<div className="text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/40">
						<ExclamationTriangleIcon className="size-7 text-red-500 dark:text-red-400" />
					</div>
					<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Invalid invitation</h1>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						{error || "This invitation link is invalid or has expired."}
					</p>
				</div>
				<Button className="w-full" color="dark/zinc" href="/login">
					Go to sign in
				</Button>
			</AuthShell>
		);
	}

	// preview state
	return (
		<AuthShell>
			<Logo className="h-7 w-auto text-zinc-950 dark:text-white" />

			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40">
					<BuildingOffice2Icon className="size-7 text-emerald-500 dark:text-emerald-400" />
				</div>
				<h1 className="text-xl font-semibold text-zinc-900 dark:text-white">You're invited!</h1>
				<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
					{invitation?.inviterEmail
						? `${invitation.inviterEmail} invited you to join`
						: "You've been invited to join"}
				</p>
				<p className="mt-2 text-base font-semibold text-zinc-900 dark:text-white">
					{invitation?.organizationName}
				</p>
				{invitation?.role && (
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
						Role: <span className="font-medium capitalize">{invitation.role}</span>
					</p>
				)}
			</div>

			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/40 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<div className="flex gap-3">
				<Button
					outline
					onClick={handleReject}
					disabled={acceptInvitation.isPending || rejectInvitation.isPending}
					className="flex-1"
				>
					Decline
				</Button>
				<Button
					color="dark/zinc"
					onClick={handleAccept}
					disabled={acceptInvitation.isPending || rejectInvitation.isPending}
					className="flex-1"
				>
					{acceptInvitation.isPending ? "Joining…" : "Accept & Join"}
				</Button>
			</div>
		</AuthShell>
	);
}
