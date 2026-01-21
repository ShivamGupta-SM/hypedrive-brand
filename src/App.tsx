import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "sonner";
import "./App.css";
import { handleAuthError } from "@/store/auth-store";
import { isAPIError } from "@/hooks/use-api";

// Apply saved theme on startup (before React hydration to prevent flash)
function initializeTheme() {
	const savedTheme = localStorage.getItem("theme") || "system";
	const root = document.documentElement;

	if (savedTheme === "system") {
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		root.setAttribute("data-theme", prefersDark ? "dark" : "light");
	} else {
		root.setAttribute("data-theme", savedTheme);
	}
}

// Run immediately
initializeTheme();

import {
	PublicRoute,
	OnboardingRoute,
	ApprovedRoute,
	PendingApprovalRoute,
	RejectedRoute,
} from "./components/protected-route";
import { AppInitializer } from "./components/app-initializer";
import { AppLayout } from "./components/app-layout";
import { Dashboard } from "./pages/dashboard";
import { CampaignsList, CampaignShow } from "./pages/campaigns";
import { EnrollmentsList, EnrollmentShow } from "./pages/enrollments";
import { Wallet } from "./pages/wallet";
import { Settings } from "./pages/settings";
import { ForgotPassword, Login, Register, ResetPassword } from "./pages/auth";
import { AuthLayout } from "./pages/auth/layout";
import { PendingApproval, Rejected } from "./pages/approval";

// Create a React Query client with sensible defaults
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30 * 1000, // 30 seconds
			gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time, formerly cacheTime)
			retry: (failureCount, error: unknown) => {
				// Don't retry on 401 errors - handle auth failure instead
				if (isAPIError(error) && error.status === 401) {
					handleAuthError();
					return false;
				}
				return failureCount < 1;
			},
			refetchOnWindowFocus: false,
		},
	},
});

// Export queryClient for use in logout
export { queryClient };

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>
				<AppInitializer>
					<Routes>
						{/* Protected Routes - requires auth + approved organization */}
						<Route element={<ApprovedRoute />}>
							<Route element={<AppLayout />}>
								<Route index element={<Dashboard />} />
								<Route path="campaigns" element={<CampaignsList />} />
								<Route path="campaigns/:id" element={<CampaignShow />} />
								<Route path="enrollments" element={<EnrollmentsList />} />
								<Route path="campaigns/:campaignId/enrollments/:id" element={<EnrollmentShow />} />
								<Route path="wallet" element={<Wallet />} />
								<Route path="settings" element={<Settings />} />
							</Route>
						</Route>

						{/* Pending Approval Route - waiting for admin approval */}
						<Route element={<PendingApprovalRoute />}>
							<Route path="pending-approval" element={<PendingApproval />} />
						</Route>

						{/* Rejected Route - application was rejected or banned */}
						<Route element={<RejectedRoute />}>
							<Route path="rejected" element={<Rejected />} />
						</Route>

						{/* Onboarding Route - requires auth but NO organization profile */}
						<Route element={<OnboardingRoute />}>
							<Route path="onboarding" element={<div>Onboarding Page</div>} />
						</Route>

						{/* Public Routes (auth pages) */}
						<Route element={<PublicRoute />}>
							<Route element={<AuthLayout />}>
								<Route path="login" element={<Login />} />
								<Route path="register" element={<Register />} />
								<Route path="forgot-password" element={<ForgotPassword />} />
								<Route path="reset-password" element={<ResetPassword />} />
							</Route>
						</Route>
					</Routes>
					<Toaster
						position="top-center"
						closeButton
						duration={4000}
						gap={8}
					/>
				</AppInitializer>
			</BrowserRouter>
		</QueryClientProvider>
	);
}

export default App;
