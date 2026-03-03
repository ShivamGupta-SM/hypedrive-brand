import {
	ArrowRightStartOnRectangleIcon,
	BellIcon,
	CheckCircleIcon,
	ClipboardDocumentListIcon,
	ComputerDesktopIcon,
	DevicePhoneMobileIcon,
	DeviceTabletIcon,
	EnvelopeIcon,
	EnvelopeOpenIcon,
	FingerPrintIcon,
	GlobeAltIcon,
	LockClosedIcon,
	PencilSquareIcon,
	ShieldCheckIcon,
	Square2StackIcon,
	TrashIcon,
	UserIcon,
	UserMinusIcon,
	XMarkIcon,
} from "@heroicons/react/16/solid";
import { startRegistration } from "@simplewebauthn/browser";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import { AvatarUpload } from "@/components/file-dropzone";
import { Heading } from "@/components/heading";
import { GoogleIcon } from "@/components/icons/platform-icons";
import { Input } from "@/components/input";
import { usePanelNav } from "@/components/settings-dialog";
import {
	duotoneColors,
	MenuRow,
	MenuSection,
	MenuSectionFooter,
	MenuSectionHeader,
	MenuSeparator,
	MenuToggleRow,
} from "@/components/shared/menu-list";
import { Text } from "@/components/text";
import {
	getAPIErrorMessage,
	useAcceptInvitation,
	useChangeEmail,
	useChangePassword,
	useDeleteUser,
	useDeviceSessions,
	useDeviceSessionsList,
	useLeaveOrganization,
	useLinkedAccounts,
	useLinkSocial,
	usePasskeyDelete,
	usePasskeyList,
	usePasskeyRegister,
	usePasskeyRegisterOptions,
	usePasskeyUpdateName,
	useRejectInvitation,
	useRemovePushToken,
	useRevokeAllSessions,
	useRevokeDeviceSession,
	useRevokeOtherSessions,
	useRevokeSession,
	useSetActiveSession,
	useSetPassword,
	useTwoFactorDisable,
	useTwoFactorEnable,
	useTwoFactorGenerateBackupCodes,
	useTwoFactorGetTotpUri,
	useTwoFactorVerifyTotp,
	useTwoFactorViewBackupCodes,
	useUnlinkAccount,
	useUpdateNotificationPreferences,
	useUserInfo,
	useUserInvitations,
} from "@/hooks";
import { useLogout } from "@/hooks/use-auth";
import { useOrgContext } from "@/hooks/use-org-context";
import { useAuthStore } from "@/store/auth-store";

// =============================================================================
// USER PROFILE HEADER CARD
// =============================================================================

function UserProfileCard({
	name,
	email,
	image,
	onEditProfile,
}: {
	name: string;
	email: string;
	image?: string | null;
	onEditProfile: () => void;
}) {
	const initials =
		name
			.split(" ")
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "U";

	return (
		<div className="overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/5 dark:bg-zinc-800">
			<div className="flex items-center justify-between px-5 py-4">
				<div className="flex items-center gap-4">
					{image ? (
						<img src={image} alt={name} className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/10" />
					) : (
						<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-zinc-700 text-lg font-bold text-white ring-1 ring-white/10 dark:bg-zinc-600">
							{initials}
						</div>
					)}
					<div className="min-w-0">
						<h2 className="truncate text-base font-semibold text-white">{name}</h2>
						<p className="mt-0.5 truncate text-sm text-zinc-400">{email}</p>
					</div>
				</div>
				<button
					type="button"
					onClick={onEditProfile}
					className="ml-3 shrink-0 rounded-xl bg-white/8 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
					aria-label="Edit profile"
				>
					Edit
				</button>
			</div>
		</div>
	);
}

// =============================================================================
// CHANGE PASSWORD PANEL
// =============================================================================

function ChangePasswordPanel() {
	const panelNav = usePanelNav();
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const changePassword = useChangePassword();

	const handleClose = () => panelNav?.popPanel();

	const doSubmit = async () => {
		setError(null);

		if (newPassword !== confirmPassword) {
			setError("New passwords do not match");
			return;
		}
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}

		try {
			await changePassword.mutateAsync({ currentPassword, newPassword });
			setSuccess(true);
			setTimeout(() => handleClose(), 1500);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to change password"));
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
					<LockClosedIcon className={`size-5 ${duotoneColors.amber.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Change Password</p>
					<p className="mt-0.5 text-sm text-zinc-500">Enter your current password and choose a new one.</p>
				</div>
			</div>

			{success ? (
				<div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
					<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
						<CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
					</div>
					<p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
						Password changed successfully!
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{error && (
						<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					)}
					<div>
						<label htmlFor="current-password" className="text-sm font-medium text-zinc-900 dark:text-white">
							Current Password
						</label>
						<Input
							id="current-password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className="mt-1.5"
							placeholder="Enter current password"
						/>
					</div>
					<div>
						<label htmlFor="new-password" className="text-sm font-medium text-zinc-900 dark:text-white">
							New Password
						</label>
						<Input
							id="new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="mt-1.5"
							placeholder="Enter new password"
						/>
					</div>
					<div>
						<label htmlFor="confirm-password" className="text-sm font-medium text-zinc-900 dark:text-white">
							Confirm New Password
						</label>
						<Input
							id="confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="mt-1.5"
							placeholder="Confirm new password"
							onKeyDown={(e) => e.key === "Enter" && doSubmit()}
						/>
					</div>
				</div>
			)}

			{!success && (
				<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
					<Button plain onClick={handleClose} disabled={changePassword.isPending}>
						Cancel
					</Button>
					<Button
						color="dark/zinc"
						onClick={doSubmit}
						disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
					>
						{changePassword.isPending ? "Updating..." : "Update Password"}
					</Button>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// CHANGE EMAIL PANEL
// =============================================================================

function ChangeEmailPanel({ currentEmail }: { currentEmail: string }) {
	const panelNav = usePanelNav();
	const [newEmail, setNewEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const changeEmail = useChangeEmail();

	const handleClose = () => panelNav?.popPanel();

	const doSubmit = async () => {
		setError(null);

		if (!newEmail.trim()) {
			setError("Email is required");
			return;
		}
		if (newEmail === currentEmail) {
			setError("New email must be different from current email");
			return;
		}

		try {
			await changeEmail.mutateAsync({ newEmail: newEmail.trim() });
			setSuccess(true);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to change email"));
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
					<EnvelopeIcon className={`size-5 ${duotoneColors.sky.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Change Email</p>
					<p className="mt-0.5 text-sm text-zinc-500">A verification email will be sent to your new address.</p>
				</div>
			</div>

			{success ? (
				<div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
					<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
						<CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
					</div>
					<p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">Verification email sent!</p>
					<p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
						Please check your inbox and click the verification link.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{error && (
						<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					)}
					<div>
						<span className="text-sm font-medium text-zinc-900 dark:text-white">Current Email</span>
						<p className="mt-1 text-sm text-zinc-500">{currentEmail}</p>
					</div>
					<div>
						<label htmlFor="new-email" className="text-sm font-medium text-zinc-900 dark:text-white">
							New Email
						</label>
						<Input
							id="new-email"
							type="email"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							className="mt-1.5"
							placeholder="Enter new email address"
							onKeyDown={(e) => e.key === "Enter" && doSubmit()}
						/>
					</div>
				</div>
			)}

			{!success && (
				<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
					<Button plain onClick={handleClose} disabled={changeEmail.isPending}>
						Cancel
					</Button>
					<Button color="dark/zinc" onClick={doSubmit} disabled={changeEmail.isPending || !newEmail.trim()}>
						{changeEmail.isPending ? "Sending..." : "Send Verification"}
					</Button>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// ACTIVE SESSIONS PANEL
// =============================================================================

function ActiveSessionsPanel() {
	const { data: deviceSessions, loading: deviceLoading } = useDeviceSessionsList();
	const { data: sessions, currentToken, loading: sessionsLoading } = useDeviceSessions();
	const revokeSession = useRevokeSession();
	const revokeDeviceSession = useRevokeDeviceSession();
	const revokeOtherSessions = useRevokeOtherSessions();
	const revokeAllSessions = useRevokeAllSessions();
	const setActiveSession = useSetActiveSession();

	const hasDeviceSessions = deviceSessions.length > 0;
	const loading = deviceLoading || sessionsLoading;

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return "Unknown";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-IN", {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getDeviceIcon = (session: { iconType?: string; device?: string; userAgent?: string | null }) => {
		if (session.iconType === "smartphone") return DevicePhoneMobileIcon;
		if (session.iconType === "tablet") return DeviceTabletIcon;
		if (session.iconType === "mac" || session.iconType === "computer") return ComputerDesktopIcon;
		if (session.device) {
			const d = session.device.toLowerCase();
			if (d.includes("mobile") || d.includes("phone")) return DevicePhoneMobileIcon;
			if (d.includes("tablet") || d.includes("ipad")) return DeviceTabletIcon;
		}
		if (!session.userAgent) return ComputerDesktopIcon;
		const ua = session.userAgent.toLowerCase();
		if (ua.includes("ipad") || ua.includes("tablet")) return DeviceTabletIcon;
		if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return DevicePhoneMobileIcon;
		return ComputerDesktopIcon;
	};

	const getDeviceName = (session: { device?: string; userAgent?: string | null }) => {
		if (session.device) return session.device;
		if (!session.userAgent) return "Unknown Device";
		const ua = session.userAgent.toLowerCase();
		if (ua.includes("iphone")) return "iPhone";
		if (ua.includes("ipad")) return "iPad";
		if (ua.includes("android")) return "Android";
		if (ua.includes("mac")) return "Mac";
		if (ua.includes("windows")) return "Windows";
		if (ua.includes("linux")) return "Linux";
		return "Unknown Device";
	};

	const getBrowserName = (session: { browser?: string; userAgent?: string | null }) => {
		if (session.browser) return session.browser;
		if (!session.userAgent) return "";
		const ua = session.userAgent.toLowerCase();
		if (ua.includes("edg")) return "Edge";
		if (ua.includes("chrome")) return "Chrome";
		if (ua.includes("safari")) return "Safari";
		if (ua.includes("firefox")) return "Firefox";
		return "";
	};

	const getDeviceLabel = (session: { device?: string; browser?: string; userAgent?: string | null }) => {
		const device = getDeviceName(session);
		const browser = getBrowserName(session);
		if (browser && device !== "Unknown Device") return `${browser} on ${device}`;
		if (browser) return browser;
		return device;
	};

	const sessionList = hasDeviceSessions ? deviceSessions : sessions;
	const hasMultiple = sessionList.length > 1;

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
					<ComputerDesktopIcon className={`size-5 ${duotoneColors.sky.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Active Sessions</p>
					<p className="mt-0.5 text-sm text-zinc-500">Manage your active sessions across devices.</p>
				</div>
			</div>

			{loading ? (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
					))}
				</div>
			) : hasDeviceSessions ? (
				<div className="space-y-3">
					{deviceSessions.map((session) => {
						const DeviceIcon = getDeviceIcon(session);
						const isCurrent = session.current;
						return (
							<div
								key={session.id}
								className={`flex items-center gap-4 rounded-xl p-4 ${
									isCurrent
										? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-800"
										: "bg-zinc-50 dark:bg-zinc-800/50"
								}`}
							>
								<div
									className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
										isCurrent ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-zinc-200 dark:bg-zinc-700"
									}`}
								>
									<DeviceIcon
										className={`size-5 ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">{getDeviceLabel(session)}</p>
										{isCurrent && (
											<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
												Current
											</span>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-zinc-500">
										{session.location && <span>{session.location}</span>}
										{session.location && <span>·</span>}
										<span>{formatDate(session.lastActive || session.createdAt)}</span>
									</div>
								</div>
								{!isCurrent && (
									<div className="flex items-center gap-1">
										<button
											type="button"
											onClick={() => setActiveSession.mutate(session.token)}
											disabled={setActiveSession.isPending}
											className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-700 dark:hover:text-white"
										>
											Switch
										</button>
										<button
											type="button"
											onClick={() => revokeDeviceSession.mutate(session.token)}
											disabled={revokeDeviceSession.isPending}
											className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-red-500 dark:hover:bg-zinc-700"
										>
											<XMarkIcon className="size-4" />
										</button>
									</div>
								)}
							</div>
						);
					})}
				</div>
			) : sessions.length === 0 ? (
				<div className="rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/50">
					<p className="text-sm text-zinc-500">No active sessions found</p>
				</div>
			) : (
				<div className="space-y-3">
					{sessions.map((session) => {
						const DeviceIcon = getDeviceIcon(session);
						const isCurrent = session.token === currentToken;
						return (
							<div
								key={session.id}
								className={`flex items-center gap-4 rounded-xl p-4 ${
									isCurrent
										? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-800"
										: "bg-zinc-50 dark:bg-zinc-800/50"
								}`}
							>
								<div
									className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
										isCurrent ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-zinc-200 dark:bg-zinc-700"
									}`}
								>
									<DeviceIcon
										className={`size-5 ${isCurrent ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium text-zinc-900 dark:text-white">{getDeviceLabel(session)}</p>
										{isCurrent && (
											<span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
												Current
											</span>
										)}
									</div>
									<p className="text-xs text-zinc-500">Last active: {formatDate(session.createdAt)}</p>
								</div>
								{!isCurrent && (
									<button
										type="button"
										onClick={() => revokeSession.mutate(session.token)}
										disabled={revokeSession.isPending}
										className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-red-500 dark:hover:bg-zinc-700"
									>
										<XMarkIcon className="size-4" />
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}

			{hasMultiple && (
				<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
					<Button outline onClick={() => revokeOtherSessions.mutate()} disabled={revokeOtherSessions.isPending}>
						{revokeOtherSessions.isPending ? "Revoking..." : "Sign Out Other Sessions"}
					</Button>
					<Button color="red" onClick={() => revokeAllSessions.mutate()} disabled={revokeAllSessions.isPending}>
						{revokeAllSessions.isPending ? "Revoking..." : "Sign Out Everywhere"}
					</Button>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// EDIT USER PROFILE PANEL
// =============================================================================

function EditUserProfilePanel({ initialName, initialImage }: { initialName: string; initialImage?: string | null }) {
	const panelNav = usePanelNav();
	const [name, setName] = useState(initialName);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(initialImage || null);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [isPending, setIsPending] = useState(false);

	const handleClose = () => panelNav?.popPanel();

	const handleAvatarChange = (file: File | null) => {
		setAvatarFile(file);
		if (file) {
			const url = URL.createObjectURL(file);
			setAvatarPreview(url);
		} else {
			setAvatarPreview(initialImage || null);
		}
	};

	const doSubmit = async () => {
		setError(null);

		if (!name.trim()) {
			setError("Name is required");
			return;
		}

		setIsPending(true);
		try {
			const { getAuthenticatedClient } = await import("@/hooks/api-client");
			const client = getAuthenticatedClient();

			let imageUrl: string | undefined;

			// Upload avatar if changed
			if (avatarFile) {
				// Upload flow — request signed URL then upload to S3
				const { uploadUrl, fileUrl } = await client.storage.requestUploadUrl({
					filename: avatarFile.name,
					contentType: avatarFile.type,
					folder: "profile-pictures",
				});
				await fetch(uploadUrl, {
					method: "PUT",
					body: avatarFile,
					headers: { "Content-Type": avatarFile.type },
				});
				imageUrl = fileUrl;
			}

			await client.auth.updateUser({
				name: name.trim(),
				...(imageUrl ? { image: imageUrl } : {}),
			});

			const currentUser = useAuthStore.getState().user;
			if (currentUser) {
				useAuthStore.getState().setUser({
					...currentUser,
					name: name.trim(),
					...(imageUrl ? { image: imageUrl } : {}),
				});
			}
			setSuccess(true);
			setTimeout(() => handleClose(), 1500);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to update profile"));
		} finally {
			setIsPending(false);
		}
	};

	useEffect(() => {
		setName(initialName);
	}, [initialName]);

	useEffect(() => {
		setAvatarPreview(initialImage || null);
	}, [initialImage]);

	// Cleanup object URL on unmount
	useEffect(() => {
		return () => {
			if (avatarPreview?.startsWith("blob:")) {
				URL.revokeObjectURL(avatarPreview);
			}
		};
	}, [avatarPreview]);

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
					<UserIcon className={`size-5 ${duotoneColors.sky.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Edit Profile</p>
					<p className="mt-0.5 text-sm text-zinc-500">Update your name and profile picture.</p>
				</div>
			</div>

			{success ? (
				<div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
					<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
						<CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
					</div>
					<p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
						Profile updated successfully!
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{error && (
						<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					)}

					{/* Avatar upload */}
					<div className="flex flex-col items-center gap-2">
						<p className="text-sm font-medium text-zinc-900 dark:text-white">Profile Picture</p>
						<AvatarUpload
							src={avatarPreview || undefined}
							onFileChange={handleAvatarChange}
							size={80}
							disabled={isPending}
						/>
						<p className="text-xs text-zinc-400">Click or drag to upload</p>
					</div>

					<div>
						<label htmlFor="user-name" className="text-sm font-medium text-zinc-900 dark:text-white">
							Full Name
						</label>
						<Input
							id="user-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="mt-1.5"
							placeholder="Enter your name"
							onKeyDown={(e) => e.key === "Enter" && doSubmit()}
						/>
					</div>
				</div>
			)}

			{!success && (
				<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
					<Button plain onClick={handleClose} disabled={isPending}>
						Cancel
					</Button>
					<Button color="dark/zinc" onClick={doSubmit} disabled={isPending || !name.trim()}>
						{isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// TWO-FACTOR AUTHENTICATION PANEL
// =============================================================================

type TwoFactorStep = "password" | "qr" | "verify" | "backup" | "disable-confirm" | "done";

function TwoFactorPanel({ isEnabled }: { isEnabled: boolean }) {
	const panelNav = usePanelNav();
	const [step, setStep] = useState<TwoFactorStep>("password");
	const [password, setPassword] = useState("");
	const [totpUri, setTotpUri] = useState("");
	const [code, setCode] = useState("");
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	const enable2FA = useTwoFactorEnable();
	const disable2FA = useTwoFactorDisable();
	const getTotpUri = useTwoFactorGetTotpUri();
	const verifyTotp = useTwoFactorVerifyTotp();

	const handleClose = () => panelNav?.popPanel();

	const handlePasswordStep = async () => {
		setError(null);
		if (!password.trim()) {
			setError("Password is required");
			return;
		}

		try {
			if (isEnabled) {
				setStep("disable-confirm");
			} else {
				const result = await getTotpUri.mutateAsync({ password });
				setTotpUri(result.totpURI);
				setStep("qr");
			}
		} catch (err) {
			setError(getAPIErrorMessage(err, "Invalid password"));
		}
	};

	const handleVerify = async () => {
		setError(null);
		if (code.length !== 6) {
			setError("Enter a 6-digit code");
			return;
		}

		try {
			const result = await enable2FA.mutateAsync({ password, issuer: "Hypedrive" });
			if (result.backupCodes?.length) {
				setBackupCodes(result.backupCodes);
			}
			await verifyTotp.mutateAsync({ twoFactorToken: password, code, trustDevice: true });
			setStep("backup");
		} catch (err) {
			setError(getAPIErrorMessage(err, "Invalid code. Please try again."));
		}
	};

	const handleDisable = async () => {
		setError(null);
		try {
			await disable2FA.mutateAsync({ password });
			setStep("done");
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to disable 2FA"));
		}
	};

	const isPending = enable2FA.isPending || disable2FA.isPending || getTotpUri.isPending || verifyTotp.isPending;

	const stepDescription = {
		password: "Enter your password to continue.",
		qr: "Scan this QR code with your authenticator app.",
		verify: "Enter the 6-digit code from your authenticator app.",
		backup: "Save these backup codes in a safe place.",
		"disable-confirm": "Are you sure you want to disable 2FA?",
		done: "Two-factor authentication has been updated.",
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.emerald.bg}`}>
					<ShieldCheckIcon className={`size-5 ${duotoneColors.emerald.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">
						{isEnabled ? "Manage Two-Factor Authentication" : "Enable Two-Factor Authentication"}
					</p>
					<p className="mt-0.5 text-sm text-zinc-500">{stepDescription[step]}</p>
				</div>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{step === "password" && (
				<div>
					<label htmlFor="two-fa-password" className="text-sm font-medium text-zinc-900 dark:text-white">
						Password
					</label>
					<Input
						id="two-fa-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1.5"
						placeholder="Enter your password"
						onKeyDown={(e) => e.key === "Enter" && handlePasswordStep()}
					/>
				</div>
			)}

			{step === "qr" && (
				<div className="space-y-4">
					<div className="flex justify-center rounded-xl bg-white p-6 dark:bg-zinc-800">
						<div className="text-center">
							<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Add this key to your authenticator app:
							</p>
							<div className="mt-3 rounded-lg bg-zinc-100 px-4 py-3 dark:bg-zinc-700">
								<code className="break-all text-xs text-zinc-900 dark:text-white">
									{totpUri.includes("secret=") ? (totpUri.split("secret=")[1]?.split("&")[0] ?? totpUri) : totpUri}
								</code>
							</div>
							<button
								type="button"
								className="mt-2 text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
								onClick={() => navigator.clipboard.writeText(totpUri)}
							>
								Copy full URI
							</button>
						</div>
					</div>
					<p className="text-center text-xs text-zinc-500">
						Use Google Authenticator, Authy, or any TOTP-compatible app.
					</p>
				</div>
			)}

			{step === "verify" && (
				<div>
					<label htmlFor="totp-code" className="text-sm font-medium text-zinc-900 dark:text-white">
						Verification Code
					</label>
					<Input
						id="totp-code"
						value={code}
						onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
						className="mt-1.5"
						placeholder="000000"
						maxLength={6}
						autoComplete="one-time-code"
						onKeyDown={(e) => e.key === "Enter" && handleVerify()}
					/>
				</div>
			)}

			{step === "backup" && (
				<div className="space-y-3">
					<div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
						<p className="text-sm font-medium text-amber-800 dark:text-amber-300">
							Save these codes — you won't see them again!
						</p>
						<p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
							Use a backup code to sign in if you lose access to your authenticator.
						</p>
					</div>
					<div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
						{backupCodes.map((codeItem) => (
							<code
								key={codeItem}
								className="rounded bg-white px-2 py-1 text-center text-sm font-mono text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
							>
								{codeItem}
							</code>
						))}
					</div>
					<button
						type="button"
						className="w-full text-center text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
						onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}
					>
						Copy all codes
					</button>
				</div>
			)}

			{step === "disable-confirm" && (
				<div className="rounded-xl bg-red-50 p-4 text-center dark:bg-red-950/30">
					<p className="text-sm text-red-700 dark:text-red-300">
						Disabling 2FA will make your account less secure. You can re-enable it later.
					</p>
				</div>
			)}

			{step === "done" && (
				<div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
					<div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
						<CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
					</div>
					<p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
						{isEnabled ? "Two-factor authentication disabled." : "Two-factor authentication enabled!"}
					</p>
				</div>
			)}

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				{step === "done" ? (
					<Button color="dark/zinc" onClick={handleClose}>
						Done
					</Button>
				) : (
					<>
						<Button plain onClick={handleClose} disabled={isPending}>
							Cancel
						</Button>
						{step === "password" && (
							<Button color="dark/zinc" onClick={handlePasswordStep} disabled={isPending || !password.trim()}>
								{isPending ? "Verifying..." : "Continue"}
							</Button>
						)}
						{step === "qr" && (
							<Button color="dark/zinc" onClick={() => setStep("verify")}>
								I've Added the Key
							</Button>
						)}
						{step === "verify" && (
							<Button color="dark/zinc" onClick={handleVerify} disabled={isPending || code.length !== 6}>
								{isPending ? "Verifying..." : "Verify & Enable"}
							</Button>
						)}
						{step === "backup" && (
							<Button color="dark/zinc" onClick={handleClose}>
								Done
							</Button>
						)}
						{step === "disable-confirm" && (
							<Button color="red" onClick={handleDisable} disabled={isPending}>
								{isPending ? "Disabling..." : "Disable 2FA"}
							</Button>
						)}
					</>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// PASSKEYS PANEL
// =============================================================================

function PasskeysPanel() {
	const panelNav = usePanelNav();
	const { data: passkeys, loading } = usePasskeyList();
	const registerOptions = usePasskeyRegisterOptions();
	const register = usePasskeyRegister();
	const deletePasskey = usePasskeyDelete();
	const updateName = usePasskeyUpdateName();

	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [registering, setRegistering] = useState(false);

	const handleRegister = async () => {
		setError(null);
		setRegistering(true);
		try {
			const { options, challengeCookie } = await registerOptions.mutateAsync({
				authenticatorAttachment: "platform",
			});
			const attestation = await startRegistration({
				optionsJSON: options as Parameters<typeof startRegistration>[0]["optionsJSON"],
			});
			await register.mutateAsync({ response: attestation, name: "My Passkey", challengeCookie });
		} catch (err) {
			if (err instanceof DOMException && err.name === "NotAllowedError") {
				setError("Passkey registration was cancelled.");
			} else {
				setError(getAPIErrorMessage(err, "Failed to register passkey"));
			}
		} finally {
			setRegistering(false);
		}
	};

	const handleDelete = async (id: string) => {
		setError(null);
		try {
			await deletePasskey.mutateAsync(id);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to delete passkey"));
		}
	};

	const handleRename = async (id: string) => {
		if (!editName.trim()) return;
		setError(null);
		try {
			await updateName.mutateAsync({ id, name: editName.trim() });
			setEditingId(null);
			setEditName("");
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to rename passkey"));
		}
	};

	const isPending =
		registerOptions.isPending || register.isPending || deletePasskey.isPending || updateName.isPending || registering;

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.violet.bg}`}>
					<FingerPrintIcon className={`size-5 ${duotoneColors.violet.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Passkeys</p>
					<p className="mt-0.5 text-sm text-zinc-500">
						Sign in securely without a password using biometrics or a security key.
					</p>
				</div>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{loading ? (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
					))}
				</div>
			) : passkeys.length === 0 ? (
				<div className="rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/50">
					<FingerPrintIcon className="mx-auto size-8 text-zinc-300 dark:text-zinc-600" />
					<p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">No passkeys registered</p>
					<p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
						Add a passkey to sign in faster and more securely.
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{passkeys.map((pk) => (
						<div key={pk.id} className="flex items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
								<FingerPrintIcon className="size-4 text-zinc-500" />
							</div>
							<div className="min-w-0 flex-1">
								{editingId === pk.id ? (
									<div className="flex items-center gap-2">
										<Input
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											className="h-8 text-sm"
											onKeyDown={(e) => e.key === "Enter" && handleRename(pk.id)}
											autoFocus
										/>
										<Button plain onClick={() => handleRename(pk.id)} disabled={updateName.isPending}>
											Save
										</Button>
										<Button
											plain
											onClick={() => {
												setEditingId(null);
												setEditName("");
											}}
										>
											Cancel
										</Button>
									</div>
								) : (
									<>
										<p className="text-sm font-medium text-zinc-900 dark:text-white">{pk.name || "Unnamed Passkey"}</p>
										<p className="text-xs text-zinc-400">
											{pk.deviceType} {pk.backedUp ? "· Backed up" : ""}
										</p>
									</>
								)}
							</div>
							{editingId !== pk.id && (
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => {
											setEditingId(pk.id);
											setEditName(pk.name || "");
										}}
										className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700"
									>
										<PencilSquareIcon className="size-3.5" />
									</button>
									<button
										type="button"
										onClick={() => handleDelete(pk.id)}
										disabled={deletePasskey.isPending}
										className="flex size-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
									>
										<TrashIcon className="size-3.5" />
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={() => panelNav?.popPanel()}>
					Close
				</Button>
				<Button color="dark/zinc" onClick={handleRegister} disabled={isPending}>
					{registering ? "Registering..." : "Add Passkey"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// VIEW BACKUP CODES PANEL
// =============================================================================

function ViewBackupCodesPanel() {
	const panelNav = usePanelNav();
	const [password, setPassword] = useState("");
	const [codes, setCodes] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [isRegenerated, setIsRegenerated] = useState(false);
	const viewCodes = useTwoFactorViewBackupCodes();
	const generateCodes = useTwoFactorGenerateBackupCodes();

	const handleSubmit = async () => {
		setError(null);
		try {
			const result = await viewCodes.mutateAsync({ password });
			setCodes(result.backupCodes);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to view backup codes"));
		}
	};

	const handleRegenerate = async () => {
		if (!window.confirm("This will invalidate all existing backup codes. Are you sure?")) return;
		setError(null);
		try {
			const result = await generateCodes.mutateAsync({ password });
			setCodes(result.backupCodes);
			setIsRegenerated(true);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to regenerate backup codes"));
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
					<ClipboardDocumentListIcon className={`size-5 ${duotoneColors.amber.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Backup Codes</p>
					<p className="mt-0.5 text-sm text-zinc-500">
						{codes.length > 0
							? isRegenerated
								? "New backup codes generated. Save them now — old codes are invalidated."
								: "Keep these codes safe."
							: "Enter your password to view backup codes."}
					</p>
				</div>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{codes.length > 0 ? (
				<div className="space-y-3">
					<div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
						{codes.map((c) => (
							<code
								key={c}
								className="rounded bg-white px-2 py-1 text-center font-mono text-sm text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
							>
								{c}
							</code>
						))}
					</div>
					<div className="flex items-center justify-between">
						<button
							type="button"
							className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:hover:text-zinc-300"
							onClick={() => navigator.clipboard.writeText(codes.join("\n"))}
						>
							Copy all codes
						</button>
						<button
							type="button"
							className="text-xs text-amber-600 underline hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
							onClick={handleRegenerate}
							disabled={generateCodes.isPending}
						>
							{generateCodes.isPending ? "Regenerating..." : "Regenerate codes"}
						</button>
					</div>
				</div>
			) : (
				<div>
					<label htmlFor="backup-password" className="text-sm font-medium text-zinc-900 dark:text-white">
						Password
					</label>
					<Input
						id="backup-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1.5"
						placeholder="Enter your password"
						onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
					/>
				</div>
			)}

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={() => panelNav?.popPanel()}>
					{codes.length > 0 ? "Close" : "Cancel"}
				</Button>
				{codes.length === 0 && (
					<Button color="dark/zinc" onClick={handleSubmit} disabled={viewCodes.isPending || !password.trim()}>
						{viewCodes.isPending ? "Verifying..." : "View Codes"}
					</Button>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// SET PASSWORD PANEL (for social-auth users without a password)
// =============================================================================

function SetPasswordPanel() {
	const panelNav = usePanelNav();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const setPasswordMutation = useSetPassword();

	const handleSubmit = async () => {
		setError(null);
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		try {
			await setPasswordMutation.mutateAsync({ newPassword });
			setSuccess(true);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to set password"));
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.emerald.bg}`}>
					<LockClosedIcon className={`size-5 ${duotoneColors.emerald.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Set Password</p>
					<p className="mt-0.5 text-sm text-zinc-500">
						{success
							? "Password has been set successfully."
							: "Create a password to enable email sign-in alongside your social accounts."}
					</p>
				</div>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			{success ? (
				<div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
					<CheckCircleIcon className="size-5 text-emerald-500" />
					<p className="text-sm text-emerald-700 dark:text-emerald-300">
						You can now sign in with your email and password.
					</p>
				</div>
			) : (
				<div className="space-y-4">
					<div>
						<label htmlFor="set-new-password" className="text-sm font-medium text-zinc-900 dark:text-white">
							New Password
						</label>
						<Input
							id="set-new-password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="mt-1.5"
							placeholder="At least 8 characters"
						/>
					</div>
					<div>
						<label htmlFor="set-confirm-password" className="text-sm font-medium text-zinc-900 dark:text-white">
							Confirm Password
						</label>
						<Input
							id="set-confirm-password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className="mt-1.5"
							placeholder="Confirm your password"
							onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
						/>
					</div>
				</div>
			)}

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={() => panelNav?.popPanel()}>
					{success ? "Close" : "Cancel"}
				</Button>
				{!success && (
					<Button
						color="dark/zinc"
						onClick={handleSubmit}
						disabled={setPasswordMutation.isPending || !newPassword.trim() || !confirmPassword.trim()}
					>
						{setPasswordMutation.isPending ? "Setting..." : "Set Password"}
					</Button>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// DELETE ACCOUNT PANEL
// =============================================================================

function DeleteAccountPanel() {
	const panelNav = usePanelNav();
	const [password, setPassword] = useState("");
	const [confirmText, setConfirmText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const deleteUser = useDeleteUser();
	const logout = useLogout();
	const navigate = useNavigate();

	const handleDelete = async () => {
		setError(null);
		if (confirmText !== "DELETE") {
			setError("Please type DELETE to confirm");
			return;
		}
		try {
			await deleteUser.mutateAsync({ password });
			const result = await logout.mutateAsync();
			if (result.redirectTo) {
				navigate({ to: result.redirectTo as "/" | "/login" });
			}
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to delete account"));
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/30">
					<TrashIcon className="size-5 text-red-600 dark:text-red-400" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Delete Account</p>
					<p className="mt-0.5 text-sm text-zinc-500">This action is permanent and cannot be undone.</p>
				</div>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<div className="space-y-4">
				<div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/30">
					<p className="text-sm text-red-700 dark:text-red-300">
						Deleting your account will permanently remove all your data, organizations, and settings. This cannot be
						recovered.
					</p>
				</div>
				<div>
					<label htmlFor="delete-password" className="text-sm font-medium text-zinc-900 dark:text-white">
						Password
					</label>
					<Input
						id="delete-password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="mt-1.5"
						placeholder="Enter your password"
					/>
				</div>
				<div>
					<label htmlFor="delete-confirm" className="text-sm font-medium text-zinc-900 dark:text-white">
						Type DELETE to confirm
					</label>
					<Input
						id="delete-confirm"
						value={confirmText}
						onChange={(e) => setConfirmText(e.target.value)}
						className="mt-1.5"
						placeholder="DELETE"
					/>
				</div>
			</div>

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={() => panelNav?.popPanel()} disabled={deleteUser.isPending}>
					Cancel
				</Button>
				<Button
					color="red"
					onClick={handleDelete}
					disabled={deleteUser.isPending || confirmText !== "DELETE" || !password.trim()}
				>
					{deleteUser.isPending ? "Deleting..." : "Delete My Account"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// LINKED ACCOUNTS PANEL
// =============================================================================

const SOCIAL_PROVIDERS = [{ id: "google", label: "Google", icon: GoogleIcon, color: "red" as const }];

function LinkedAccountsPanel() {
	const panelNav = usePanelNav();
	const { data: accounts, loading, refetch } = useLinkedAccounts();
	const linkSocial = useLinkSocial();
	const unlinkAccount = useUnlinkAccount();
	const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

	const handleLink = async (providerId: string) => {
		try {
			const result = await linkSocial.mutateAsync({
				provider: providerId,
				callbackURL: window.location.href,
				errorCallbackURL: window.location.href,
			});
			if (result.url && result.redirect) {
				window.location.href = result.url;
			} else {
				refetch();
			}
		} catch (err) {
			console.error("Failed to link account:", getAPIErrorMessage(err));
		}
	};

	const handleUnlink = async (providerId: string, accountId: string) => {
		setUnlinkingId(accountId);
		try {
			await unlinkAccount.mutateAsync({ providerId, accountId });
			refetch();
		} catch (err) {
			console.error("Failed to unlink account:", getAPIErrorMessage(err));
		} finally {
			setUnlinkingId(null);
		}
	};

	return (
		<div className="space-y-5">
			<div className="flex items-start gap-4">
				<div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
					<Square2StackIcon className={`size-5 ${duotoneColors.sky.icon}`} />
				</div>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-zinc-900 dark:text-white">Linked Accounts</p>
					<p className="mt-0.5 text-sm text-zinc-500">Connect social accounts for easier sign-in.</p>
				</div>
			</div>

			{loading ? (
				<div className="space-y-3">
					{[1, 2].map((i) => (
						<div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
					))}
				</div>
			) : (
				<div className="space-y-3">
					{SOCIAL_PROVIDERS.map((provider) => {
						const linked = accounts.find((a) => a.providerId === provider.id);
						const ProviderIcon = provider.icon;
						return (
							<div
								key={provider.id}
								className={`flex items-center gap-4 rounded-xl p-4 ${
									linked
										? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-800"
										: "bg-zinc-50 dark:bg-zinc-800/50"
								}`}
							>
								<div
									className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
										linked ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-zinc-200 dark:bg-zinc-700"
									}`}
								>
									<ProviderIcon
										className={`size-5 ${linked ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}`}
									/>
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium text-zinc-900 dark:text-white">{provider.label}</p>
									<p className="text-xs text-zinc-500">{linked ? "Connected" : "Not connected"}</p>
								</div>
								{linked ? (
									<Button
										plain
										onClick={() => handleUnlink(provider.id, linked.accountId)}
										disabled={unlinkingId === linked.accountId}
										className="text-red-500 hover:text-red-700"
									>
										{unlinkingId === linked.accountId ? "Removing..." : "Disconnect"}
									</Button>
								) : (
									<Button outline onClick={() => handleLink(provider.id)} disabled={linkSocial.isPending}>
										Connect
									</Button>
								)}
							</div>
						);
					})}

					{accounts
						.filter((a) => !SOCIAL_PROVIDERS.some((p) => p.id === a.providerId))
						.map((account) => (
							<div
								key={account.id}
								className="flex items-center gap-4 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-800"
							>
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
									<GlobeAltIcon className="size-5 text-emerald-600 dark:text-emerald-400" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium capitalize text-zinc-900 dark:text-white">{account.providerId}</p>
									<p className="text-xs text-zinc-500">Connected</p>
								</div>
								<Button
									plain
									onClick={() => handleUnlink(account.providerId, account.accountId)}
									disabled={unlinkingId === account.accountId}
									className="text-red-500 hover:text-red-700"
								>
									{unlinkingId === account.accountId ? "Removing..." : "Disconnect"}
								</Button>
							</div>
						))}
				</div>
			)}

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={() => panelNav?.popPanel()}>
					Close
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// PENDING INVITATIONS SECTION
// =============================================================================

function PendingInvitationsSection() {
	const { data: invitations, loading } = useUserInvitations();
	const acceptInvitation = useAcceptInvitation();
	const rejectInvitation = useRejectInvitation();
	const [processingId, setProcessingId] = useState<string | null>(null);

	const handleAccept = async (organizationId: string, invitationId: string) => {
		setProcessingId(invitationId);
		try {
			await acceptInvitation.mutateAsync({ organizationId, invitationId });
		} catch (err) {
			console.error("Failed to accept invitation:", getAPIErrorMessage(err));
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (organizationId: string, invitationId: string) => {
		setProcessingId(invitationId);
		try {
			await rejectInvitation.mutateAsync({ organizationId, invitationId });
		} catch (err) {
			console.error("Failed to reject invitation:", getAPIErrorMessage(err));
		} finally {
			setProcessingId(null);
		}
	};

	if (loading) {
		return (
			<div>
				<MenuSectionHeader>Pending Invitations</MenuSectionHeader>
				<MenuSection>
					<div className="px-4 py-6">
						<div className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
					</div>
				</MenuSection>
			</div>
		);
	}

	if (!invitations || invitations.length === 0) return null;

	return (
		<div>
			<MenuSectionHeader>Pending Invitations</MenuSectionHeader>
			<MenuSection>
				<div className="space-y-0 divide-y divide-zinc-200 dark:divide-zinc-800">
					{invitations.map((invitation, index) => (
						<div
							key={invitation.id}
							className={`flex items-center gap-4 px-4 py-4 ${
								index === 0 ? "rounded-t-2xl" : ""
							} ${index === invitations.length - 1 ? "rounded-b-2xl" : ""}`}
						>
							<div
								className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.violet.bg}`}
							>
								<EnvelopeOpenIcon className={`size-5 ${duotoneColors.violet.icon}`} />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium text-zinc-900 dark:text-white">Organization invitation</p>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									Role: {invitation.role || "member"} · {invitation.email}
								</p>
							</div>
							<div className="flex shrink-0 gap-2">
								<Button
									outline
									onClick={() => handleReject(invitation.organizationId, invitation.id)}
									disabled={processingId === invitation.id}
								>
									Decline
								</Button>
								<Button
									color="dark/zinc"
									onClick={() => handleAccept(invitation.organizationId, invitation.id)}
									disabled={processingId === invitation.id}
								>
									{processingId === invitation.id ? "..." : "Accept"}
								</Button>
							</div>
						</div>
					))}
				</div>
			</MenuSection>
			<MenuSectionFooter>Accept an invitation to join the organization.</MenuSectionFooter>
		</div>
	);
}

// =============================================================================
// ACCOUNT SETTINGS PAGE
// =============================================================================

export type AccountSettingsSection = "profile" | "security" | "passkeys" | "preferences" | "all";

export function AccountSettings({ section = "all" }: { section?: AccountSettingsSection } = {}) {
	const user = useAuthStore((state) => state.user);
	const logout = useLogout();
	const navigate = useNavigate();
	const { data: sessions } = useDeviceSessions();
	const panelNav = usePanelNav();

	// Notification preferences — local optimistic state for toggles
	const { organization, organizationId } = useOrgContext();
	const updateNotifPrefs = useUpdateNotificationPreferences(organizationId);
	const [emailNotifications, setEmailNotifications] = useState(true);
	const [pushNotifications, setPushNotifications] = useState(() => {
		if (typeof window !== "undefined" && "Notification" in window) {
			return Notification.permission === "granted";
		}
		return false;
	});

	// Push notification tokens (API returns void — token list not available yet)
	const removePushToken = useRemovePushToken(organizationId);
	const pushTokens: { token: string; platform: string }[] = [];

	// User info for 2FA status
	const { data: userInfoData } = useUserInfo();
	const is2FAEnabled = userInfoData?.twoFactorEnabled ?? false;

	// Check if user has a credential (password) account — if not, show "Set Password"
	const { data: linkedAccounts } = useLinkedAccounts();
	const hasPasswordAccount = linkedAccounts.some((a) => a.providerId === "credential");

	const handleNotificationChange = async (channel: "email" | "push", value: boolean) => {
		if (channel === "email") {
			setEmailNotifications(value);
			updateNotifPrefs.mutate({ emailEnabled: value });
		} else {
			if (value) {
				// Request browser notification permission
				if (!("Notification" in window)) {
					return; // Browser doesn't support notifications
				}

				const permission = await Notification.requestPermission();
				if (permission === "granted") {
					setPushNotifications(true);
					updateNotifPrefs.mutate({ pushEnabled: true });
				} else {
					// Permission denied or dismissed — keep toggle off
					setPushNotifications(false);
				}
			} else {
				setPushNotifications(false);
				updateNotifPrefs.mutate({ pushEnabled: false });
			}
		}
	};

	const handleLogout = async () => {
		const result = await logout.mutateAsync();
		if (result.success && result.redirectTo) {
			navigate({ to: result.redirectTo as "/" | "/login" });
		}
	};

	const leaveOrganization = useLeaveOrganization();

	const handleLeaveOrganization = async () => {
		if (!organization?.id) return;
		if (
			!window.confirm(
				`Are you sure you want to leave "${organization.name}"? You will lose access to all organization data.`
			)
		)
			return;
		try {
			await leaveOrganization.mutateAsync(organization.id);
			navigate({ to: "/login" as "/" });
		} catch (err) {
			console.error("Failed to leave organization:", getAPIErrorMessage(err));
		}
	};

	const sessionCount = sessions?.length ?? 0;
	const show = (s: AccountSettingsSection) => section === "all" || section === s;

	// Panel openers
	const openEditProfile = () =>
		panelNav?.pushPanel(
			"edit-profile",
			"Edit Profile",
			<EditUserProfilePanel initialName={user?.name || ""} initialImage={user?.image} />
		);

	const openChangeEmail = () =>
		panelNav?.pushPanel("change-email", "Change Email", <ChangeEmailPanel currentEmail={user?.email || ""} />);

	const openChangePassword = () => panelNav?.pushPanel("change-password", "Change Password", <ChangePasswordPanel />);

	const openSetPassword = () => panelNav?.pushPanel("set-password", "Set Password", <SetPasswordPanel />);

	const openLinkedAccounts = () => panelNav?.pushPanel("linked-accounts", "Linked Accounts", <LinkedAccountsPanel />);

	const open2FA = () =>
		panelNav?.pushPanel("two-factor", "Two-Factor Authentication", <TwoFactorPanel isEnabled={is2FAEnabled} />);

	const openBackupCodes = () => panelNav?.pushPanel("backup-codes", "Backup Codes", <ViewBackupCodesPanel />);

	const openSessions = () => panelNav?.pushPanel("active-sessions", "Active Sessions", <ActiveSessionsPanel />);

	const openPasskeys = () => panelNav?.pushPanel("passkeys", "Passkeys", <PasskeysPanel />);

	const openDeleteAccount = () => panelNav?.pushPanel("delete-account", "Delete Account", <DeleteAccountPanel />);

	// --- Section: Profile ---
	const profileSection = (
		<>
			<UserProfileCard
				name={user?.name || "User"}
				email={user?.email || "—"}
				image={user?.image}
				onEditProfile={openEditProfile}
			/>
			<div>
				<MenuSectionHeader>Account</MenuSectionHeader>
				<MenuSection>
					<MenuRow
						icon={EnvelopeIcon}
						iconColor="orange"
						label="Email"
						value={user?.email || "—"}
						onClick={openChangeEmail}
						isFirst
					/>
					<MenuSeparator />
					{hasPasswordAccount ? (
						<MenuRow
							icon={LockClosedIcon}
							iconColor="amber"
							label="Password"
							value="••••••••"
							onClick={openChangePassword}
							isLast
						/>
					) : (
						<MenuRow
							icon={LockClosedIcon}
							iconColor="emerald"
							label="Set Password"
							value="Enable email sign-in"
							onClick={openSetPassword}
							isLast
						/>
					)}
				</MenuSection>
			</div>
			<div>
				<MenuSectionHeader>Linked Accounts</MenuSectionHeader>
				<MenuSection>
					<MenuRow
						icon={Square2StackIcon}
						iconColor="sky"
						label="Connected Accounts"
						value="Manage social sign-in"
						onClick={openLinkedAccounts}
						isFirst
						isLast
					/>
				</MenuSection>
				<MenuSectionFooter>Link social accounts to sign in faster.</MenuSectionFooter>
			</div>
			<PendingInvitationsSection />
		</>
	);

	// --- Section: Security ---
	const securitySection = (
		<div>
			<MenuSectionHeader>Security</MenuSectionHeader>
			<MenuSection>
				<MenuRow
					icon={ShieldCheckIcon}
					iconColor="emerald"
					label="Two-Factor Authentication"
					badge={is2FAEnabled ? "On" : "Off"}
					badgeColor={is2FAEnabled ? "emerald" : "zinc"}
					onClick={open2FA}
					isFirst
				/>
				<MenuSeparator />
				{is2FAEnabled && (
					<>
						<MenuRow
							icon={ClipboardDocumentListIcon}
							iconColor="amber"
							label="Backup Codes"
							value="View recovery codes"
							onClick={openBackupCodes}
						/>
						<MenuSeparator />
					</>
				)}
				<MenuRow
					icon={ComputerDesktopIcon}
					iconColor="sky"
					label="Active Sessions"
					badge={String(sessionCount)}
					badgeColor="emerald"
					onClick={openSessions}
					isLast
				/>
			</MenuSection>
		</div>
	);

	// --- Section: Passkeys ---
	const passkeysSection = (
		<div>
			<MenuSectionHeader>Passkeys</MenuSectionHeader>
			<MenuSection>
				<MenuRow
					icon={FingerPrintIcon}
					iconColor="violet"
					label="Passkeys"
					value="Biometric sign-in"
					onClick={openPasskeys}
					isFirst
					isLast
				/>
			</MenuSection>
			<MenuSectionFooter>Use Face ID, Touch ID, or a hardware key to sign in without a password.</MenuSectionFooter>
		</div>
	);

	// --- Section: Preferences ---
	const preferencesSection = (
		<>
			<div>
				<MenuSectionHeader>Notifications</MenuSectionHeader>
				<MenuSection>
					<MenuToggleRow
						icon={BellIcon}
						iconColor="amber"
						label="Email Notifications"
						description="Get notified about new orders"
						checked={emailNotifications}
						onChange={(value) => handleNotificationChange("email", value)}
						isFirst
					/>
					<MenuSeparator />
					<MenuToggleRow
						icon={DevicePhoneMobileIcon}
						iconColor="emerald"
						label="Push Notifications"
						description="Receive push notifications"
						checked={pushNotifications}
						onChange={(value) => handleNotificationChange("push", value)}
						isLast
					/>
				</MenuSection>
			</div>
			{pushTokens.length > 0 && (
				<div>
					<MenuSectionHeader>Registered Devices</MenuSectionHeader>
					<MenuSection>
						{pushTokens.map((token, index) => (
							<div key={token.token}>
								{index > 0 && <MenuSeparator />}
								<div
									className={`flex items-center gap-4 px-4 py-3 ${index === 0 ? "rounded-t-2xl" : ""} ${index === pushTokens.length - 1 ? "rounded-b-2xl" : ""}`}
								>
									<div
										className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}
									>
										<DevicePhoneMobileIcon className={`size-5 ${duotoneColors.sky.icon}`} />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium capitalize text-zinc-900 dark:text-white">
											{token.platform} Device
										</p>
										<p className="truncate text-xs text-zinc-500">Token: {token.token.slice(0, 16)}...</p>
									</div>
									<button
										type="button"
										onClick={async () => {
											try {
												await removePushToken.mutateAsync(token.token);
											} catch (err) {
												console.error("Failed to remove push token:", getAPIErrorMessage(err));
											}
										}}
										disabled={removePushToken.isPending}
										className="flex size-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
									>
										<XMarkIcon className="size-4" />
									</button>
								</div>
							</div>
						))}
					</MenuSection>
					<MenuSectionFooter>Remove a device to stop receiving push notifications on it.</MenuSectionFooter>
				</div>
			)}
			<div>
				<MenuSectionHeader>Sign Out & Danger Zone</MenuSectionHeader>
				<MenuSection>
					<MenuRow
						icon={ArrowRightStartOnRectangleIcon}
						iconColor="zinc"
						label="Sign Out"
						value="Sign out of this account"
						onClick={handleLogout}
						isFirst
					/>
					<MenuSeparator />
					<MenuRow
						icon={UserMinusIcon}
						iconColor="amber"
						label="Leave Organization"
						value="Remove yourself from this org"
						onClick={handleLeaveOrganization}
					/>
					<MenuSeparator />
					<MenuRow
						icon={TrashIcon}
						iconColor="red"
						label="Delete Account"
						value="Permanently delete your account"
						destructive
						onClick={openDeleteAccount}
						isLast
					/>
				</MenuSection>
				<MenuSectionFooter>
					Leaving an organization removes your access. Deleting your account is permanent.
				</MenuSectionFooter>
			</div>
		</>
	);

	const isDialog = section !== "all";

	return (
		<div className={isDialog ? "space-y-6 px-4 py-5 pb-10 sm:px-6" : "space-y-6 pb-20"}>
			{/* Page heading — only in full-page mode */}
			{section === "all" && (
				<div>
					<Heading>Account Settings</Heading>
					<Text className="mt-1">Manage your personal account and security preferences</Text>
				</div>
			)}

			{show("profile") && profileSection}
			{show("security") && securitySection}
			{show("passkeys") && passkeysSection}
			{show("preferences") && preferencesSection}

			{/* App version — only in full-page mode */}
			{section === "all" && (
				<div className="pt-4 text-center">
					<p className="text-xs text-zinc-400 dark:text-zinc-600">Hypedrive Brand v1.0.0</p>
				</div>
			)}
		</div>
	);
}
