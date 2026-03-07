import {
	ArrowRightStartOnRectangleIcon,
	Cog6ToothIcon,
	MagnifyingGlassIcon,
	UserCircleIcon,
} from "@heroicons/react/20/solid";
import * as Headless from "@headlessui/react";
import { useNavigate } from "@tanstack/react-router";
import { Avatar } from "@/components/avatar";
import { useLogout } from "@/features/auth/hooks";

interface ProfileMenuProps {
	user: {
		id: string;
		name: string;
		email: string;
		image?: string | null;
	} | null;
	anchor?: "top start" | "bottom end";
	onOpenAccountSettings: () => void;
	onOpenOrgSettings: () => void;
	onOpenSearch?: () => void;
}

export function ProfileMenu({
	user,
	anchor = "bottom end",
	onOpenAccountSettings,
	onOpenOrgSettings,
	onOpenSearch,
}: ProfileMenuProps) {
	const logout = useLogout();
	const navigate = useNavigate();

	const handleLogout = async () => {
		const result = await logout.mutateAsync();
		if (result.success && result.redirectTo) {
			navigate({ to: result.redirectTo as "/" | "/login" });
		}
	};

	return (
		<Headless.MenuItems
			transition
			anchor={anchor}
			className="z-50 w-64 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-zinc-200 outline-none transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 data-closed:data-leave:scale-95 dark:bg-zinc-900 dark:ring-zinc-800 [--anchor-gap:--spacing(2)] [--anchor-padding:--spacing(1)] data-[anchor~=end]:[--anchor-offset:6px] data-[anchor~=start]:[--anchor-offset:-6px]"
		>
			{/* ── Profile header ── */}
			<div className="flex items-center gap-3 px-3.5 py-3.5">
				{user?.image ? (
					<Avatar src={user.image} className="size-10" />
				) : (
					<Avatar
						initials={user?.name?.charAt(0).toUpperCase() || "U"}
						className="size-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
					/>
				)}
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
						{user?.name || "User"}
					</p>
					<p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
						{user?.email || ""}
					</p>
				</div>
				{onOpenSearch && (
					<Headless.MenuItem>
						<button
							type="button"
							onClick={onOpenSearch}
							className="flex size-8 items-center justify-center rounded-lg text-zinc-400 outline-none transition hover:bg-zinc-100 hover:text-zinc-600 active:scale-95 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
						>
							<MagnifyingGlassIcon className="size-4" />
						</button>
					</Headless.MenuItem>
				)}
			</div>

			<div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-800" />

			{/* ── Actions ── */}
			<div className="p-1.5">
				<MenuItem icon={UserCircleIcon} onClick={onOpenAccountSettings}>
					My account
				</MenuItem>
				<MenuItem icon={Cog6ToothIcon} onClick={onOpenOrgSettings}>
					Settings
				</MenuItem>
			</div>

			<div className="mx-3 h-px bg-zinc-100 dark:bg-zinc-800" />

			{/* ── Sign out ── */}
			<div className="p-1.5">
				<MenuItem
					icon={ArrowRightStartOnRectangleIcon}
					onClick={handleLogout}
					destructive
				>
					Sign out
				</MenuItem>
			</div>
		</Headless.MenuItems>
	);
}

function MenuItem({
	icon: Icon,
	onClick,
	destructive,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	onClick: () => void;
	destructive?: boolean;
	children: React.ReactNode;
}) {
	return (
		<Headless.MenuItem>
			<button
				type="button"
				onClick={onClick}
				className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium outline-none transition ${
					destructive
						? "text-red-600 data-focus:bg-red-50 dark:text-red-400 dark:data-focus:bg-red-500/10"
						: "text-zinc-700 data-focus:bg-zinc-50 dark:text-zinc-300 dark:data-focus:bg-white/5"
				}`}
			>
				<Icon
					className={`size-5 ${destructive ? "text-red-400 dark:text-red-500" : "text-zinc-400 dark:text-zinc-500"}`}
				/>
				{children}
			</button>
		</Headless.MenuItem>
	);
}
