import { Authenticated, ErrorComponent, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import routerProvider, {
	CatchAllNavigate,
	DocumentTitleHandler,
	NavigateToResource,
	UnsavedChangesNotifier,
} from "@refinedev/react-router";
import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { authProvider } from "./authProvider";
import { AppLayout } from "./components/app-layout";
import { Dashboard } from "./pages/dashboard";
import { EventsList, EventShow } from "./pages/events";
import { OrdersList, OrderShow } from "./pages/orders";
import { CampaignsList } from "./pages/campaigns";
import { EnrollmentsList } from "./pages/enrollments";
import { Settings } from "./pages/settings";
import { ForgotPassword, Login, Register } from "./pages/auth";
import { AuthLayout } from "./pages/auth/layout";

function App() {
	return (
		<BrowserRouter>
			<RefineKbarProvider>
				<DevtoolsProvider>
					<Refine
						dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
						routerProvider={routerProvider}
						authProvider={authProvider}
						resources={[
							{
								name: "dashboard",
								list: "/",
							},
							{
								name: "events",
								list: "/events",
								show: "/events/:id",
							},
							{
								name: "orders",
								list: "/orders",
								show: "/orders/:id",
							},
							{
								name: "campaigns",
								list: "/campaigns",
							},
							{
								name: "enrollments",
								list: "/enrollments",
							},
							{
								name: "settings",
								list: "/settings",
							},
						]}
						options={{
							syncWithLocation: true,
							warnWhenUnsavedChanges: true,
							projectId: "0BFOvy-Ztt0eK-TW91qS",
						}}
					>
						<Routes>
							<Route
								path="/"
								element={
									<Authenticated key="authenticated-inner" fallback={<CatchAllNavigate to="/login" />}>
										<AppLayout />
									</Authenticated>
								}
							>
								<Route index element={<Dashboard />} />
								<Route path="events">
									<Route index element={<EventsList />} />
									<Route path=":id" element={<EventShow />} />
								</Route>
								<Route path="orders">
									<Route index element={<OrdersList />} />
									<Route path=":id" element={<OrderShow />} />
								</Route>
								<Route path="campaigns" element={<CampaignsList />} />
								<Route path="enrollments" element={<EnrollmentsList />} />
								<Route path="settings" element={<Settings />} />
								<Route path="*" element={<ErrorComponent />} />
							</Route>
							<Route
								element={
									<Authenticated key="authenticated-outer" fallback={<Outlet />}>
										<NavigateToResource />
									</Authenticated>
								}
							>
								<Route element={<AuthLayout />}>
									<Route path="login" element={<Login />} />
									<Route path="register" element={<Register />} />
									<Route path="forgot-password" element={<ForgotPassword />} />
								</Route>
							</Route>
						</Routes>

						<RefineKbar />
						<UnsavedChangesNotifier />
						<DocumentTitleHandler />
					</Refine>
					<DevtoolsPanel />
				</DevtoolsProvider>
			</RefineKbarProvider>
		</BrowserRouter>
	);
}

export default App;
