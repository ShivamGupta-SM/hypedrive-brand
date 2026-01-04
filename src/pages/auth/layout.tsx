import { Outlet } from "react-router";

export function AuthLayout() {
	return (
		<main className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white dark:bg-zinc-900">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<Outlet />
			</div>
		</main>
	);
}
