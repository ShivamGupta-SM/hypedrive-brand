import {
	BanknotesIcon,
	BuildingOfficeIcon,
	BuildingStorefrontIcon,
	CalendarDaysIcon,
	CameraIcon,
	CheckCircleIcon,
	CreditCardIcon,
	ExclamationTriangleIcon,
	GlobeAltIcon,
	HashtagIcon,
	IdentificationIcon,
	MapPinIcon,
	PhoneIcon,
	ReceiptPercentIcon,
	ShieldCheckIcon,
	TrashIcon,
	UserCircleIcon,
} from "@heroicons/react/16/solid";
import { startAuthentication } from "@simplewebauthn/browser";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge, BadgeButton } from "@/components/badge";
import { Button } from "@/components/button";
import { Combobox, ComboboxLabel, ComboboxOption } from "@/components/combobox";
import { CountryFlag } from "@/components/country-flag";
import { Field, Label } from "@/components/fieldset";
import { Heading } from "@/components/heading";
import { Input } from "@/components/input";
import { Logo } from "@/components/logo";
import { usePanelNav } from "@/components/settings-dialog";
import { CopyButton } from "@/components/shared";
import { MenuRow, MenuSection, MenuSectionHeader, MenuSeparator } from "@/components/shared/menu-list";
import { Text } from "@/components/text";
import { Textarea } from "@/components/textarea";
import {
	getAPIErrorMessage,
	getAssetUrl,
	useAddBankAccount,
	useBankAccount,
	useChangeOrgPhone,
	useDashboard,
	useDeleteBankAccount,
	useFileUpload,
	useGSTDetails,
	useOrganizationProfile,
	useOrganizationSettings,
	usePasskeyReauthOptions,
	useUpdateOrganizationSettings,
	useVerifyBankAccount,
	useVerifyGST,
	useVerifyGSTPreview,
} from "@/hooks";
import { useOrgSlug } from "@/hooks/use-org-slug";
import {
	getAllCountries,
	getCitiesForState,
	getStatesForCountry,
	resolveCountryIsoCode,
	resolveStateIsoCode,
} from "@/lib/location-data";
import { showToast } from "@/lib/toast";
import { useCan } from "@/store/permissions-store";

// =============================================================================
// SKELETON LOADING
// =============================================================================

function OrganizationSettingsSkeleton() {
	return (
		<div className="space-y-6 pb-20">
			<div>
				<div className="h-8 w-48 animate-pulse rounded-lg bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
				<div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
			</div>
			<div className="h-48 animate-pulse rounded-2xl bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
			{[1, 2, 3].map((i) => (
				<div key={i} className="space-y-2">
					<div className="h-4 w-28 animate-pulse rounded bg-zinc-200 skeleton-shimmer dark:bg-zinc-800" />
					<div className="h-36 animate-pulse rounded-xl bg-zinc-100 skeleton-shimmer dark:bg-zinc-800" />
				</div>
			))}
		</div>
	);
}

// =============================================================================
// ORGANIZATION PROFILE HEADER CARD
// =============================================================================

function OrganizationProfileCard({
	name,
	logo,
	stats,
	onEditProfile,
	canEdit,
}: {
	name: string;
	logo?: string | null;
	stats: Array<{ label: string; value: string | number }>;
	onEditProfile: () => void;
	canEdit?: boolean;
}) {
	const initials =
		name
			.split(" ")
			.map((n) => n[0])
			.slice(0, 2)
			.join("")
			.toUpperCase() || "O";

	const logoUrl = logo ? getAssetUrl(logo) : null;

	return (
		<div className="overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-white/5 dark:bg-zinc-800">
			<div className="flex items-center justify-between px-4 py-4 sm:px-5">
				<div className="flex items-center gap-3 sm:gap-4">
					<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-700 text-base font-bold text-white ring-1 ring-white/10 sm:size-14 sm:rounded-2xl sm:text-lg dark:bg-zinc-600">
						{logoUrl ? <img src={logoUrl} alt={name} className="size-full object-cover" /> : initials}
					</div>
					<div className="min-w-0">
						<h2 className="truncate text-sm font-semibold text-white sm:text-base">{name}</h2>
						<p className="mt-0.5 truncate text-xs text-zinc-400 sm:text-sm">Organization</p>
					</div>
				</div>
				{canEdit && (
					<button
						type="button"
						onClick={onEditProfile}
						className="ml-3 shrink-0 rounded-xl bg-white/8 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/15 hover:text-white"
						aria-label="Edit organization"
					>
						Edit
					</button>
				)}
			</div>
			{/* Stats strip */}
			<div className="grid grid-cols-3 divide-x divide-white/8 border-t border-white/8">
				{stats.map((stat) => (
					<div key={stat.label} className="px-3 py-2.5 text-center sm:px-4 sm:py-3">
						<p className="text-sm font-bold text-white sm:text-base">{stat.value}</p>
						<p className="mt-0.5 text-[10px] font-medium text-zinc-400 sm:text-[11px]">{stat.label}</p>
					</div>
				))}
			</div>
		</div>
	);
}

// =============================================================================
// EDIT ORGANIZATION PANEL
// =============================================================================

function EditOrganizationPanel({
	organizationId,
	initialData,
}: {
	organizationId: string | undefined;
	initialData: {
		name: string;
		description?: string;
		website?: string;
		logo?: string;
		contactPerson?: string;
		address?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
	};
}) {
	const panelNav = usePanelNav();
	const pop = () => panelNav?.popPanel();

	const [formData, setFormData] = useState(initialData);
	const [error, setError] = useState<string | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [logoFile, setLogoFile] = useState<File | null>(null);

	const countries = useMemo(() => getAllCountries(), []);
	const selectedCountry = useMemo(() => {
		if (!formData.country) return null;
		const val = formData.country.trim().toLowerCase();
		return countries.find((c) => c.name.toLowerCase() === val || c.isoCode.toLowerCase() === val) ?? null;
	}, [countries, formData.country]);
	const countryCode = selectedCountry?.isoCode ?? resolveCountryIsoCode(formData.country || "");
	const stateOptions = useMemo(() => (countryCode ? getStatesForCountry(countryCode) : []), [countryCode]);
	const selectedState = useMemo(() => {
		if (!formData.state) return null;
		const val = formData.state.trim().toLowerCase();
		return stateOptions.find((s) => s.name.toLowerCase() === val || s.isoCode.toLowerCase() === val) ?? null;
	}, [stateOptions, formData.state]);
	const stateCode =
		selectedState?.isoCode ?? (countryCode ? resolveStateIsoCode(countryCode, formData.state || "") : null);
	const cityOptions = useMemo(
		() => (countryCode && stateCode ? getCitiesForState(countryCode, stateCode) : []),
		[countryCode, stateCode]
	);

	const updateOrg = useUpdateOrganizationSettings(organizationId);
	const fileUpload = useFileUpload();

	const isPending = updateOrg.isPending || fileUpload.isPending;

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setError("Please select an image file");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			setError("Image must be under 5MB");
			return;
		}
		setLogoFile(file);
		setLogoPreview(URL.createObjectURL(file));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!organizationId || !formData.name.trim()) {
			setError("Organization name is required");
			return;
		}

		try {
			let logoUrl = formData.logo;
			if (logoFile) {
				const result = await fileUpload.mutateAsync({
					file: logoFile,
					folder: "org-logos",
					resourceId: organizationId,
				});
				logoUrl = result.fileUrl;
			}

			await updateOrg.mutateAsync({
				name: formData.name.trim(),
				description: formData.description?.trim() || undefined,
				website: formData.website?.trim() || undefined,
				logo: logoUrl || undefined,
				contactPerson: formData.contactPerson?.trim() || undefined,
				address: formData.address?.trim() || undefined,
				city: formData.city?.trim() || undefined,
				state: formData.state?.trim() || undefined,
				country: countryCode || undefined,
				postalCode: formData.postalCode?.trim() || undefined,
			});
			showToast.success("Organization updated");
			pop();
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to update organization"));
		}
	};

	useEffect(() => {
		setFormData(initialData);
	}, [initialData]);

	return (
		<div className="space-y-4">
			<p className="text-sm text-zinc-500 dark:text-zinc-400">
				Update your organization profile and contact information.
			</p>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Logo Upload */}
				<Field>
					<Label>Organization Logo</Label>
					<div className="mt-1.5 flex items-center gap-4">
						<div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
							{logoPreview || formData.logo ? (
								<img src={logoPreview || getAssetUrl(formData.logo)} alt="Logo" className="size-full object-cover" />
							) : (
								<CameraIcon className="size-6 text-zinc-400" />
							)}
						</div>
						<div>
							<label
								htmlFor="logo-upload"
								className="cursor-pointer rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
							>
								{formData.logo || logoPreview ? "Change Logo" : "Upload Logo"}
							</label>
							<input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
							<p className="mt-1 text-xs text-zinc-500">PNG, JPG up to 5MB</p>
						</div>
					</div>
				</Field>

				<Field>
					<Label>Organization Name *</Label>
					<Input
						value={formData.name}
						onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
						placeholder="Organization name"
						required
					/>
				</Field>

				<Field>
					<Label>Description</Label>
					<Textarea
						value={formData.description || ""}
						onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
						placeholder="Brief description of your organization..."
						rows={2}
					/>
				</Field>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Field>
						<Label>Website</Label>
						<Input
							value={formData.website || ""}
							onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
							placeholder="https://example.com"
						/>
					</Field>
					<Field>
						<Label>Contact Person</Label>
						<Input
							value={formData.contactPerson || ""}
							onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))}
							placeholder="Contact person name"
						/>
					</Field>
				</div>

				<Field>
					<Label>Address</Label>
					<Input
						value={formData.address || ""}
						onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
						placeholder="Street address"
					/>
				</Field>

				<Field>
					<Label>Country</Label>
					<Combobox
						options={countries}
						value={selectedCountry}
						onChange={(c) => {
							setFormData((p) => ({
								...p,
								country: c?.name || "",
								state: "",
								city: "",
							}));
						}}
						displayValue={(c) => c?.name ?? ""}
						placeholder="Search country..."
					>
						{(option) => (
							<ComboboxOption key={option.isoCode} value={option}>
								<CountryFlag country={option.isoCode} size="s" />
								<ComboboxLabel>{option.name}</ComboboxLabel>
							</ComboboxOption>
						)}
					</Combobox>
				</Field>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Field>
						<Label>State</Label>
						{stateOptions.length > 0 ? (
							<Combobox
								options={stateOptions}
								value={selectedState}
								onChange={(s) => {
									setFormData((p) => ({
										...p,
										state: s?.name || "",
										city: "",
									}));
								}}
								displayValue={(s) => s?.name ?? ""}
								placeholder="Search state..."
							>
								{(option) => (
									<ComboboxOption key={option.isoCode} value={option}>
										<ComboboxLabel>{option.name}</ComboboxLabel>
									</ComboboxOption>
								)}
							</Combobox>
						) : (
							<Input
								value={formData.state || ""}
								onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
								placeholder="State / Province"
							/>
						)}
					</Field>
					<Field>
						<Label>City</Label>
						{cityOptions.length > 0 ? (
							<Combobox
								options={cityOptions}
								value={formData.city || null}
								onChange={(c) => setFormData((p) => ({ ...p, city: c || "" }))}
								displayValue={(c) => c ?? ""}
								placeholder="Search city..."
							>
								{(option) => (
									<ComboboxOption key={option} value={option}>
										<ComboboxLabel>{option}</ComboboxLabel>
									</ComboboxOption>
								)}
							</Combobox>
						) : (
							<Input
								value={formData.city || ""}
								onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
								placeholder="City"
							/>
						)}
					</Field>
				</div>

				<Field>
					<Label>Postal Code</Label>
					<Input
						value={formData.postalCode || ""}
						onChange={(e) => setFormData((p) => ({ ...p, postalCode: e.target.value }))}
						placeholder="400001"
					/>
				</Field>
			</form>

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={pop} disabled={isPending}>
					Cancel
				</Button>
				<Button color="dark/zinc" onClick={handleSubmit} disabled={isPending || !formData.name.trim()}>
					{fileUpload.isPending ? "Uploading..." : updateOrg.isPending ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// ADD BANK ACCOUNT PANEL
// =============================================================================

function AddBankAccountPanel({ organizationId }: { organizationId: string | undefined }) {
	const panelNav = usePanelNav();
	const pop = () => panelNav?.popPanel();

	const [accountNumber, setAccountNumber] = useState("");
	const [ifscCode, setIfscCode] = useState("");
	const [accountHolderName, setAccountHolderName] = useState("");
	const [bankName, setBankName] = useState("");
	const [accountType, setAccountType] = useState<"current" | "savings">("current");
	const [validationId, setValidationId] = useState("");
	const [verified, setVerified] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const verifyBank = useVerifyBankAccount(organizationId);
	const addBank = useAddBankAccount(organizationId);

	const handleVerify = async () => {
		setError(null);
		if (!accountNumber.trim() || !ifscCode.trim()) {
			setError("Account number and IFSC are required");
			return;
		}
		try {
			const result = await verifyBank.mutateAsync({
				accountNumber: accountNumber.trim(),
				ifscCode: ifscCode.trim().toUpperCase(),
			});
			if (result.isVerified) {
				setAccountHolderName(result.registeredName || accountHolderName);
				setValidationId(result.validationId);
				setVerified(true);
				showToast.success("Bank account verified");
			} else {
				setError(result.message || "Bank account verification failed. Please check details.");
			}
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to verify bank account"));
		}
	};

	const handleAdd = async () => {
		setError(null);
		try {
			await addBank.mutateAsync({
				accountNumber: accountNumber.trim(),
				ifscCode: ifscCode.trim().toUpperCase(),
				accountHolderName: accountHolderName.trim(),
				bankName: bankName.trim() || "Unknown",
				accountType,
				validationId,
			});
			showToast.success("Bank account added");
			pop();
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to add bank account"));
		}
	};

	return (
		<div className="space-y-4">
			<p className="text-sm text-zinc-500 dark:text-zinc-400">
				Add your bank account for withdrawals. We'll verify your account first.
			</p>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<Field>
				<Label>Account Number</Label>
				<Input
					value={accountNumber}
					onChange={(e) => {
						setAccountNumber(e.target.value);
						setVerified(false);
					}}
					placeholder="Enter account number"
					disabled={verified}
				/>
			</Field>
			<Field>
				<Label>IFSC Code</Label>
				<Input
					value={ifscCode}
					onChange={(e) => {
						setIfscCode(e.target.value.toUpperCase());
						setVerified(false);
					}}
					placeholder="e.g., SBIN0001234"
					maxLength={11}
					disabled={verified}
				/>
			</Field>
			<Field>
				<Label>Account Holder Name</Label>
				<Input
					value={accountHolderName}
					onChange={(e) => setAccountHolderName(e.target.value)}
					placeholder="As per bank records"
					disabled={verified}
				/>
			</Field>
			<Field>
				<Label>Bank Name</Label>
				<Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., State Bank of India" />
			</Field>

			<div className="flex gap-4">
				<label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
					<input
						type="radio"
						name="accountType"
						value="current"
						checked={accountType === "current"}
						onChange={() => setAccountType("current")}
						className="size-4 accent-zinc-900 dark:accent-white"
					/>
					Current
				</label>
				<label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
					<input
						type="radio"
						name="accountType"
						value="savings"
						checked={accountType === "savings"}
						onChange={() => setAccountType("savings")}
						className="size-4 accent-zinc-900 dark:accent-white"
					/>
					Savings
				</label>
			</div>

			{verified && (
				<div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
					<CheckCircleIcon className="size-5 text-emerald-500" />
					<span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Bank account verified</span>
				</div>
			)}

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={pop}>
					Cancel
				</Button>
				{!verified ? (
					<Button
						color="dark/zinc"
						onClick={handleVerify}
						disabled={verifyBank.isPending || !accountNumber || !ifscCode}
					>
						{verifyBank.isPending ? "Verifying..." : "Verify Account"}
					</Button>
				) : (
					<Button color="emerald" onClick={handleAdd} disabled={addBank.isPending}>
						{addBank.isPending ? "Adding..." : "Add Account"}
					</Button>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// CHANGE PHONE PANEL
// =============================================================================

function ChangePhonePanel({
	organizationId,
	currentPhone,
}: {
	organizationId: string | undefined;
	currentPhone?: string;
}) {
	const panelNav = usePanelNav();
	const pop = () => panelNav?.popPanel();

	const [phoneNumber, setPhoneNumber] = useState(currentPhone || "");
	const [error, setError] = useState<string | null>(null);

	const changeOrgPhone = useChangeOrgPhone(organizationId);
	const passkeyReauth = usePasskeyReauthOptions();

	const handleSubmit = async () => {
		if (!organizationId) return;
		const phone = phoneNumber.trim();
		if (!phone || phone.length < 10) {
			setError("Please enter a valid phone number");
			return;
		}
		setError(null);
		try {
			const { options, challengeId } = await passkeyReauth.mutateAsync();
			const assertion = await startAuthentication({
				optionsJSON: options as Parameters<typeof startAuthentication>[0]["optionsJSON"],
			});
			await changeOrgPhone.mutateAsync({
				phoneNumber: phone,
				passkeyResponse: assertion,
				challengeId,
			});
			showToast.success("Phone number updated");
			pop();
		} catch (err) {
			if (err instanceof Error && err.message === "Passkey verification cancelled") {
				setError("Passkey verification was cancelled.");
			} else {
				setError(getAPIErrorMessage(err, "Failed to update phone number"));
			}
		}
	};

	const isPending = changeOrgPhone.isPending || passkeyReauth.isPending;

	return (
		<div className="space-y-4">
			<p className="text-sm text-zinc-500 dark:text-zinc-400">
				Update your organization's contact phone number. Passkey verification required.
			</p>

			{error && (
				<div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
					<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
				</div>
			)}

			<Field>
				<Label>Phone Number</Label>
				<Input
					value={phoneNumber}
					onChange={(e) => setPhoneNumber(e.target.value)}
					placeholder="+91 98765 43210"
					type="tel"
				/>
			</Field>

			<div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={pop} disabled={isPending}>
					Cancel
				</Button>
				<Button color="dark/zinc" onClick={handleSubmit} disabled={isPending || !phoneNumber.trim()}>
					{isPending ? "Updating..." : "Update Phone"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// VERIFY / UPDATE GST PANEL
// =============================================================================

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

interface GSTPreview {
	legalName: string;
	tradeName?: string;
	gstStatus: string;
	address?: string;
	city?: string;
	state?: string;
	pinCode?: string;
	businessType?: string;
	registrationDate?: string;
	stateCode: string;
}

function GSTPreviewDetail({ label, value, icon: Icon }: { label: string; value?: string; icon: React.ComponentType<{ className?: string }> }) {
	if (!value) return null;
	return (
		<div className="flex items-start gap-2.5 py-1.5">
			<div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/40">
				<Icon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
			</div>
			<div className="min-w-0">
				<p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{label}</p>
				<p className="text-sm text-zinc-800 dark:text-zinc-200">{value}</p>
			</div>
		</div>
	);
}

function VerifyGSTPanel({
	organizationId,
	currentGST,
}: {
	organizationId: string | undefined;
	currentGST?: string;
}) {
	const panelNav = usePanelNav();
	const pop = () => panelNav?.popPanel();

	const [gstNumber, setGstNumber] = useState(currentGST || "");
	const [error, setError] = useState<string | null>(null);
	const [previewData, setPreviewData] = useState<GSTPreview | null>(null);

	const verifyPreview = useVerifyGSTPreview();
	const verifyGST = useVerifyGST();

	const isValidGST = GST_REGEX.test(gstNumber.trim().toUpperCase());
	const isChanged = gstNumber.trim().toUpperCase() !== (currentGST || "").toUpperCase();

	const handlePreview = async () => {
		setError(null);
		setPreviewData(null);
		const formatted = gstNumber.trim().toUpperCase();
		if (!isValidGST) {
			setError("Enter a valid 15-character GSTIN (e.g. 29AABCI5013R1ZB)");
			return;
		}
		try {
			const result = await verifyPreview.mutateAsync({ gstNumber: formatted });
			setPreviewData({
				legalName: result.legalName,
				tradeName: result.tradeName,
				gstStatus: result.gstStatus,
				address: result.address,
				city: result.city,
				state: result.state,
				pinCode: result.pinCode,
				businessType: result.businessType,
				registrationDate: result.registrationDate,
				stateCode: result.stateCode,
			});
		} catch (err) {
			setError(getAPIErrorMessage(err, "GST verification failed"));
		}
	};

	const handleSave = async () => {
		if (!organizationId) return;
		setError(null);
		const formatted = gstNumber.trim().toUpperCase();
		try {
			await verifyGST.mutateAsync({ organizationId, gstNumber: formatted });
			showToast.success("GST verified and saved");
			pop();
		} catch (err) {
			setError(getAPIErrorMessage(err, "Failed to save GST"));
		}
	};

	const isPending = verifyPreview.isPending || verifyGST.isPending;

	// Build full address from preview parts
	const fullAddress = previewData
		? [previewData.address, previewData.city, previewData.state, previewData.pinCode].filter(Boolean).join(", ")
		: undefined;

	return (
		<div className="space-y-4">
			{/* Input */}
			<div>
				<Field>
					<Label>GSTIN</Label>
					<div className="flex gap-2">
						<Input
							value={gstNumber}
							onChange={(e) => {
								setGstNumber(e.target.value.toUpperCase());
								setPreviewData(null);
							}}
							placeholder="29AABCI5013R1ZB"
							maxLength={15}
							className="flex-1 font-mono text-base tracking-widest"
							disabled={!!previewData}
						/>
						{!previewData ? (
							<Button
								color="dark/zinc"
								onClick={handlePreview}
								disabled={isPending || !isValidGST}
							>
								{verifyPreview.isPending ? "Checking..." : "Verify"}
							</Button>
						) : (
							<Button plain onClick={() => setPreviewData(null)}>
								Edit
							</Button>
						)}
					</div>
				</Field>
				{!previewData && !error && (
					<p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
						We'll verify this with the GST portal. Required for campaigns & invoicing.
					</p>
				)}
			</div>

			{/* Error */}
			{error && (
				<div className="flex items-start gap-2.5 rounded-xl bg-red-50 px-3.5 py-3 ring-1 ring-red-200/60 dark:bg-red-950/20 dark:ring-red-900/40">
					<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500 dark:text-red-400" />
					<p className="text-sm text-red-700 dark:text-red-300">{error}</p>
				</div>
			)}

			{/* Preview Card */}
			{previewData && (
				<div className="overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-700">
					{/* Header */}
					<div className="flex items-center gap-2.5 bg-emerald-50 px-4 py-2.5 dark:bg-emerald-950/30">
						<ShieldCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
						<span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
							Verified — {previewData.gstStatus}
						</span>
					</div>

					{/* Details Grid */}
					<div className="grid grid-cols-1 gap-x-4 px-4 py-3 sm:grid-cols-2">
						<GSTPreviewDetail icon={UserCircleIcon} label="Legal Name" value={previewData.legalName} />
						<GSTPreviewDetail icon={BuildingOfficeIcon} label="Trade Name" value={previewData.tradeName} />
						<GSTPreviewDetail icon={BuildingStorefrontIcon} label="Business Type" value={previewData.businessType} />
						<GSTPreviewDetail icon={CalendarDaysIcon} label="Registered" value={previewData.registrationDate} />
						<div className="sm:col-span-2">
							<GSTPreviewDetail icon={MapPinIcon} label="Registered Address" value={fullAddress} />
						</div>
					</div>
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
				<Button plain onClick={pop} disabled={isPending}>
					Cancel
				</Button>
				<Button
					color="emerald"
					onClick={handleSave}
					disabled={isPending || !previewData}
				>
					{verifyGST.isPending ? "Saving..." : isChanged ? "Save New GST" : "Confirm & Save"}
				</Button>
			</div>
		</div>
	);
}

// =============================================================================
// ORGANIZATION SETTINGS PAGE
// =============================================================================

export type OrgSettingsSection = "profile" | "gst" | "bank" | "billing" | "all";

export function Settings({ section = "all" }: { section?: OrgSettingsSection } = {}) {
	const { organization, loading: isLoadingOrg } = useOrganizationProfile();
	const organizationId = organization?.id;
	const { data: orgDetails } = useOrganizationSettings(organizationId);
	const { data: dashboardData, loading: isLoadingStats } = useDashboard(organizationId);
	const { data: bankAccount, loading: isBankLoading, refetch: refetchBank } = useBankAccount(organizationId);
	const { data: gstDetails, loading: isGSTLoading } = useGSTDetails(organizationId);
	const deleteBankAccount = useDeleteBankAccount();
	const stats = dashboardData?.stats;

	const canUpdateOrganization = useCan("organization", "update");
	const canCreateBankAccount = useCan("bankAccount", "create");
	const canDeleteBankAccount = useCan("bankAccount", "delete");
	const orgSlug = useOrgSlug();
	const panelNav = usePanelNav();

	const formatSpent = (decimal: string | undefined) => {
		if (!decimal) return "₹0";
		const amount = parseFloat(decimal);
		if (Number.isNaN(amount) || amount === 0) return "₹0";
		if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
		if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
		return `₹${amount.toFixed(0)}`;
	};

	const openEditOrg = () => {
		const initialData = {
			name: organization?.name || "",
			description: orgDetails?.description ?? undefined,
			website: orgDetails?.website ?? undefined,
			logo: orgDetails?.logo ?? undefined,
			contactPerson: orgDetails?.contactPerson ?? undefined,
			address: orgDetails?.address ?? undefined,
			city: orgDetails?.city ?? undefined,
			state: orgDetails?.state ?? undefined,
			country: orgDetails?.country ?? undefined,
			postalCode: orgDetails?.postalCode ?? undefined,
		};
		if (panelNav) {
			panelNav.pushPanel(
				"edit-org",
				"Edit Organization",
				<EditOrganizationPanel organizationId={organizationId} initialData={initialData} />
			);
		}
	};

	const openAddBank = () => {
		if (panelNav) {
			panelNav.pushPanel("add-bank", "Add Bank Account", <AddBankAccountPanel organizationId={organizationId} />);
		}
	};

	const openChangePhone = () => {
		if (panelNav) {
			panelNav.pushPanel(
				"change-phone",
				"Change Phone Number",
				<ChangePhonePanel organizationId={organizationId} currentPhone={orgDetails?.phoneNumber || ""} />
			);
		}
	};

	const openVerifyGST = () => {
		if (panelNav) {
			panelNav.pushPanel(
				"verify-gst",
				"Verify GST",
				<VerifyGSTPanel organizationId={organizationId} currentGST={gstDetails?.gstDetails?.gstNumber} />
			);
		}
	};

	const handleDeleteBank = async () => {
		if (!organizationId) return;
		if (!window.confirm("Are you sure you want to remove this bank account?")) return;
		try {
			await deleteBankAccount.mutateAsync({ organizationId });
			showToast.success("Bank account removed");
			refetchBank();
		} catch (err) {
			showToast.error(err, "Failed to remove bank account");
		}
	};

	const loading = isLoadingOrg || isLoadingStats;

	if (loading) {
		return <OrganizationSettingsSkeleton />;
	}

	const orgData = orgDetails;
	const show = (s: OrgSettingsSection) => section === "all" || section === s;
	const isDialog = section !== "all";

	// --- Section: Profile ---
	const profileSection = (
		<>
			<OrganizationProfileCard
				name={organization?.name || "Organization"}
				logo={orgData?.logo}
				stats={[
					{ label: "Campaigns", value: stats?.activeCampaigns ?? 0 },
					{ label: "Enrollments", value: stats?.totalEnrollments ?? 0 },
					{ label: "Balance", value: formatSpent(stats?.walletBalanceDecimal) },
				]}
				onEditProfile={openEditOrg}
				canEdit={canUpdateOrganization}
			/>
			<div>
				<MenuSectionHeader>Organization Details</MenuSectionHeader>
				<MenuSection>
					<MenuRow
						icon={BuildingStorefrontIcon}
						iconColor="sky"
						label="Organization Name"
						value={organization?.name || "—"}
						onClick={canUpdateOrganization ? openEditOrg : undefined}
						isFirst
					/>
					<MenuSeparator />
					<MenuRow
						icon={GlobeAltIcon}
						iconColor="sky"
						label="Website"
						value={orgData?.website || "Not set"}
						onClick={canUpdateOrganization ? openEditOrg : undefined}
					/>
					<MenuSeparator />
					<MenuRow
						icon={MapPinIcon}
						iconColor="red"
						label="Address"
						value={[orgData?.address, orgData?.city, orgData?.state].filter(Boolean).join(", ") || "Not set"}
						onClick={canUpdateOrganization ? openEditOrg : undefined}
					/>
					<MenuSeparator />
					<MenuRow
						icon={PhoneIcon}
						iconColor="emerald"
						label="Phone"
						value={orgData?.phoneNumber || "Not set"}
						onClick={canUpdateOrganization ? openChangePhone : undefined}
						isLast
					/>
				</MenuSection>
			</div>
		</>
	);

	// --- Section: GST ---
	const gst = gstDetails?.gstDetails;
	const gstIsVerified = gst?.isVerified === true;
	const hasGST = !!gst?.gstNumber;
	const billingAddress = [orgData?.address, orgData?.city, orgData?.state, orgData?.postalCode].filter(Boolean).join(", ");

	const gstSection = (
		<div className="space-y-1.5">
			<MenuSectionHeader>GST & Compliance</MenuSectionHeader>

			{isGSTLoading ? (
				<div className="h-44 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
			) : !hasGST ? (
				/* ── Empty State: No GST ── */
				<div className="overflow-hidden rounded-xl ring-1 ring-zinc-200/80 dark:ring-zinc-700/60">
					<div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/40">
							<IdentificationIcon className="size-6 text-amber-600 dark:text-amber-400" />
						</div>
						<div>
							<p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">No GST number added</p>
							<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
								Add your GSTIN to create campaigns, listings, and generate invoices
							</p>
						</div>
						{canUpdateOrganization && (
							<Button color="amber" className="mt-1" onClick={openVerifyGST}>
								Add & Verify GST
							</Button>
						)}
					</div>
				</div>
			) : (
				/* ── GST Details Card ── */
				<div className="overflow-hidden rounded-xl ring-1 ring-zinc-200/80 dark:ring-zinc-700/60">
					{/* Status Banner */}
					<div className={`flex items-center justify-between px-4 py-2 ${
						gstIsVerified
							? "bg-emerald-50 dark:bg-emerald-950/20"
							: "bg-amber-50 dark:bg-amber-950/20"
					}`}>
						<div className="flex items-center gap-2">
							{gstIsVerified ? (
								<ShieldCheckIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
							) : (
								<ExclamationTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
							)}
							<span className={`text-xs font-semibold uppercase tracking-wide ${
								gstIsVerified
									? "text-emerald-700 dark:text-emerald-300"
									: "text-amber-700 dark:text-amber-300"
							}`}>
								{gstIsVerified ? "Verified" : "Pending Verification"}
							</span>
							{gst.verifiedAt && (
								<span className="text-[10px] text-zinc-400 dark:text-zinc-500">
									· {new Date(gst.verifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
								</span>
							)}
						</div>
						{canUpdateOrganization && (
							<BadgeButton
								color={gstIsVerified ? "zinc" : "amber"}
								onClick={openVerifyGST}
							>
								{gstIsVerified ? "Change" : "Verify Now"}
							</BadgeButton>
						)}
					</div>

					{/* GSTIN + Legal Name */}
					<div className="px-4 py-3">
						<div className="flex items-baseline justify-between gap-3">
							<p className="font-mono text-lg font-semibold tracking-widest text-zinc-900 dark:text-white">
								{gst.gstNumber}
							</p>
							<CopyButton value={gst.gstNumber} label="GST Number" />
						</div>
						<p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
							{gst.legalName}
							{gst.tradeName && gst.tradeName !== gst.legalName && (
								<span className="text-zinc-300 dark:text-zinc-600"> · {gst.tradeName}</span>
							)}
						</p>
					</div>

					{/* Billing Address */}
					<div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
						<div className="flex items-start gap-2.5">
							<MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" />
							<div className="min-w-0 flex-1">
								<p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
									Billing Address
								</p>
								{billingAddress ? (
									<p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{billingAddress}</p>
								) : (
									<p className="mt-0.5 text-sm italic text-zinc-400 dark:text-zinc-500">
										Not set — update in{" "}
										<button type="button" className="underline" onClick={canUpdateOrganization ? openEditOrg : undefined}>
											Organization Details
										</button>
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);

	// --- Section: Bank ---
	const bankSection = (
		<div>
			<MenuSectionHeader>Bank Account</MenuSectionHeader>
			{isBankLoading ? (
				<div className="h-36 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
			) : bankAccount ? (
				<MenuSection>
					<MenuRow
						icon={CreditCardIcon}
						iconColor="emerald"
						label="Account Number"
						value={`****${bankAccount.accountNumber?.slice(-4) || "****"}`}
						isFirst
					/>
					<MenuSeparator />
					<MenuRow
						icon={HashtagIcon}
						iconColor="sky"
						label="IFSC Code"
						value={bankAccount.ifscCode || "—"}
						suffix={bankAccount.ifscCode ? <CopyButton value={bankAccount.ifscCode} label="IFSC Code" /> : undefined}
					/>
					<MenuSeparator />
					<MenuRow
						icon={UserCircleIcon}
						iconColor="zinc"
						label="Account Holder"
						value={bankAccount.accountHolderName || "—"}
						suffix={
							bankAccount.accountHolderName ? (
								<CopyButton value={bankAccount.accountHolderName} label="Account Holder" />
							) : undefined
						}
					/>
					<MenuSeparator />
					<div className="flex items-center justify-between px-4 py-3">
						<Badge color="emerald">
							<CheckCircleIcon className="size-3" />
							Verified
						</Badge>
						{canDeleteBankAccount && (
							<Button
								plain
								onClick={handleDeleteBank}
								disabled={deleteBankAccount.isPending}
								className="text-red-500 hover:text-red-700"
							>
								<TrashIcon className="size-4" />
								{deleteBankAccount.isPending ? "Removing..." : "Remove"}
							</Button>
						)}
					</div>
				</MenuSection>
			) : (
				<div className="flex flex-col items-center gap-3 rounded-xl bg-zinc-50 py-8 ring-1 ring-zinc-200/80 dark:bg-zinc-800/60 dark:ring-zinc-700/60">
					<div className="flex size-12 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-700/60">
						<BanknotesIcon className="size-6 text-zinc-400 dark:text-zinc-500" />
					</div>
					<div className="text-center">
						<p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">No bank account added</p>
						<p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Add a bank account to enable withdrawals</p>
					</div>
					{canCreateBankAccount && (
						<Button color="dark/zinc" onClick={openAddBank}>
							Add Bank Account
						</Button>
					)}
				</div>
			)}
		</div>
	);

	// --- Section: Billing ---
	const billingSection = (
		<div>
			<MenuSectionHeader>Billing</MenuSectionHeader>
			<MenuSection>
				<MenuRow
					icon={ReceiptPercentIcon}
					iconColor="sky"
					label="Invoices"
					value="View billing history"
					href={`/${orgSlug}/invoices`}
					isFirst
					isLast
				/>
			</MenuSection>
		</div>
	);

	return (
		<div className={isDialog ? "space-y-6 px-4 py-5 pb-10 sm:px-6" : "space-y-6 pb-20"}>
			{section === "all" && (
				<div>
					<Heading>Organization Settings</Heading>
					<Text className="mt-1">Manage your organization profile, billing, and compliance</Text>
				</div>
			)}

			{show("profile") && profileSection}
			{show("gst") && gstSection}
			{show("bank") && bankSection}
			{show("billing") && billingSection}

			{section === "all" && (
				<div className="flex flex-col items-center gap-2 pt-8">
					<Logo className="h-5 w-auto text-zinc-400 dark:text-zinc-600" />
					<p className="text-xs text-zinc-400 dark:text-zinc-600">v1.0.0</p>
				</div>
			)}
		</div>
	);
}
