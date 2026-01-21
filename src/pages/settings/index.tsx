import { Button } from "@/components/button";
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/dialog";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Text } from "@/components/text";
import {
  MenuSection,
  MenuSectionHeader,
  MenuSectionFooter,
  MenuRow,
  MenuSeparator,
  MenuToggleRow,
  MenuDangerButton,
  ThemeSelector,
  duotoneColors,
  type ThemeOption,
} from "@/components/shared/menu-list";
import {
  useChangePassword,
  useOrganizationProfile,
  useOrganizationStats,
  useUpdateOrganization,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  useFullOrganization,
  useChangeEmail,
  useDeviceSessions,
  useRevokeSession,
  useRevokeOtherSessions,
  useUserInfo,
  useTwoFactorEnable,
  useTwoFactorDisable,
  useTwoFactorGenerateBackupCodes,
  useBankAccounts,
  useAddBankAccount,
  useDeleteBankAccount,
  useSetDefaultBankAccount,
  useInvoices,
  getAPIErrorMessage,
} from "@/hooks/use-api";
import { useOrganizationId } from "@/store/organization-store";
import { useAuthStore } from "@/store/auth-store";
import {
  ArrowRightStartOnRectangleIcon,
  AtSymbolIcon,
  BellIcon,
  BuildingLibraryIcon,
  BuildingOffice2Icon,
  CameraIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  ComputerDesktopIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  KeyIcon,
  MapPinIcon,
  PaintBrushIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";

// =============================================================================
// SKELETON LOADING
// =============================================================================

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
      </div>

      {/* Profile card skeleton */}
      <div className="h-44 animate-pulse rounded-2xl bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />

      {/* Sections skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
          <div className="h-36 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// PROFILE HEADER CARD
// =============================================================================

function ProfileHeaderCard({
  name,
  email,
  stats,
  onEditProfile,
}: {
  name: string;
  email: string;
  stats: Array<{ label: string; value: string | number }>;
  onEditProfile: () => void;
}) {
  // Generate initials
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-zinc-900">
      {/* Decorative pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative p-5 sm:p-6">
        {/* Profile row */}
        <div className="flex items-center gap-4">
          {/* Avatar with edit button */}
          <div className="relative">
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white sm:size-20 sm:text-2xl">
              {initials}
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-zinc-900 transition-transform hover:scale-105 active:scale-95 dark:bg-zinc-700 dark:ring-zinc-800"
              aria-label="Edit profile"
            >
              <CameraIcon className="size-3.5 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-bold text-white sm:text-xl">{name}</h2>
            <p className="truncate text-sm text-zinc-400">{email}</p>
            <button
              type="button"
              onClick={onEditProfile}
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/20"
            >
              Edit Profile
              <ChevronRightIcon className="size-3" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:mt-6 sm:pt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold text-white sm:text-xl">{stat.value}</p>
              <p className="text-[11px] font-medium text-zinc-400 sm:text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CHANGE PASSWORD DIALOG
// =============================================================================

function ChangePasswordDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changePassword = useChangePassword();

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to change password"));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.amber.bg}`}>
          <KeyIcon className={`size-5 ${duotoneColors.amber.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription className="mt-1">
            Enter your current password and choose a new one.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                required
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
                placeholder="Min. 8 characters"
                required
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
                required
              />
            </div>
          </form>
        )}
      </DialogBody>

      {!success && (
        <DialogActions>
          <Button plain onClick={handleClose} disabled={changePassword.isPending}>
            Cancel
          </Button>
          <Button
            color="dark/zinc"
            onClick={handleSubmit}
            disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
          >
            {changePassword.isPending ? "Updating..." : "Update Password"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// =============================================================================
// EDIT PROFILE DIALOG
// =============================================================================

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string | undefined;
  initialName: string;
}

function EditProfileDialog({
  open,
  onClose,
  organizationId,
  initialName,
}: EditProfileDialogProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateOrganization = useUpdateOrganization();

  const resetForm = () => {
    setName(initialName);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organizationId) {
      setError("Organization not found");
      return;
    }

    if (!name.trim()) {
      setError("Organization name is required");
      return;
    }

    try {
      await updateOrganization.mutateAsync({
        organizationId,
        name: name.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to update profile"));
    }
  };

  // Update local state when initialName changes (e.g., dialog reopens)
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return (
    <Dialog open={open} onClose={handleClose} size="md">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
          <UserIcon className={`size-5 ${duotoneColors.sky.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="mt-1">
            Update your organization's profile information.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <div>
              <label htmlFor="org-name" className="text-sm font-medium text-zinc-900 dark:text-white">
                Organization Name
              </label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5"
                placeholder="Enter organization name"
                required
              />
            </div>
          </form>
        )}
      </DialogBody>

      {!success && (
        <DialogActions>
          <Button plain onClick={handleClose} disabled={updateOrganization.isPending}>
            Cancel
          </Button>
          <Button
            color="dark/zinc"
            onClick={handleSubmit}
            disabled={updateOrganization.isPending || !name.trim()}
          >
            {updateOrganization.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// =============================================================================
// CHANGE EMAIL DIALOG
// =============================================================================

function ChangeEmailDialog({
  open,
  onClose,
  currentEmail,
}: {
  open: boolean;
  onClose: () => void;
  currentEmail: string;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const changeEmail = useChangeEmail();

  const resetForm = () => {
    setNewEmail("");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      await changeEmail.mutateAsync({
        newEmail: newEmail.trim(),
        callbackURL: window.location.origin + "/settings",
      });
      setSuccess(true);
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to send verification email"));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} size="sm">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.orange.bg}`}>
          <AtSymbolIcon className={`size-5 ${duotoneColors.orange.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription className="mt-1">
            We'll send a verification link to your new email address.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        {success ? (
          <div className="flex flex-col items-center rounded-xl bg-emerald-50 p-6 text-center dark:bg-emerald-950/30">
            <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <CheckCircleIcon className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Verification email sent!
            </p>
            <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
              Check your inbox and click the link to confirm your new email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-zinc-900 dark:text-white">
                Current Email
              </label>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{currentEmail}</p>
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
                required
              />
            </div>
          </form>
        )}
      </DialogBody>

      {!success && (
        <DialogActions>
          <Button plain onClick={handleClose} disabled={changeEmail.isPending}>
            Cancel
          </Button>
          <Button
            color="dark/zinc"
            onClick={handleSubmit}
            disabled={changeEmail.isPending || !newEmail.trim()}
          >
            {changeEmail.isPending ? "Sending..." : "Send Verification"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

// =============================================================================
// ACTIVE SESSIONS DIALOG
// =============================================================================

function ActiveSessionsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { data: sessions, loading, refetch } = useDeviceSessions();
  const revokeSession = useRevokeSession();
  const revokeOtherSessions = useRevokeOtherSessions();
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevokeSession = async (sessionToken: string) => {
    setRevoking(sessionToken);
    try {
      await revokeSession.mutateAsync(sessionToken);
      refetch();
    } catch (err) {
      console.error("Failed to revoke session:", err);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeOthers = async () => {
    setRevoking("others");
    try {
      await revokeOtherSessions.mutateAsync();
      refetch();
    } catch (err) {
      console.error("Failed to revoke other sessions:", err);
    } finally {
      setRevoking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return ComputerDesktopIcon;
    const ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return DevicePhoneMobileIcon;
    }
    return ComputerDesktopIcon;
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
          <DevicePhoneMobileIcon className={`size-5 ${duotoneColors.sky.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogDescription className="mt-1">
            Manage devices where you're currently logged in.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/50">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.userAgent);
              const isCurrent = session.isCurrent;
              return (
                <div
                  key={session.token}
                  className={`flex items-center justify-between rounded-xl p-4 ${
                    isCurrent
                      ? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-900"
                      : "bg-zinc-50 dark:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${
                      isCurrent ? duotoneColors.emerald.bg : duotoneColors.zinc.bg
                    }`}>
                      <DeviceIcon className={`size-5 ${isCurrent ? duotoneColors.emerald.icon : duotoneColors.zinc.icon}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {session.userAgent?.split("/")[0] || "Unknown Device"}
                        {isCurrent && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {session.ipAddress} · Last active {formatDate(session.updatedAt || session.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <Button
                      plain
                      onClick={() => handleRevokeSession(session.token)}
                      disabled={revoking === session.token}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      {revoking === session.token ? "..." : "Revoke"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose}>
          Close
        </Button>
        {sessions.length > 1 && (
          <Button
            color="red"
            onClick={handleRevokeOthers}
            disabled={revoking === "others"}
          >
            {revoking === "others" ? "Revoking..." : "Sign Out Other Devices"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// TWO-FACTOR AUTHENTICATION DIALOG
// =============================================================================

function TwoFactorDialog({
  open,
  onClose,
  isEnabled,
  onStatusChange,
}: {
  open: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onStatusChange: () => void;
}) {
  const [password, setPassword] = useState("");
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"confirm" | "setup" | "backup" | "disable">(isEnabled ? "disable" : "confirm");

  const enableTwoFactor = useTwoFactorEnable();
  const disableTwoFactor = useTwoFactorDisable();
  const generateBackupCodes = useTwoFactorGenerateBackupCodes();

  const resetForm = () => {
    setPassword("");
    setTotpUri(null);
    setBackupCodes(null);
    setError(null);
    setStep(isEnabled ? "disable" : "confirm");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleEnable = async () => {
    setError(null);
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      const result = await enableTwoFactor.mutateAsync({
        password,
        issuer: "Hypedrive",
      });
      setTotpUri(result.totpURI);
      setBackupCodes(result.backupCodes);
      setStep("setup");
      onStatusChange();
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to enable 2FA"));
    }
  };

  const handleDisable = async () => {
    setError(null);
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      await disableTwoFactor.mutateAsync(password);
      onStatusChange();
      handleClose();
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to disable 2FA"));
    }
  };

  const handleGenerateBackupCodes = async () => {
    setError(null);
    if (!password) {
      setError("Password is required");
      return;
    }

    try {
      const result = await generateBackupCodes.mutateAsync(password);
      setBackupCodes(result.backupCodes);
      setStep("backup");
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to generate backup codes"));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Dialog open={open} onClose={handleClose} size="md">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
          isEnabled ? duotoneColors.emerald.bg : duotoneColors.amber.bg
        }`}>
          <ShieldCheckIcon className={`size-5 ${isEnabled ? duotoneColors.emerald.icon : duotoneColors.amber.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>
            {isEnabled ? "Manage Two-Factor Authentication" : "Enable Two-Factor Authentication"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {isEnabled
              ? "Manage your 2FA settings or disable it."
              : "Add an extra layer of security to your account."}
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Enter your password to enable two-factor authentication. You'll need an authenticator app like Google Authenticator or Authy.
            </p>
            <div>
              <label htmlFor="2fa-password" className="text-sm font-medium text-zinc-900 dark:text-white">
                Password
              </label>
              <Input
                id="2fa-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                placeholder="Enter your password"
              />
            </div>
          </div>
        )}

        {step === "setup" && totpUri && (
          <div className="space-y-4">
            <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-6 dark:bg-zinc-800/50">
              <p className="mb-4 text-sm font-medium text-zinc-900 dark:text-white">
                Scan this QR code with your authenticator app
              </p>
              <div className="rounded-xl bg-white p-4">
                {/* QR code placeholder - in production, use a QR library */}
                <div className="flex size-40 items-center justify-center border-2 border-dashed border-zinc-300">
                  <p className="text-center text-xs text-zinc-500">QR Code</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(totpUri)}
                className="mt-3 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <ClipboardDocumentIcon className="size-3" />
                Copy setup key
              </button>
            </div>
            {backupCodes && backupCodes.length > 0 && (
              <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
                <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
                  Save your backup codes
                </p>
                <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">
                  Store these codes safely. You can use them to access your account if you lose your authenticator.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="rounded bg-amber-100 px-2 py-1 text-xs font-mono text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      {code}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === "disable" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="size-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Are you sure?
                  </p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                    Disabling 2FA will make your account less secure. You'll only need your password to sign in.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="disable-2fa-password" className="text-sm font-medium text-zinc-900 dark:text-white">
                Password
              </label>
              <Input
                id="disable-2fa-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5"
                placeholder="Enter your password to confirm"
              />
            </div>
            <Button
              plain
              onClick={() => {
                setPassword("");
                setStep("backup");
              }}
              className="text-sm"
            >
              Generate new backup codes instead
            </Button>
          </div>
        )}

        {step === "backup" && (
          <div className="space-y-4">
            {!backupCodes ? (
              <>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Generate new backup codes. This will invalidate any existing backup codes.
                </p>
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
                  />
                </div>
              </>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <p className="mb-2 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  Your new backup codes
                </p>
                <p className="mb-3 text-xs text-emerald-700 dark:text-emerald-300">
                  Store these codes safely. Previous backup codes are now invalid.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <code key={i} className="rounded bg-emerald-100 px-2 py-1 text-xs font-mono text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                      {code}
                    </code>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(backupCodes.join("\n"))}
                  className="mt-3 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                  <ClipboardDocumentIcon className="size-3" />
                  Copy all codes
                </button>
              </div>
            )}
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button plain onClick={handleClose}>
          {step === "setup" || (step === "backup" && backupCodes) ? "Done" : "Cancel"}
        </Button>
        {step === "confirm" && (
          <Button
            color="dark/zinc"
            onClick={handleEnable}
            disabled={enableTwoFactor.isPending || !password}
          >
            {enableTwoFactor.isPending ? "Enabling..." : "Enable 2FA"}
          </Button>
        )}
        {step === "disable" && (
          <Button
            color="red"
            onClick={handleDisable}
            disabled={disableTwoFactor.isPending || !password}
          >
            {disableTwoFactor.isPending ? "Disabling..." : "Disable 2FA"}
          </Button>
        )}
        {step === "backup" && !backupCodes && (
          <Button
            color="dark/zinc"
            onClick={handleGenerateBackupCodes}
            disabled={generateBackupCodes.isPending || !password}
          >
            {generateBackupCodes.isPending ? "Generating..." : "Generate Codes"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// BANK ACCOUNTS DIALOG
// =============================================================================

function BankAccountsDialog({
  open,
  onClose,
  organizationId,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string | undefined;
}) {
  const { data: bankAccounts, loading, refetch } = useBankAccounts(organizationId);
  const addBankAccount = useAddBankAccount(organizationId);
  const deleteBankAccount = useDeleteBankAccount();
  const setDefaultBankAccount = useSetDefaultBankAccount();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const resetForm = () => {
    setShowAddForm(false);
    setNewAccount({
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
    });
    setError(null);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!organizationId) {
      setError("Organization not found");
      return;
    }

    try {
      await addBankAccount.mutateAsync({
        accountHolderName: newAccount.accountHolderName,
        accountNumber: newAccount.accountNumber,
        ifscCode: newAccount.ifscCode,
        bankName: newAccount.bankName,
      });
      resetForm();
      refetch();
    } catch (err) {
      setError(getAPIErrorMessage(err, "Failed to add bank account"));
    }
  };

  const handleDelete = async (bankAccountId: string) => {
    if (!organizationId) return;
    setDeleting(bankAccountId);
    try {
      await deleteBankAccount.mutateAsync({ organizationId, bankAccountId });
      refetch();
    } catch (err) {
      console.error("Failed to delete bank account:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (bankAccountId: string) => {
    if (!organizationId) return;
    try {
      await setDefaultBankAccount.mutateAsync({ organizationId, bankAccountId });
      refetch();
    } catch (err) {
      console.error("Failed to set default bank account:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.emerald.bg}`}>
          <BuildingLibraryIcon className={`size-5 ${duotoneColors.emerald.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>Bank Accounts</DialogTitle>
          <DialogDescription className="mt-1">
            Manage your bank accounts for receiving payments.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`rounded-xl p-4 ${
                  account.isDefault
                    ? "bg-emerald-50 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:ring-emerald-900"
                    : "bg-zinc-50 dark:bg-zinc-800/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${
                      account.isDefault ? duotoneColors.emerald.bg : duotoneColors.zinc.bg
                    }`}>
                      <BuildingLibraryIcon className={`size-5 ${
                        account.isDefault ? duotoneColors.emerald.icon : duotoneColors.zinc.icon
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {account.bankName || "Bank Account"}
                        {account.isDefault && (
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {account.accountHolderName} · ****{account.accountNumber?.slice(-4)}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500">
                        IFSC: {account.ifscCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!account.isDefault && (
                      <Button
                        plain
                        onClick={() => handleSetDefault(account.id)}
                        className="text-xs"
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      plain
                      onClick={() => handleDelete(account.id)}
                      disabled={deleting === account.id}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                      {deleting === account.id ? "..." : <TrashIcon className="size-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {bankAccounts.length === 0 && !showAddForm && (
              <div className="rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/50">
                <BuildingLibraryIcon className="mx-auto size-8 text-zinc-400" />
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No bank accounts added yet</p>
              </div>
            )}

            {showAddForm ? (
              <form onSubmit={handleAddAccount} className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Add Bank Account</p>
                  <button type="button" onClick={resetForm}>
                    <XMarkIcon className="size-5 text-zinc-400 hover:text-zinc-600" />
                  </button>
                </div>
                <div className="grid gap-3">
                  <Input
                    placeholder="Account Holder Name"
                    value={newAccount.accountHolderName}
                    onChange={(e) => setNewAccount({ ...newAccount, accountHolderName: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Account Number"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="IFSC Code"
                      value={newAccount.ifscCode}
                      onChange={(e) => setNewAccount({ ...newAccount, ifscCode: e.target.value.toUpperCase() })}
                      required
                    />
                    <Input
                      placeholder="Bank Name"
                      value={newAccount.bankName}
                      onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <Button plain onClick={resetForm}>Cancel</Button>
                  <Button color="dark/zinc" type="submit" disabled={addBankAccount.isPending}>
                    {addBankAccount.isPending ? "Adding..." : "Add Account"}
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 p-4 text-sm font-medium text-zinc-500 transition-colors hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
              >
                <PlusIcon className="size-4" />
                Add Bank Account
              </button>
            )}
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// BILLING HISTORY DIALOG
// =============================================================================

function BillingHistoryDialog({
  open,
  onClose,
  organizationId,
}: {
  open: boolean;
  onClose: () => void;
  organizationId: string | undefined;
}) {
  const { data: invoices, loading } = useInvoices(organizationId);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
      case "overdue":
        return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <div className="flex items-start gap-4">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.sky.bg}`}>
          <DocumentTextIcon className={`size-5 ${duotoneColors.sky.icon}`} />
        </div>
        <div className="min-w-0 flex-1">
          <DialogTitle>Billing History</DialogTitle>
          <DialogDescription className="mt-1">
            View your past invoices and payment history.
          </DialogDescription>
        </div>
      </div>

      <DialogBody>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-xl bg-zinc-50 p-6 text-center dark:bg-zinc-800/50">
            <DocumentTextIcon className="mx-auto size-8 text-zinc-400" />
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-xl ${duotoneColors.zinc.bg}`}>
                    <DocumentTextIcon className={`size-5 ${duotoneColors.zinc.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                      Invoice #{invoice.invoiceNumber || invoice.id.slice(-8)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(invoice.createdAt)} · {invoice.description || "Campaign services"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(invoice.status)}`}>
                    {invoice.status}
                  </span>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {formatAmount(invoice.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogBody>

      <DialogActions>
        <Button plain onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// =============================================================================
// SETTINGS PAGE
// =============================================================================

export function Settings() {
  const { organization, loading: isLoadingOrg } = useOrganizationProfile();
  const organizationId = useOrganizationId();
  const { data: stats, loading: isLoadingStats } = useOrganizationStats(organization?.id);
  const { data: fullOrg } = useFullOrganization(organization?.id);
  const { data: userInfo } = useUserInfo();
  const { data: sessions } = useDeviceSessions();
  const { data: bankAccounts } = useBankAccounts(organization?.id);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const [theme, setTheme] = useState<ThemeOption>("system");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showSessionsDialog, setShowSessionsDialog] = useState(false);
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [showBankAccountsDialog, setShowBankAccountsDialog] = useState(false);
  const [showBillingHistoryDialog, setShowBillingHistoryDialog] = useState(false);

  // Notification preferences from API
  const { data: notificationPrefs } = useNotificationPreferences();
  const updateNotificationPrefs = useUpdateNotificationPreferences();

  // Derive notification toggles from API data
  const emailNotifications = notificationPrefs?.global?.email ?? true;
  const pushNotifications = notificationPrefs?.global?.push ?? false;

  // Handle notification toggle changes
  const handleNotificationChange = (channel: "email" | "push" | "inApp", value: boolean) => {
    updateNotificationPrefs.mutate({
      channels: {
        ...notificationPrefs?.global,
        [channel]: value,
      },
    });
  };

  const handleLogout = () => {
    logout();
  };

  // Format currency for display (amount in paise)
  const formatSpent = (amountInPaise: number | undefined) => {
    if (!amountInPaise) return "₹0";
    const amount = amountInPaise / 100; // Convert paise to rupees
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return `₹${amount.toFixed(0)}`;
  };

  // Show skeleton while loading
  if (isLoadingOrg || isLoadingStats) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      {/* Header */}
      <div>
        <Heading>Settings</Heading>
        <Text className="mt-1">Manage your organization settings and preferences</Text>
      </div>

      {/* Profile Header Card - New gradient design */}
      <ProfileHeaderCard
        name={organization?.name || "Organization"}
        email={user?.email || "—"}
        stats={[
          { label: "Campaigns", value: stats?.activeCampaigns ?? 0 },
          { label: "Enrollments", value: stats?.totalEnrollments ?? 0 },
          { label: "Spent", value: formatSpent(stats?.totalSpent) },
        ]}
        onEditProfile={() => setShowProfileDialog(true)}
      />

      {/* Account Section */}
      <div>
        <MenuSectionHeader>Account</MenuSectionHeader>
        <MenuSection>
          <MenuRow
            icon={AtSymbolIcon}
            iconColor="orange"
            label="Email"
            value={user?.email || "—"}
            onClick={() => setShowEmailDialog(true)}
            isFirst
          />
          <MenuSeparator />
          <MenuRow
            icon={KeyIcon}
            iconColor="amber"
            label="Password"
            value="••••••••"
            onClick={() => setShowPasswordDialog(true)}
          />
          <MenuSeparator />
          <MenuRow
            icon={DevicePhoneMobileIcon}
            iconColor="emerald"
            label="Phone"
            value={fullOrg?.phone || "Not set"}
            isLast
          />
        </MenuSection>
      </div>

      {/* Organization Section */}
      <div>
        <MenuSectionHeader>Organization</MenuSectionHeader>
        <MenuSection>
          <MenuRow
            icon={BuildingOffice2Icon}
            iconColor="sky"
            label="Organization Name"
            value={organization?.name || "—"}
            onClick={() => setShowProfileDialog(true)}
            isFirst
          />
          <MenuSeparator />
          <MenuRow
            icon={MapPinIcon}
            iconColor="red"
            label="Address"
            value={fullOrg?.metadata?.address || "Not set"}
          />
          <MenuSeparator />
          <MenuRow
            icon={CurrencyDollarIcon}
            iconColor="emerald"
            label="Currency"
            value="INR"
          />
          <MenuSeparator />
          <MenuRow
            icon={GlobeAltIcon}
            iconColor="sky"
            label="Website"
            value={fullOrg?.metadata?.website || "Not set"}
            isLast
          />
        </MenuSection>
      </div>

      {/* Appearance Section */}
      <div>
        <MenuSectionHeader>Appearance</MenuSectionHeader>
        <MenuSection>
          <div className="px-4 py-4">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${duotoneColors.violet.bg}`}>
                <PaintBrushIcon className={`size-5 ${duotoneColors.violet.icon}`} />
              </div>
              <div>
                <span className="font-medium text-zinc-900 dark:text-white">Theme</span>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Choose your preferred appearance</p>
              </div>
            </div>
            <ThemeSelector value={theme} onChange={setTheme} />
          </div>
        </MenuSection>
        <MenuSectionFooter>
          System theme will follow your device settings automatically.
        </MenuSectionFooter>
      </div>

      {/* Notifications Section */}
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

      {/* Billing Section */}
      <div>
        <MenuSectionHeader>Billing</MenuSectionHeader>
        <MenuSection>
          <MenuRow
            icon={CreditCardIcon}
            iconColor="emerald"
            label="Payment Methods"
            onClick={() => {}}
            isFirst
          />
          <MenuSeparator />
          <MenuRow
            icon={CurrencyDollarIcon}
            iconColor="sky"
            label="Billing History"
            onClick={() => {}}
            isLast
          />
        </MenuSection>
      </div>

      {/* Security Section */}
      <div>
        <MenuSectionHeader>Security</MenuSectionHeader>
        <MenuSection>
          <MenuRow
            icon={ShieldCheckIcon}
            iconColor="emerald"
            label="Two-Factor Authentication"
            badge="Off"
            badgeColor="zinc"
            onClick={() => {}}
            isFirst
          />
          <MenuSeparator />
          <MenuRow
            icon={DevicePhoneMobileIcon}
            iconColor="sky"
            label="Active Sessions"
            badge="2"
            badgeColor="emerald"
            onClick={() => {}}
            isLast
          />
        </MenuSection>
      </div>

      {/* Sign Out Button */}
      <MenuDangerButton onClick={handleLogout}>
        <ArrowRightStartOnRectangleIcon className="size-4" />
        Sign Out
      </MenuDangerButton>

      {/* App Version - Mobile style footer */}
      <div className="pt-4 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Hypedrive Brand v1.0.0
        </p>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
      />
      <EditProfileDialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        organizationId={organization?.id}
        initialName={organization?.name || ""}
      />
    </div>
  );
}
