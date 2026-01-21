import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth-store";
import { useOrganizationProfile } from "@/hooks/use-api";
import { useApprovalStatus } from "@/store/organization-store";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

// Statuses that allow full dashboard access
const APPROVED_STATUSES = ["approved"];

// Statuses that show pending screen
const PENDING_STATUSES = ["pending", "draft"];

// Statuses that show rejection/banned screen
const REJECTED_STATUSES = ["rejected", "banned"];

/**
 * ProtectedRoute - Requires authentication AND organization profile
 *
 * Note: Uses TanStack Query for organization data (single source of truth).
 * Shows loading state while checking organization profile.
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. Loading organization data → show nothing (brief flash)
 * 3. No organization profile → redirect to /onboarding
 * 4. Has organization → render children
 */
export function ProtectedRoute({ children, redirectTo = "/login" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { organization, loading: orgLoading } = useOrganizationProfile();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Wait for organization data to load before making routing decisions
  if (orgLoading) {
    return null; // Brief loading state - AppInitializer handles initial load spinner
  }

  if (!organization && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * OnboardingRoute - Requires authentication but NO organization profile
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. Loading organization data → show nothing
 * 3. Already has organization profile → redirect to dashboard
 * 4. No organization → show onboarding form
 */
export function OnboardingRoute({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { organization, loading: orgLoading } = useOrganizationProfile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for organization data to load before making routing decisions
  if (orgLoading) {
    return null;
  }

  if (organization) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * PublicRoute - Redirects authenticated users away (for login/register pages)
 *
 * Flow:
 * 1. Authenticated with organization → redirect based on approval status
 * 2. Authenticated without organization → redirect to onboarding
 * 3. Not authenticated → show public page
 */
export function PublicRoute({ children, redirectTo = "/" }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { organization, loading: orgLoading } = useOrganizationProfile();
  const approvalStatus = useApprovalStatus();

  if (isAuthenticated) {
    if (orgLoading) {
      return null;
    }

    if (!organization) {
      return <Navigate to="/onboarding" replace />;
    }

    // Route based on approval status
    const destination = getApprovalBasedRedirect(approvalStatus, redirectTo);
    return <Navigate to={destination} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * ApprovedRoute - Only allows approved organizations
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. No organization → redirect to /onboarding
 * 3. Pending/draft → redirect to /pending-approval
 * 4. Rejected/banned → redirect to /rejected
 * 5. Approved → render children
 */
export function ApprovedRoute({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { organization, loading: orgLoading } = useOrganizationProfile();
  const approvalStatus = useApprovalStatus();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (orgLoading) {
    return null;
  }

  if (!organization) {
    return <Navigate to="/onboarding" replace />;
  }

  // Handle non-approved statuses
  if (PENDING_STATUSES.includes(approvalStatus ?? "")) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (REJECTED_STATUSES.includes(approvalStatus ?? "")) {
    return <Navigate to="/rejected" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * PendingApprovalRoute - For the waiting screen
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. No organization → redirect to /onboarding
 * 3. Approved → redirect to dashboard
 * 4. Rejected/banned → redirect to /rejected
 * 5. Pending/draft → show waiting screen
 */
export function PendingApprovalRoute({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { organization, loading: orgLoading } = useOrganizationProfile();
  const approvalStatus = useApprovalStatus();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (orgLoading) {
    return null;
  }

  if (!organization) {
    return <Navigate to="/onboarding" replace />;
  }

  // If approved, go to dashboard
  if (APPROVED_STATUSES.includes(approvalStatus ?? "")) {
    return <Navigate to="/" replace />;
  }

  // If rejected/banned, go to rejection page
  if (REJECTED_STATUSES.includes(approvalStatus ?? "")) {
    return <Navigate to="/rejected" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/**
 * RejectedRoute - For showing rejection/banned reason
 *
 * Flow:
 * 1. Not authenticated → redirect to /login
 * 2. No organization → redirect to /onboarding
 * 3. Approved → redirect to dashboard
 * 4. Pending/draft → redirect to /pending-approval
 * 5. Rejected/banned → show rejection screen
 */
export function RejectedRoute({ children }: { children?: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { organization, loading: orgLoading } = useOrganizationProfile();
  const approvalStatus = useApprovalStatus();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (orgLoading) {
    return null;
  }

  if (!organization) {
    return <Navigate to="/onboarding" replace />;
  }

  // If approved, go to dashboard
  if (APPROVED_STATUSES.includes(approvalStatus ?? "")) {
    return <Navigate to="/" replace />;
  }

  // If pending/draft, go to pending page
  if (PENDING_STATUSES.includes(approvalStatus ?? "")) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

// Helper to determine redirect based on approval status
function getApprovalBasedRedirect(
  status: string | undefined,
  defaultRedirect: string
): string {
  if (PENDING_STATUSES.includes(status ?? "")) {
    return "/pending-approval";
  }
  if (REJECTED_STATUSES.includes(status ?? "")) {
    return "/rejected";
  }
  return defaultRedirect;
}
