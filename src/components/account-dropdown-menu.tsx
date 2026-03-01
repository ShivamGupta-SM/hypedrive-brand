import {
	ArrowRightStartOnRectangleIcon,
	LightBulbIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from "@heroicons/react/16/solid";
import { useNavigate } from "@tanstack/react-router";
import { DropdownDivider, DropdownItem, DropdownLabel, DropdownMenu } from "@/components/dropdown";
import { useLogout } from "@/store/auth-store";

export function AccountDropdownMenu({
	anchor,
	onOpenAccountSettings,
}: {
	anchor: "top start" | "bottom end";
	onOpenAccountSettings: () => void;
}) {
	const { mutate: logout } = useLogout();
	const navigate = useNavigate();

	const handleLogout = async () => {
		const result = await logout();
		if (result.success && result.redirectTo) {
			navigate({ to: result.redirectTo as "/" | "/login" });
		}
	};

	return (
		<DropdownMenu className="min-w-64" anchor={anchor}>
			<DropdownItem onClick={onOpenAccountSettings}>
				<UserCircleIcon />
				<DropdownLabel>My account</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem href="#">
				<ShieldCheckIcon />
				<DropdownLabel>Privacy policy</DropdownLabel>
			</DropdownItem>
			<DropdownItem href="#">
				<LightBulbIcon />
				<DropdownLabel>Share feedback</DropdownLabel>
			</DropdownItem>
			<DropdownDivider />
			<DropdownItem onClick={handleLogout}>
				<ArrowRightStartOnRectangleIcon />
				<DropdownLabel>Sign out</DropdownLabel>
			</DropdownItem>
		</DropdownMenu>
	);
}
