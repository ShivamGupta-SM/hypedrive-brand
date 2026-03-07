import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./error-state";

interface ErrorBoundaryProps {
	children: ReactNode;
	/** Shown as the error title. Defaults to "Something went wrong". */
	title?: string;
	/** Optional compact mode — less padding for inline sections. */
	compact?: boolean;
	/** Optional fallback to render instead of the default ErrorState. */
	fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
}

interface ErrorBoundaryState {
	error: Error | null;
}

/**
 * Granular error boundary for feature sections.
 *
 * Catches render errors in a subtree without blanking the entire page.
 * Uses the existing ErrorState component for consistent UI.
 *
 * @example
 * <ErrorBoundary title="Failed to load wallet">
 *   <WalletBalance />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state: ErrorBoundaryState = { error: null };

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("[ErrorBoundary]", error, info.componentStack);
	}

	reset = () => {
		this.setState({ error: null });
	};

	render() {
		const { error } = this.state;
		if (!error) return this.props.children;

		const { title, compact, fallback } = this.props;

		if (fallback) {
			return typeof fallback === "function" ? fallback(error, this.reset) : fallback;
		}

		return (
			<ErrorState
				title={title}
				message={error.message}
				onRetry={this.reset}
				className={compact ? "py-8" : undefined}
			/>
		);
	}
}
