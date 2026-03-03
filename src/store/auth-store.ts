/**
 * Auth Store — Minimal UI-only state for auth.
 *
 * The cookie (`hd_auth`) is the single source of truth for authentication.
 * This store only holds reactive UI state (user info, loading states).
 * Auth mutation hooks live in src/hooks/use-auth.ts (useLogin, useLogout, etc.).
 */

import { create } from "zustand";

// Types
interface User {
	id: string;
	name: string;
	email: string;
	image?: string | null;
}

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	avatar?: string;
	organizationStatus?: string;
}

// Store interface — UI-only, no token storage
export interface AuthState {
	user: User | null;
	// Keep isAuthenticated for backward compat — derived from cookie on client
	isAuthenticated: boolean;
	setUser: (user: User | null) => void;
	setAuthenticated: (isAuthenticated: boolean) => void;
	clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
	user: null,
	isAuthenticated: false,

	setUser: (user) => set({ user }),
	setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

	clearAuth: () => {
		set({ user: null, isAuthenticated: false });
	},
}));
