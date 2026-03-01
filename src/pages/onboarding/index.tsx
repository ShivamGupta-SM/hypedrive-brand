import { CheckCircleIcon as CheckCircleSolidIcon, XCircleIcon } from "@heroicons/react/16/solid";
import {
	ArrowRightStartOnRectangleIcon,
	BuildingStorefrontIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	IdentificationIcon,
	RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { Textarea } from "@/components/textarea";
import {
	getAPIErrorMessage,
	useCheckSlug,
	useConfetti,
	useCreateOrganization,
	useEnrichPreview,
	usePreviewLogoByDomain,
	useSetupProgressStream,
	useVerifyGSTPreview,
} from "@/hooks";
import { useLogout } from "@/store/auth-store";

// =============================================================================
// STEP INDICATOR
// =============================================================================

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
	return (
		<div className="flex items-center justify-center gap-2">
			{Array.from({ length: totalSteps }).map((_, i) => (
				<div
					key={i}
					className={`h-1.5 rounded-full transition-all ${
						i < currentStep
							? "w-8 bg-emerald-500"
							: i === currentStep
								? "w-8 bg-zinc-900 dark:bg-white"
								: "w-1.5 bg-zinc-300 dark:bg-zinc-700"
					}`}
				/>
			))}
		</div>
	);
}

// =============================================================================
// STEP 1: ORGANIZATION DETAILS
// =============================================================================

interface OrganizationFormData {
	name: string;
	slug: string;
	description: string;
	website: string;
	logo: string;
	gstNumber: string;
	gstLegalName: string;
	gstTradeName: string;
	address: string;
	city: string;
	state: string;
	postalCode: string;
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
}

function extractDomain(url: string): string | undefined {
	try {
		const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
		return parsed.hostname.replace(/^www\./, "") || undefined;
	} catch {
		return undefined;
	}
}

function OrganizationStep({
	data,
	onChange,
	onNext,
}: {
	data: OrganizationFormData;
	onChange: (data: OrganizationFormData) => void;
	onNext: () => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
	const websiteDomain = extractDomain(data.website);
	const { data: logoPreview } = usePreviewLogoByDomain(websiteDomain);
	const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
	const checkSlug = useCheckSlug();
	const enrichPreview = useEnrichPreview();
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

	const checkSlugAvailability = useCallback(
		(slug: string) => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
			if (!slug || slug.length < 3) {
				setSlugStatus("idle");
				return;
			}
			setSlugStatus("checking");
			debounceRef.current = setTimeout(async () => {
				try {
					const result = await checkSlug.mutateAsync(slug);
					setSlugStatus((result as { available?: boolean }).available !== false ? "available" : "taken");
				} catch {
					setSlugStatus("taken");
				}
			}, 500);
		},
		[checkSlug]
	);

	// Cleanup debounce timers
	useEffect(() => {
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, []);

	// Auto-enrich company info when website loses focus
	const handleWebsiteBlur = async () => {
		const domain = extractDomain(data.website);
		if (!domain || data.description) return;

		try {
			const result = await enrichPreview.mutateAsync({ domain, name: data.name || undefined });
			if (result.identity?.description) {
				onChange({ ...data, description: result.identity.description });
			}
		} catch {
			// Enrichment is best-effort, don't show errors
		}
	};

	// Sync logo preview into form data whenever it resolves
	useEffect(() => {
		const logoUrl = logoPreview?.logoUrl;
		if (logoUrl && data.logo !== logoUrl) {
			onChange({ ...data, logo: logoUrl });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logoPreview?.logoUrl]);

	const handleNameChange = (name: string) => {
		onChange({ ...data, name });
		if (!slugManuallyEdited) {
			const slug = slugify(name);
			onChange({ ...data, name, slug });
			checkSlugAvailability(slug);
		}
	};

	const handleSlugChange = (slug: string) => {
		const sanitized = slugify(slug);
		setSlugManuallyEdited(true);
		onChange({ ...data, slug: sanitized });
		checkSlugAvailability(sanitized);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!data.name.trim()) {
			setError("Organization name is required");
			return;
		}

		if (!data.slug.trim() || data.slug.length < 3) {
			setError("Slug must be at least 3 characters");
			return;
		}

		if (slugStatus === "taken") {
			setError("This slug is already taken. Please choose another.");
			return;
		}

		onNext();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
					<BuildingStorefrontIcon className="size-7 text-zinc-500 dark:text-zinc-400" />
				</div>
				<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Create Your Organization</h2>
				<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
					Tell us about your brand to get started with campaigns.
				</p>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<div className="space-y-4">
				<div>
					<label htmlFor="org-name" className="text-sm font-medium text-zinc-900 dark:text-white">
						Organization Name *
					</label>
					<Input
						id="org-name"
						value={data.name}
						onChange={(e) => handleNameChange(e.target.value)}
						placeholder="Enter your organization name"
						className="mt-1.5"
						required
					/>
				</div>

				<div>
					<label htmlFor="org-slug" className="text-sm font-medium text-zinc-900 dark:text-white">
						URL Slug *
					</label>
					<div className="relative mt-1.5">
						<Input
							id="org-slug"
							value={data.slug}
							onChange={(e) => handleSlugChange(e.target.value)}
							placeholder="your-brand-name"
							required
						/>
						{slugStatus !== "idle" && (
							<div className="absolute right-3 top-1/2 -translate-y-1/2">
								{slugStatus === "checking" && (
									<svg className="size-4 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24" aria-hidden="true">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
								)}
								{slugStatus === "available" && <CheckCircleSolidIcon className="size-4 text-emerald-500" />}
								{slugStatus === "taken" && <XCircleIcon className="size-4 text-red-500" />}
							</div>
						)}
					</div>
					<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
						app.hypedrive.com/<span className="font-medium">{data.slug || "your-slug"}</span>
						{slugStatus === "available" && (
							<span className="ml-2 text-emerald-600 dark:text-emerald-400">Available!</span>
						)}
						{slugStatus === "taken" && <span className="ml-2 text-red-600 dark:text-red-400">Already taken</span>}
					</p>
				</div>

				<div>
					<label htmlFor="org-description" className="text-sm font-medium text-zinc-900 dark:text-white">
						Description
					</label>
					<Textarea
						id="org-description"
						value={data.description}
						onChange={(e) => onChange({ ...data, description: e.target.value })}
						placeholder="Tell us about your organization..."
						className="mt-1.5"
						rows={3}
					/>
				</div>

				<div>
					<label htmlFor="org-website" className="text-sm font-medium text-zinc-900 dark:text-white">
						Website
					</label>
					<div className="mt-1.5 flex items-center gap-3">
						{logoPreview?.logoUrl && (
							<img
								src={logoPreview.logoUrl}
								alt="Logo preview"
								className="size-10 shrink-0 rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
							/>
						)}
						<Input
							id="org-website"
							type="url"
							value={data.website}
							onChange={(e) => onChange({ ...data, website: e.target.value })}
							onBlur={handleWebsiteBlur}
							placeholder="https://example.com"
							className="flex-1"
						/>
					</div>
					{logoPreview?.logoUrl && (
						<p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Logo detected from website</p>
					)}
				</div>
			</div>

			<Button type="submit" color="dark/zinc" className="w-full">
				Continue
			</Button>
		</form>
	);
}

// =============================================================================
// STEP 2: GST VERIFICATION
// =============================================================================

function GSTStep({
	data,
	onChange,
	onNext,
	onBack,
}: {
	data: OrganizationFormData;
	onChange: (data: OrganizationFormData) => void;
	onNext: () => void;
	onBack: () => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [verified, setVerified] = useState(false);
	const verifyGST = useVerifyGSTPreview();

	const handleVerify = async () => {
		setError(null);
		const gst = data.gstNumber.trim();

		if (!gst) {
			setError("GST number is required");
			return;
		}

		if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d{1}[A-Z]{1}[A-Z\d]{1}$/.test(gst)) {
			setError("Please enter a valid 15-character GSTIN");
			return;
		}

		try {
			const result = await verifyGST.mutateAsync({ gstNumber: gst });
			const legalName = (result as { legalName?: string }).legalName || "";
			const tradeName = (result as { tradeName?: string }).tradeName || "";
			onChange({
				...data,
				gstLegalName: legalName,
				gstTradeName: tradeName,
				address: (result as { address?: string }).address || data.address,
				city: (result as { city?: string }).city || data.city,
				state: (result as { state?: string }).state || data.state,
				postalCode: (result as { pinCode?: string }).pinCode || data.postalCode,
			});
			setVerified(true);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Could not verify GST number"));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!verified) {
			setError("Please verify your GST number first");
			return;
		}
		onNext();
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
					<IdentificationIcon className="size-7 text-amber-600 dark:text-amber-400" />
				</div>
				<h2 className="text-xl font-bold text-zinc-900 dark:text-white">GST Verification</h2>
				<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
					We need your GST details for compliance and invoicing.
				</p>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<div className="space-y-4">
				<div>
					<label htmlFor="gst-number" className="text-sm font-medium text-zinc-900 dark:text-white">
						GST Number (GSTIN) *
					</label>
					<div className="mt-1.5 flex gap-2">
						<Input
							id="gst-number"
							value={data.gstNumber}
							onChange={(e) => {
								onChange({ ...data, gstNumber: e.target.value.toUpperCase() });
								setVerified(false);
							}}
							placeholder="22AAAAA0000A1Z5"
							className="flex-1"
							maxLength={15}
							required
						/>
						<Button
							type="button"
							color={verified ? "emerald" : "dark/zinc"}
							onClick={handleVerify}
							disabled={verifyGST.isPending || verified}
						>
							{verifyGST.isPending ? "Verifying..." : verified ? "Verified" : "Verify"}
						</Button>
					</div>
				</div>

				{verified && data.gstLegalName && (
					<div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
						<div className="space-y-2">
							<div>
								<p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Legal Name</p>
								<p className="text-sm font-medium text-zinc-900 dark:text-white">{data.gstLegalName}</p>
							</div>
							{data.gstTradeName && (
								<div>
									<p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Trade Name</p>
									<p className="text-sm text-zinc-700 dark:text-zinc-300">{data.gstTradeName}</p>
								</div>
							)}
							{data.address && (
								<div>
									<p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Address</p>
									<p className="text-sm text-zinc-700 dark:text-zinc-300">
										{[data.address, data.city, data.state, data.postalCode].filter(Boolean).join(", ")}
									</p>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="flex gap-3">
				<Button type="button" outline onClick={onBack} className="flex-1">
					Back
				</Button>
				<Button type="submit" color="dark/zinc" className="flex-1" disabled={!verified}>
					Continue
				</Button>
			</div>
		</form>
	);
}

// =============================================================================
// STEP 3: REVIEW & SUBMIT
// =============================================================================

function ReviewStep({
	data,
	onBack,
	onSubmit,
	isSubmitting,
	error,
}: {
	data: OrganizationFormData;
	onBack: () => void;
	onSubmit: () => void;
	isSubmitting: boolean;
	error: string | null;
}) {
	return (
		<div className="space-y-6">
			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
					<DocumentTextIcon className="size-7 text-sky-600 dark:text-sky-400" />
				</div>
				<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Review Your Details</h2>
				<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
					Make sure everything looks correct before submitting.
				</p>
			</div>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
				<dl className="space-y-3">
					<div>
						<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Organization Name</dt>
						<dd className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">{data.name}</dd>
					</div>
					{data.slug && (
						<div>
							<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">URL Slug</dt>
							<dd className="mt-0.5 font-mono text-sm text-zinc-700 dark:text-zinc-300">{data.slug}</dd>
						</div>
					)}
					{data.description && (
						<div>
							<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Description</dt>
							<dd className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{data.description}</dd>
						</div>
					)}
					{data.website && (
						<div>
							<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Website</dt>
							<dd className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{data.website}</dd>
						</div>
					)}
					<div>
						<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">GSTIN</dt>
						<dd className="mt-0.5 font-mono text-sm font-medium text-zinc-900 dark:text-white">{data.gstNumber}</dd>
					</div>
					<div>
						<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">GST Legal Name</dt>
						<dd className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{data.gstLegalName}</dd>
					</div>
					{data.gstTradeName && (
						<div>
							<dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">GST Trade Name</dt>
							<dd className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{data.gstTradeName}</dd>
						</div>
					)}
				</dl>
			</div>

			<div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
				<p className="text-sm text-amber-700 dark:text-amber-300">
					<strong>Note:</strong> After submission, your organization will be reviewed by our team. This usually takes
					1-2 business days.
				</p>
			</div>

			<div className="flex gap-3">
				<Button outline onClick={onBack} disabled={isSubmitting} className="flex-1">
					Back
				</Button>
				<Button color="dark/zinc" onClick={onSubmit} disabled={isSubmitting} className="flex-1">
					{isSubmitting ? "Submitting..." : "Submit Application"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// STEP 3: SUCCESS — LIVE SETUP PROGRESS
// =============================================================================

const STEP_LABELS: Record<string, { label: string; description: string }> = {
	gst: { label: "GST Verification", description: "Verifying your GSTIN with SurePass" },
	wallet: { label: "Wallet Setup", description: "Creating your ledger wallet" },
	deposit: { label: "Deposit Account", description: "Setting up Razorpay virtual account" },
	zoho: { label: "Invoicing Sync", description: "Syncing with Zoho Books" },
	enrichment: { label: "Brand Enrichment", description: "Auto-filling brand details from website" },
};

function SuccessStep({ orgName, organizationId }: { orgName: string; organizationId: string }) {
	const navigate = useNavigate();
	const { fire } = useConfetti();
	const stream = useSetupProgressStream(organizationId);
	const hasConnected = useRef(false);
	const hasFiredConfetti = useRef(false);

	// Connect to stream on mount
	useEffect(() => {
		if (!hasConnected.current && organizationId) {
			hasConnected.current = true;
			stream.connect();
		}
	}, [organizationId, stream.connect]);

	// Fire confetti when setup completes
	useEffect(() => {
		if (stream.isComplete && !hasFiredConfetti.current) {
			hasFiredConfetti.current = true;
			fire("fireworks");
		}
	}, [stream.isComplete, fire]);

	// Derive step statuses from stream updates
	const stepStatuses = useStepStatuses(stream.updates);

	const allSteps = ["gst", "wallet", "deposit", "zoho", "enrichment"];

	return (
		<div className="space-y-6">
			<div className="text-center">
				<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
					<RocketLaunchIcon className="size-7 text-emerald-600 dark:text-emerald-400" />
				</div>
				<h2 className="text-xl font-bold text-zinc-900 dark:text-white">
					{stream.isComplete ? "You're All Set!" : "Setting Up Your Organization"}
				</h2>
				<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
					{stream.isComplete ? (
						<>
							<strong className="text-zinc-700 dark:text-zinc-300">{orgName}</strong> is ready for review.
						</>
					) : (
						<>
							Configuring <strong className="text-zinc-700 dark:text-zinc-300">{orgName}</strong>— this usually takes a
							few seconds.
						</>
					)}
				</p>
			</div>

			{/* Live setup steps */}
			<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
				<div className="space-y-1">
					{allSteps.map((stepKey) => {
						const meta = STEP_LABELS[stepKey] || { label: stepKey, description: "" };
						const status = stepStatuses[stepKey] || "pending";

						return (
							<div
								key={stepKey}
								className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
									status === "completed"
										? "bg-emerald-50/70 dark:bg-emerald-950/20"
										: status === "failed"
											? "bg-red-50/70 dark:bg-red-950/20"
											: status === "active"
												? "bg-white dark:bg-zinc-800"
												: ""
								}`}
							>
								{/* Icon */}
								<div className="shrink-0">
									{status === "completed" ? (
										<CheckCircleSolidIcon className="size-5 text-emerald-500 dark:text-emerald-400" />
									) : status === "failed" ? (
										<ExclamationTriangleIcon className="size-5 text-red-500 dark:text-red-400" />
									) : status === "active" ? (
										<svg
											className="size-5 animate-spin text-zinc-900 dark:text-white"
											fill="none"
											viewBox="0 0 24 24"
											aria-hidden="true"
										>
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
									) : (
										<div className="size-5 rounded-full border-2 border-zinc-200 dark:border-zinc-700" />
									)}
								</div>

								{/* Text */}
								<div className="min-w-0 flex-1">
									<p
										className={`text-sm font-medium ${
											status === "completed"
												? "text-emerald-700 dark:text-emerald-400"
												: status === "failed"
													? "text-red-700 dark:text-red-400"
													: status === "active"
														? "text-zinc-900 dark:text-white"
														: "text-zinc-400 dark:text-zinc-600"
										}`}
									>
										{meta.label}
									</p>
									{status === "active" && (
										<p className="text-xs text-zinc-500 dark:text-zinc-400">{meta.description}</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Stream error */}
			{stream.error && (
				<div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
					<p className="text-sm text-amber-700 dark:text-amber-300">
						Live updates disconnected. Your setup is still processing in the background.
					</p>
				</div>
			)}

			{/* What happens next */}
			{stream.isComplete ? (
				<div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
					<p className="text-sm text-emerald-700 dark:text-emerald-300">
						Setup complete! Your organization will be reviewed by our team. This usually takes 1-2 business days.
					</p>
				</div>
			) : (
				<div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/30">
					<p className="text-sm text-amber-700 dark:text-amber-300">
						<strong>Note:</strong> After setup, your organization will be reviewed by our team. This usually takes 1-2
						business days.
					</p>
				</div>
			)}

			<Button color="dark/zinc" onClick={() => navigate({ to: "/pending-approval" })} className="w-full">
				<RocketLaunchIcon className="size-4" />
				{stream.isComplete ? "Continue" : "Continue to Dashboard"}
			</Button>
		</div>
	);
}

/** Derive step statuses from stream updates */
function useStepStatuses(updates: { completedStep?: string; failedStep?: string; isComplete?: boolean }[]) {
	return updates.reduce<Record<string, "completed" | "failed" | "active" | "pending">>((acc, update) => {
		if (update.completedStep) {
			acc[update.completedStep] = "completed";
		}
		if (update.failedStep) {
			acc[update.failedStep] = "failed";
		}
		return acc;
	}, {});
}

// =============================================================================
// MAIN ONBOARDING PAGE
// =============================================================================

export function Onboarding() {
	const { mutate: logout } = useLogout();
	const [step, setStep] = useState(0);
	const [formData, setFormData] = useState<OrganizationFormData>({
		name: "",
		slug: "",
		description: "",
		website: "",
		logo: "",
		gstNumber: "",
		gstLegalName: "",
		gstTradeName: "",
		address: "",
		city: "",
		state: "",
		postalCode: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [submittedOrgName, setSubmittedOrgName] = useState("");
	const [submittedOrgId, setSubmittedOrgId] = useState("");

	const createOrganization = useCreateOrganization();

	const handleSubmit = async () => {
		setError(null);

		try {
			const result = await createOrganization.mutateAsync({
				name: formData.name.trim(),
				slug: formData.slug.trim() || undefined,
				logo: formData.logo || undefined,
				description: formData.description.trim() || undefined,
				website: formData.website.trim() || undefined,
				gstNumber: formData.gstNumber.trim(),
				gstLegalName: formData.gstLegalName.trim(),
				gstTradeName: formData.gstTradeName.trim() || undefined,
				address: formData.address.trim() || undefined,
				city: formData.city.trim() || undefined,
				state: formData.state.trim() || undefined,
				postalCode: formData.postalCode.trim() || undefined,
			});
			setSubmittedOrgName(formData.name);
			setSubmittedOrgId(result.id);
			setStep(3);
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to create organization"));
		}
	};

	return (
		<div className="flex min-h-dvh flex-col bg-white dark:bg-zinc-950">
			<div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
				<div className="w-full max-w-md">
					{/* Logo */}
					<Logo className="mx-auto mb-8 h-8 w-auto text-zinc-950 dark:text-white" />

					{/* Step Indicator */}
					{step < 3 && (
						<div className="mb-8">
							<StepIndicator currentStep={step} totalSteps={3} />
						</div>
					)}

					{/* Steps */}
					{step === 0 && <OrganizationStep data={formData} onChange={setFormData} onNext={() => setStep(1)} />}

					{step === 1 && (
						<GSTStep data={formData} onChange={setFormData} onNext={() => setStep(2)} onBack={() => setStep(0)} />
					)}

					{step === 2 && (
						<ReviewStep
							data={formData}
							onBack={() => setStep(1)}
							onSubmit={handleSubmit}
							isSubmitting={createOrganization.isPending}
							error={error}
						/>
					)}

					{step === 3 && <SuccessStep orgName={submittedOrgName} organizationId={submittedOrgId} />}

					{/* Logout */}
					{step < 3 && (
						<div className="mt-8 flex justify-center">
							<button
								type="button"
								onClick={() => logout()}
								className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
							>
								<ArrowRightStartOnRectangleIcon className="size-4" />
								Sign out
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
