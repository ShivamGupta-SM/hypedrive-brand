/**
 * Dead Code Audit — Visual Comparison Page
 *
 * Demonstrates every dead/unused component vs its current replacement.
 * Navigate to /$orgSlug/code-audit to view.
 */

import {
	ArchiveBoxXMarkIcon,
	ArrowTrendingUpIcon,
	BellAlertIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	CurrencyRupeeIcon,
	DocumentTextIcon,
	ExclamationTriangleIcon,
	EyeIcon,
	InformationCircleIcon,
	PaintBrushIcon,
	ShieldExclamationIcon,
	ShoppingBagIcon,
	SparklesIcon,
	TrashIcon,
	UsersIcon,
} from "@heroicons/react/24/outline";
import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Alert, AlertActions, AlertDescription, AlertTitle } from "@/components/alert";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { DescriptionDetails, DescriptionList, DescriptionTerm } from "@/components/description-list";
import { Dialog, DialogActions, DialogBody, DialogHeader } from "@/components/dialog";
import { Field, Label } from "@/components/fieldset";
import { Heading, Subheading } from "@/components/heading";
import { Listbox, ListboxLabel, ListboxOption } from "@/components/listbox";
import {
	ActionLink,
	AlertBanner,
	CardSkeleton,
	ContentCard,
	InfoPanel,
	PageHeader,
	PageLayout,
	PageSection,
	PageSkeleton,
	TipBox,
} from "@/components/page-header";
import {
	Pagination,
	PaginationGap,
	PaginationList,
	PaginationNext,
	PaginationPage,
	PaginationPrevious,
} from "@/components/pagination";
import { Radio, RadioField, RadioGroup } from "@/components/radio";
import { Select } from "@/components/select";
// ═══════════════════════════════════════════════════════════════
// CURRENT COMPONENTS (actively used)
// ═══════════════════════════════════════════════════════════════
import { StatCard } from "@/components/shared/card";
// ═══════════════════════════════════════════════════════════════
// DEAD COMPONENTS (currently unused in production)
// ═══════════════════════════════════════════════════════════════
import { Stat } from "@/components/stat";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Text } from "@/components/text";
import { VirtualList } from "@/components/virtual-list";
import { formatCurrency, formatStatus, getStatusColor } from "@/lib/design-tokens";
// Dead: theme.ts
import { statusColors as themeStatusColors } from "@/lib/theme";

// ═══════════════════════════════════════════════════════════════
// ROUTE
// ═══════════════════════════════════════════════════════════════

export const Route = createFileRoute("/_app/$orgSlug/code-audit")({
	component: CodeAuditPage,
	head: () => ({
		meta: [{ title: "Dead Code Audit - Hypedrive" }],
	}),
});

// ═══════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════

function AuditBadge({ type }: { type: "dead" | "current" | "verdict-keep" | "verdict-remove" }) {
	const styles = {
		dead: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
		current: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
		"verdict-keep": "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
		"verdict-remove": "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
	};
	const labels = {
		dead: "DEAD",
		current: "CURRENT",
		"verdict-keep": "WORTH KEEPING",
		"verdict-remove": "SAFE TO DELETE",
	};
	return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>{labels[type]}</span>;
}

function SideBySide({
	leftLabel,
	rightLabel,
	left,
	right,
}: {
	leftLabel: string;
	rightLabel: string;
	left: ReactNode;
	right: ReactNode;
}) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<div>
				<div className="mb-3 flex items-center gap-2">
					<AuditBadge type="dead" />
					<span className="text-sm font-medium text-zinc-500">{leftLabel}</span>
				</div>
				<div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/30 p-4 dark:border-red-800/30 dark:bg-red-950/10">
					{left}
				</div>
			</div>
			<div>
				<div className="mb-3 flex items-center gap-2">
					<AuditBadge type="current" />
					<span className="text-sm font-medium text-zinc-500">{rightLabel}</span>
				</div>
				<div className="rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-800/30 dark:bg-emerald-950/10">
					{right}
				</div>
			</div>
		</div>
	);
}

function DemoSection({
	id,
	number,
	title,
	file,
	lines,
	verdict,
	children,
}: {
	id: string;
	number: number;
	title: string;
	file: string;
	lines: number;
	verdict: "keep" | "remove";
	children: ReactNode;
}) {
	return (
		<section
			id={id}
			className="scroll-mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
		>
			<div className="mb-6 flex flex-wrap items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<span className="flex size-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
						{number}
					</span>
					<div>
						<h2 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h2>
						<p className="text-sm text-zinc-500">
							<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">{file}</code>
							<span className="ml-2">{lines} lines</span>
						</p>
					</div>
				</div>
				<AuditBadge type={verdict === "keep" ? "verdict-keep" : "verdict-remove"} />
			</div>
			{children}
		</section>
	);
}

function VerdictBox({ children }: { children: ReactNode }) {
	return (
		<div className="mt-6 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400">
			{children}
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY DASHBOARD
// ═══════════════════════════════════════════════════════════════

const auditItems = [
	{
		name: "Stat",
		file: "components/stat.tsx",
		lines: 17,
		verdict: "remove" as const,
		replacement: "StatCard (shared/card.tsx)",
	},
	{
		name: "Alert",
		file: "components/alert.tsx",
		lines: 95,
		verdict: "remove" as const,
		replacement: "Dialog (dialog.tsx)",
	},
	{
		name: "DescriptionList",
		file: "components/description-list.tsx",
		lines: 37,
		verdict: "keep" as const,
		replacement: "Inline bordered rows",
	},
	{
		name: "Pagination",
		file: "components/pagination.tsx",
		lines: 98,
		verdict: "remove" as const,
		replacement: "Load more / infinite scroll",
	},
	{
		name: "Radio",
		file: "components/radio.tsx",
		lines: 143,
		verdict: "remove" as const,
		replacement: "Select dropdowns / buttons",
	},
	{
		name: "Listbox",
		file: "components/listbox.tsx",
		lines: 176,
		verdict: "remove" as const,
		replacement: "Select (select.tsx)",
	},
	{
		name: "Table",
		file: "components/table.tsx",
		lines: 133,
		verdict: "remove" as const,
		replacement: "Card-based layouts + react-table",
	},
	{
		name: "VirtualList",
		file: "components/virtual-list.tsx",
		lines: 378,
		verdict: "remove" as const,
		replacement: "Data sets not large enough",
	},
	{
		name: "PageHeader",
		file: "components/page-header.tsx",
		lines: 568,
		verdict: "remove" as const,
		replacement: "Inline Heading + Text",
	},
	{
		name: "InfoPanel",
		file: "shared/info-panel.tsx",
		lines: 371,
		verdict: "keep" as const,
		replacement: "Inline bg-{color}-50 divs",
	},
	{
		name: "Section",
		file: "shared/section.tsx",
		lines: 253,
		verdict: "remove" as const,
		replacement: "Inline <div> + <Heading>",
	},
	{
		name: "StatsRow",
		file: "shared/stats-row.tsx",
		lines: 340,
		verdict: "remove" as const,
		replacement: "StatCard grid",
	},
	{
		name: "PageContainer",
		file: "shared/page-container.tsx",
		lines: 201,
		verdict: "remove" as const,
		replacement: "SidebarLayout handles width",
	},
	{ name: "theme.ts", file: "lib/theme.ts", lines: 387, verdict: "remove" as const, replacement: "design-tokens.ts" },
];

const totalDeadLines = auditItems.reduce((sum, i) => sum + i.lines, 0);
const removeCount = auditItems.filter((i) => i.verdict === "remove").length;
const keepCount = auditItems.filter((i) => i.verdict === "keep").length;
const removeLines = auditItems.filter((i) => i.verdict === "remove").reduce((sum, i) => sum + i.lines, 0);

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

function CodeAuditPage() {
	const [alertOpen, setAlertOpen] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [radioValue, setRadioValue] = useState("email");
	const [listboxValue, setListboxValue] = useState("active");
	const [selectValue, setSelectValue] = useState("active");

	return (
		<div className="space-y-8 pb-20">
			{/* ─── HEADER ──────────────────────────────────────────── */}
			<div>
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
						<ArchiveBoxXMarkIcon className="size-5" />
					</div>
					<div>
						<Heading>Dead Code Audit</Heading>
						<Text className="mt-0.5">
							{auditItems.length} unused files found — visual comparison of dead vs current patterns
						</Text>
					</div>
				</div>
			</div>

			{/* ─── SUMMARY STATS ───────────────────────────────────── */}
			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
				<StatCard
					icon={<ArchiveBoxXMarkIcon className="size-5" />}
					label="Dead Files"
					value={auditItems.length}
					variant="danger"
					size="sm"
				/>
				<StatCard
					icon={<DocumentTextIcon className="size-5" />}
					label="Dead Lines"
					value={totalDeadLines.toLocaleString()}
					variant="warning"
					size="sm"
				/>
				<StatCard
					icon={<TrashIcon className="size-5" />}
					label="Safe to Delete"
					value={removeCount}
					sublabel={`${removeLines.toLocaleString()} lines`}
					variant="info"
					size="sm"
				/>
				<StatCard
					icon={<SparklesIcon className="size-5" />}
					label="Worth Keeping"
					value={keepCount}
					variant="success"
					size="sm"
				/>
			</div>

			{/* ─── AUDIT TABLE ─────────────────────────────────────── */}
			<div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
				<div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
					<span>Component</span>
					<span className="text-right">Lines</span>
					<span className="text-center">Verdict</span>
					<span className="hidden sm:block">Replaced By</span>
				</div>
				{auditItems.map((item, i) => (
					<a
						key={item.file}
						href={`#audit-${i + 1}`}
						className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
							i < auditItems.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
						}`}
					>
						<div>
							<span className="font-medium text-zinc-900 dark:text-white">{item.name}</span>
							<span className="ml-2 text-xs text-zinc-400">{item.file}</span>
						</div>
						<span className="text-right font-mono text-xs text-zinc-500">{item.lines}</span>
						<Badge color={item.verdict === "keep" ? "amber" : "red"}>
							{item.verdict === "keep" ? "Keep" : "Delete"}
						</Badge>
						<span className="hidden text-xs text-zinc-500 sm:block">{item.replacement}</span>
					</a>
				))}
			</div>

			{/* ═══════════════════════════════════════════════════════ */}
			{/* COMPONENT DEMOS START HERE                            */}
			{/* ═══════════════════════════════════════════════════════ */}

			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
					<EyeIcon className="size-5" />
				</div>
				<Subheading className="text-lg">Live Component Comparisons</Subheading>
			</div>

			{/* ─── 1. STAT vs STATCARD ─────────────────────────────── */}
			<DemoSection
				id="audit-1"
				number={1}
				title="Stat vs StatCard"
				file="components/stat.tsx"
				lines={17}
				verdict="remove"
			>
				<SideBySide
					leftLabel="stat.tsx — 17 lines, Badge + Divider"
					rightLabel="shared/card.tsx — variants, icons, trends, badges"
					left={
						<div className="grid grid-cols-2 gap-4">
							<Stat title="Total revenue" value="$2.6M" change="+4.5%" />
							<Stat title="Avg. order value" value="$455" change="-0.5%" />
							<Stat title="Tickets sold" value="1,823" change="+21.2%" />
							<Stat title="Pageviews" value="823,067" change="+21.2%" />
						</div>
					}
					right={
						<div className="grid grid-cols-2 gap-3">
							<StatCard
								icon={<CurrencyRupeeIcon className="size-5" />}
								label="Total Revenue"
								value="$2.6M"
								variant="success"
								size="sm"
								trend={{ value: 4.5, direction: "up" }}
							/>
							<StatCard
								icon={<ShoppingBagIcon className="size-5" />}
								label="Avg. Order"
								value="$455"
								variant="danger"
								size="sm"
								trend={{ value: 0.5, direction: "down" }}
							/>
							<StatCard
								icon={<UsersIcon className="size-5" />}
								label="Tickets Sold"
								value="1,823"
								variant="info"
								size="sm"
								trend={{ value: 21.2, direction: "up" }}
							/>
							<StatCard
								icon={<ChartBarIcon className="size-5" />}
								label="Pageviews"
								value="823,067"
								variant="lime"
								size="sm"
								badge={{ text: "Peak", variant: "success" }}
							/>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete stat.tsx.</strong> StatCard has icons, 7 color variants, size options, trend arrows,
					badges, click/href support, and sublabels. Stat is title + value + Badge with a Divider — too basic.
				</VerdictBox>
			</DemoSection>

			{/* ─── 2. ALERT vs DIALOG ──────────────────────────────── */}
			<DemoSection
				id="audit-2"
				number={2}
				title="Alert vs Dialog"
				file="components/alert.tsx"
				lines={95}
				verdict="remove"
			>
				<SideBySide
					leftLabel="alert.tsx — plain centered modal"
					rightLabel="dialog.tsx — DialogHeader with icon band, gradient"
					left={
						<div className="space-y-4">
							<Text>Plain centered confirmation modal — AlertTitle, AlertDescription, AlertActions.</Text>
							<Button color="red" onClick={() => setAlertOpen(true)}>
								Open Alert Dialog
							</Button>
							<Alert open={alertOpen} onClose={() => setAlertOpen(false)} size="sm">
								<AlertTitle>Delete Campaign?</AlertTitle>
								<AlertDescription>
									This will permanently delete "Summer Sale 2024" and all associated enrollment data.
								</AlertDescription>
								<AlertActions>
									<Button plain onClick={() => setAlertOpen(false)}>
										Cancel
									</Button>
									<Button color="red" onClick={() => setAlertOpen(false)}>
										Delete
									</Button>
								</AlertActions>
							</Alert>
						</div>
					}
					right={
						<div className="space-y-4">
							<Text>DialogHeader with colored icon band, gradient accent, close button. More polished.</Text>
							<Button color="red" onClick={() => setDialogOpen(true)}>
								Open Current Dialog
							</Button>
							<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} size="sm">
								<DialogHeader
									icon={TrashIcon}
									iconColor="red"
									title="Delete Campaign"
									description="This action is permanent and cannot be undone."
									onClose={() => setDialogOpen(false)}
								/>
								<DialogBody>
									<div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
										<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-red-500" />
										<p className="text-sm text-red-700 dark:text-red-300">
											This will permanently delete <strong>"Summer Sale 2024"</strong> and all associated enrollment
											data.
										</p>
									</div>
								</DialogBody>
								<DialogActions>
									<Button plain onClick={() => setDialogOpen(false)}>
										Cancel
									</Button>
									<Button color="red" onClick={() => setDialogOpen(false)}>
										<TrashIcon className="size-4" />
										Delete Campaign
									</Button>
								</DialogActions>
							</Dialog>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete alert.tsx.</strong> Dialog has colored icon band with gradient, close button, and
					description. Alert is plain text-only. Both use Headless UI underneath, but Dialog is far more polished.
				</VerdictBox>
			</DemoSection>

			{/* ─── 3. DESCRIPTION LIST ─────────────────────────────── */}
			<DemoSection
				id="audit-3"
				number={3}
				title="DescriptionList vs Inline Pattern"
				file="components/description-list.tsx"
				lines={37}
				verdict="keep"
			>
				<SideBySide
					leftLabel="description-list.tsx — semantic <dl>/<dt>/<dd>"
					rightLabel="Current pattern — bordered rows with icons"
					left={
						<DescriptionList>
							<DescriptionTerm>Campaign Name</DescriptionTerm>
							<DescriptionDetails>Summer Sale 2024</DescriptionDetails>
							<DescriptionTerm>Status</DescriptionTerm>
							<DescriptionDetails>
								<Badge color="lime">Active</Badge>
							</DescriptionDetails>
							<DescriptionTerm>Budget</DescriptionTerm>
							<DescriptionDetails>{formatCurrency(50000)}</DescriptionDetails>
							<DescriptionTerm>Start Date</DescriptionTerm>
							<DescriptionDetails>Mar 1, 2026</DescriptionDetails>
							<DescriptionTerm>Created By</DescriptionTerm>
							<DescriptionDetails>Shivam Gupta</DescriptionDetails>
						</DescriptionList>
					}
					right={
						<div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
							{[
								{
									icon: <ShoppingBagIcon className="size-4" />,
									label: "Campaign",
									value: "Summer Sale 2024",
								},
								{
									icon: <CheckCircleIcon className="size-4" />,
									label: "Status",
									value: <Badge color="lime">Active</Badge>,
								},
								{
									icon: <CurrencyRupeeIcon className="size-4" />,
									label: "Budget",
									value: formatCurrency(50000),
								},
								{
									icon: <ClockIcon className="size-4" />,
									label: "Start Date",
									value: "Mar 1, 2026",
								},
								{
									icon: <UsersIcon className="size-4" />,
									label: "Created By",
									value: "Shivam Gupta",
								},
							].map((row, i, arr) => (
								<div
									key={row.label}
									className={`flex items-center gap-3 px-4 py-3 ${
										i < arr.length - 1 ? "border-b border-zinc-100 dark:border-zinc-800" : ""
									}`}
								>
									<span className="shrink-0 text-zinc-400">{row.icon}</span>
									<span className="flex-1 text-sm text-zinc-500 dark:text-zinc-400">{row.label}</span>
									<span className="text-sm font-medium text-zinc-900 dark:text-white">{row.value}</span>
								</div>
							))}
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Keep description-list.tsx.</strong> Semantically correct (&lt;dl&gt;/&lt;dt&gt;/&lt;dd&gt;),
					accessible, clean. Only 37 lines. Worth using on settings/detail pages where accessibility matters. The inline
					icon pattern is better for visual-heavy views.
				</VerdictBox>
			</DemoSection>

			{/* ─── 4. PAGINATION ───────────────────────────────────── */}
			<DemoSection
				id="audit-4"
				number={4}
				title="Pagination vs Load More"
				file="components/pagination.tsx"
				lines={98}
				verdict="remove"
			>
				<SideBySide
					leftLabel="pagination.tsx — traditional page numbers"
					rightLabel="Current — infinite scroll / load more button"
					left={
						<Pagination>
							<PaginationPrevious href={null} />
							<PaginationList>
								<PaginationPage href="?page=1">1</PaginationPage>
								<PaginationPage href="?page=2" current>
									2
								</PaginationPage>
								<PaginationPage href="?page=3">3</PaginationPage>
								<PaginationGap />
								<PaginationPage href="?page=10">10</PaginationPage>
							</PaginationList>
							<PaginationNext href="?page=3" />
						</Pagination>
					}
					right={
						<div className="space-y-4">
							<div className="space-y-2">
								{["Campaign Alpha", "Campaign Beta", "Campaign Gamma"].map((name) => (
									<div
										key={name}
										className="rounded-lg bg-white p-3 text-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
									>
										{name}
									</div>
								))}
							</div>
							<div className="flex justify-center">
								<Button plain>
									<ArrowTrendingUpIcon className="size-4" />
									Load More
								</Button>
							</div>
							<Text className="text-center text-xs">
								Or: TanStack Query's <code>keepPreviousData</code> + cursor-based pagination via the API
							</Text>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete pagination.tsx.</strong> The app uses cursor-based pagination with TanStack Query's
					keepPreviousData and load-more buttons. Traditional page-number pagination was never implemented.
				</VerdictBox>
			</DemoSection>

			{/* ─── 5. RADIO ────────────────────────────────────────── */}
			<DemoSection
				id="audit-5"
				number={5}
				title="Radio vs Select/Buttons"
				file="components/radio.tsx"
				lines={143}
				verdict="remove"
			>
				<SideBySide
					leftLabel="radio.tsx — Headless UI radio with color support"
					rightLabel="Current — Select dropdown or button groups"
					left={
						<RadioGroup value={radioValue} onChange={setRadioValue}>
							<Label>Notification method</Label>
							<Text className="text-sm text-zinc-500">How would you like to be notified?</Text>
							<div className="mt-3 space-y-3">
								<RadioField>
									<Radio value="email" color="emerald" />
									<Label>Email</Label>
								</RadioField>
								<RadioField>
									<Radio value="sms" color="emerald" />
									<Label>SMS</Label>
								</RadioField>
								<RadioField>
									<Radio value="push" color="emerald" />
									<Label>Push notification</Label>
								</RadioField>
							</div>
						</RadioGroup>
					}
					right={
						<Field>
							<Label>Notification method</Label>
							<Text className="text-sm text-zinc-500">How would you like to be notified?</Text>
							<Select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
								<option value="email">Email</option>
								<option value="sms">SMS</option>
								<option value="push">Push notification</option>
							</Select>
							<Text className="mt-2 text-xs">
								Forms use Select dropdowns or styled button groups instead of radio buttons.
							</Text>
						</Field>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete radio.tsx.</strong> 143 lines of complex CSS custom properties for radio buttons that
					are never used. All forms use Select dropdowns or styled button choices instead.
				</VerdictBox>
			</DemoSection>

			{/* ─── 6. LISTBOX vs SELECT ────────────────────────────── */}
			<DemoSection
				id="audit-6"
				number={6}
				title="Listbox vs Select"
				file="components/listbox.tsx"
				lines={176}
				verdict="remove"
			>
				<SideBySide
					leftLabel="listbox.tsx — anchored popover dropdown"
					rightLabel="select.tsx — native <select> with Headless UI"
					left={
						<Field className="space-y-3">
							<Label>Campaign Status</Label>
							<Listbox value={listboxValue} onChange={setListboxValue}>
								<ListboxOption value="active">
									<ListboxLabel>Active</ListboxLabel>
								</ListboxOption>
								<ListboxOption value="paused">
									<ListboxLabel>Paused</ListboxLabel>
								</ListboxOption>
								<ListboxOption value="ended">
									<ListboxLabel>Ended</ListboxLabel>
								</ListboxOption>
								<ListboxOption value="draft">
									<ListboxLabel>Draft</ListboxLabel>
								</ListboxOption>
							</Listbox>
							<Text className="text-xs">
								176 lines — anchored floating dropdown with check marks, transitions, custom styling.
							</Text>
						</Field>
					}
					right={
						<Field className="space-y-3">
							<Label>Campaign Status</Label>
							<Select value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
								<option value="active">Active</option>
								<option value="paused">Paused</option>
								<option value="ended">Ended</option>
								<option value="draft">Draft</option>
							</Select>
							<Text className="text-xs">70 lines — simpler, native, consistent with other form inputs.</Text>
						</Field>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete listbox.tsx.</strong> Select is simpler (70 vs 176 lines), uses the native dropdown,
					and is consistent with the app's other form inputs. Listbox was an alternative that was never adopted.
				</VerdictBox>
			</DemoSection>

			{/* ─── 7. TABLE ────────────────────────────────────────── */}
			<DemoSection
				id="audit-7"
				number={7}
				title="Table vs Card-based Layouts"
				file="components/table.tsx"
				lines={133}
				verdict="remove"
			>
				<SideBySide
					leftLabel="table.tsx — full <table> with striped/dense/grid"
					rightLabel="Current — card-based list items (mobile-first)"
					left={
						<Table striped>
							<TableHead>
								<TableRow>
									<TableHeader>Name</TableHeader>
									<TableHeader>Status</TableHeader>
									<TableHeader>Amount</TableHeader>
								</TableRow>
							</TableHead>
							<TableBody>
								{[
									{ name: "Summer Sale", status: "Active", amount: 50000 },
									{ name: "Winter Fest", status: "Draft", amount: 25000 },
									{ name: "Spring Launch", status: "Ended", amount: 75000 },
								].map((row) => (
									<TableRow key={row.name}>
										<TableCell className="font-medium">{row.name}</TableCell>
										<TableCell>
											<Badge color={getStatusColor(row.status.toLowerCase())}>{row.status}</Badge>
										</TableCell>
										<TableCell>{formatCurrency(row.amount)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					}
					right={
						<div className="space-y-2">
							{[
								{ name: "Summer Sale", status: "active", amount: 50000 },
								{ name: "Winter Fest", status: "draft", amount: 25000 },
								{ name: "Spring Launch", status: "ended", amount: 75000 },
							].map((item) => (
								<div
									key={item.name}
									className="flex items-center justify-between rounded-xl bg-white p-3 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
								>
									<div>
										<span className="text-sm font-medium text-zinc-900 dark:text-white">{item.name}</span>
										<div className="mt-1">
											<Badge color={getStatusColor(item.status)}>{formatStatus(item.status)}</Badge>
										</div>
									</div>
									<span className="text-sm font-semibold text-zinc-900 dark:text-white">
										{formatCurrency(item.amount)}
									</span>
								</div>
							))}
							<Text className="text-center text-xs">
								Card-based layouts work better on mobile. Where tables are needed, @tanstack/react-table is used
								directly.
							</Text>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete table.tsx.</strong> The app prefers card-based layouts for mobile-first design. Where
					actual tables are needed, @tanstack/react-table is used directly with custom rendering.
				</VerdictBox>
			</DemoSection>

			{/* ─── 8. VIRTUAL LIST ─────────────────────────────────── */}
			<DemoSection
				id="audit-8"
				number={8}
				title="VirtualList / VirtualGrid / VirtualTable"
				file="components/virtual-list.tsx"
				lines={378}
				verdict="remove"
			>
				<SideBySide
					leftLabel="virtual-list.tsx — @tanstack/react-virtual wrappers"
					rightLabel="Current — regular lists (data sets are small)"
					left={
						<div className="space-y-3">
							<Text className="text-xs">VirtualList rendering 100 items (only visible ones in DOM):</Text>
							<VirtualList
								items={Array.from({ length: 100 }, (_, i) => ({
									id: i,
									name: `Transaction #${1000 + i}`,
									amount: (i * 7919 + 1301) % 10000,
								}))}
								estimateSize={48}
								height={240}
								className="rounded-lg border border-zinc-200 dark:border-zinc-800"
								renderItem={(item) => (
									<div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-sm dark:border-zinc-800">
										<span className="text-zinc-900 dark:text-white">{item.name}</span>
										<span className="font-medium text-zinc-600 dark:text-zinc-400">{formatCurrency(item.amount)}</span>
									</div>
								)}
							/>
							<Text className="text-xs">378 lines: VirtualList + VirtualGrid + VirtualTable + useInfiniteScroll.</Text>
						</div>
					}
					right={
						<div className="space-y-3">
							<Text className="text-xs">Regular list — API returns 20-50 items per page max:</Text>
							<div className="max-h-60 space-y-1 overflow-auto rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
								{Array.from({ length: 20 }, (_, i) => (
									<div
										key={i}
										className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									>
										<span className="text-zinc-900 dark:text-white">Transaction #{1000 + i}</span>
										<span className="font-medium text-zinc-600 dark:text-zinc-400">
											{formatCurrency((i * 7919 + 1301) % 10000)}
										</span>
									</div>
								))}
							</div>
							<Text className="text-xs">Server-side pagination keeps lists short. No virtualization needed.</Text>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete virtual-list.tsx.</strong> At 378 lines, this is the largest dead file. The API
					returns paginated results (20-50 items), so virtualization is premature optimization. The entire
					VirtualList/VirtualGrid/VirtualTable suite is unused.
				</VerdictBox>
			</DemoSection>

			{/* ─── 9. PAGE HEADER ──────────────────────────────────── */}
			<DemoSection
				id="audit-9"
				number={9}
				title="PageHeader vs Inline Pattern"
				file="components/page-header.tsx"
				lines={568}
				verdict="remove"
			>
				<div className="space-y-8">
					{/* 9a: PageHeader — full-featured */}
					<div>
						<Subheading className="mb-4">9a. PageHeader component (live render)</Subheading>
						<SideBySide
							leftLabel="PageHeader with breadcrumbs, badge, actions"
							rightLabel="Current inline Heading + Text + Button"
							left={
								<div className="space-y-6">
									<PageHeader
										title="Campaigns"
										description="Manage your brand campaigns and track performance"
										badge={<Badge color="lime">12 Active</Badge>}
										actions={
											<>
												<Button plain>Export</Button>
												<Button color="emerald">Create Campaign</Button>
											</>
										}
									/>
								</div>
							}
							right={
								<div className="space-y-3">
									<div className="flex items-start justify-between gap-4">
										<div>
											<Heading>Campaigns</Heading>
											<Text className="mt-1">Manage your brand campaigns and track performance</Text>
										</div>
										<div className="flex items-center gap-2">
											<Button plain>Export</Button>
											<Button color="emerald">Create Campaign</Button>
										</div>
									</div>
								</div>
							}
						/>
					</div>

					{/* 9b: PageSection — card variant */}
					<div>
						<Subheading className="mb-4">9c. PageSection (card variant) + ContentCard</Subheading>
						<SideBySide
							leftLabel="PageSection with icon, title, description, card variant"
							rightLabel="Current — inline div + Subheading"
							left={
								<PageSection
									title="Campaign Analytics"
									description="Performance metrics for the last 30 days"
									icon={<ChartBarIcon className="size-5" />}
									actions={<Button plain>View All</Button>}
									variant="card"
								>
									<div className="grid grid-cols-2 gap-3">
										<ContentCard title="Impressions" icon={<EyeIcon className="size-4" />}>
											<div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">142K</div>
										</ContentCard>
										<ContentCard title="Conversions" icon={<ArrowTrendingUpIcon className="size-4" />}>
											<div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">3.2K</div>
										</ContentCard>
									</div>
								</PageSection>
							}
							right={
								<div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 sm:p-5">
									<div className="mb-4 flex items-start justify-between gap-4">
										<div>
											<Subheading>Campaign Analytics</Subheading>
											<Text className="mt-0.5 text-sm text-zinc-500">Performance metrics for the last 30 days</Text>
										</div>
										<Button plain>View All</Button>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
											<span className="text-xs font-medium text-zinc-500">Impressions</span>
											<div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">142K</div>
										</div>
										<div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
											<span className="text-xs font-medium text-zinc-500">Conversions</span>
											<div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">3.2K</div>
										</div>
									</div>
								</div>
							}
						/>
					</div>

					{/* 9d: PageSkeleton + CardSkeleton */}
					<div>
						<Subheading className="mb-4">9d. PageSkeleton + CardSkeleton (loading states)</Subheading>
						<div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/30 p-4 dark:border-red-800/30 dark:bg-red-950/10">
							<div className="mb-3 flex items-center gap-2">
								<AuditBadge type="dead" />
								<span className="text-sm font-medium text-zinc-500">Full-page loading skeleton</span>
							</div>
							<PageSkeleton showStats statsCount={4} showFilters showTable tableRows={3} />
						</div>
						<div className="mt-4 grid grid-cols-2 gap-3">
							<div>
								<Text className="mb-2 text-xs font-medium text-zinc-500">CardSkeleton</Text>
								<CardSkeleton />
							</div>
							<div>
								<Text className="mb-2 text-xs font-medium text-zinc-500">Another CardSkeleton</Text>
								<CardSkeleton />
							</div>
						</div>
						<Text className="mt-3 text-xs text-zinc-500">
							Current app uses inline shimmer divs or TanStack Query's pendingComponent instead of these skeleton
							components.
						</Text>
					</div>

					{/* 9e: PageLayout with full demo */}
					<div>
						<Subheading className="mb-4">9e. Full PageLayout demo (how it all composes)</Subheading>
						<div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50/30 p-4 dark:border-red-800/30 dark:bg-red-950/10">
							<div className="mb-3 flex items-center gap-2">
								<AuditBadge type="dead" />
								<span className="text-sm font-medium text-zinc-500">PageLayout wrapping multiple PageSections</span>
							</div>
							<PageLayout spacing="md">
								<PageHeader
									title="Wallet"
									description="Manage your funds and transactions"
									actions={<Button color="emerald">Withdraw</Button>}
								/>
								<PageSection title="Quick Stats" icon={<ChartBarIcon className="size-5" />}>
									<div className="grid grid-cols-3 gap-3">
										{[
											{ label: "Balance", value: formatCurrency(125000) },
											{ label: "Pending", value: formatCurrency(8500) },
											{ label: "Withdrawn", value: formatCurrency(340000) },
										].map((s) => (
											<div key={s.label} className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
												<div className="text-xs text-zinc-500">{s.label}</div>
												<div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">{s.value}</div>
											</div>
										))}
									</div>
								</PageSection>
								<PageSection title="Recent Transactions" actions={<Button plain>View All</Button>} variant="card">
									<div className="space-y-2">
										{["Campaign payout - Summer Sale", "Withdrawal to bank", "Campaign payout - Winter Fest"].map(
											(tx) => (
												<div
													key={tx}
													className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
												>
													<span className="text-zinc-900 dark:text-white">{tx}</span>
													<span className="text-zinc-500">{formatCurrency((tx.length * 7919 + 1301) % 15000)}</span>
												</div>
											)
										)}
									</div>
								</PageSection>
							</PageLayout>
						</div>
					</div>
				</div>

				<VerdictBox>
					<strong>Verdict: Upgraded &amp; adopted.</strong> page-header.tsx was upgraded from 12 → 25+ exports,
					absorbing the best of shared/section.tsx, shared/info-panel.tsx, shared/page-container.tsx, and
					shared/card.tsx. PageHeader and DetailPageHeader are now used on every list and detail page. ContentCard
					replaces Card from shared/card.tsx.
				</VerdictBox>
			</DemoSection>

			{/* ─── 10. INFO PANEL ──────────────────────────────────── */}
			<DemoSection
				id="audit-10"
				number={10}
				title="InfoPanel vs Inline Alerts"
				file="shared/info-panel.tsx"
				lines={371}
				verdict="keep"
			>
				<div className="space-y-8">
					<Subheading>InfoPanel — all 5 variants</Subheading>
					<div className="space-y-3">
						<InfoPanel variant="info" title="Verification Required">
							Your organization needs to complete KYC verification.
						</InfoPanel>
						<InfoPanel variant="warning" title="Budget Running Low">
							Campaign has used 85% of its budget.
						</InfoPanel>
						<InfoPanel
							variant="success"
							title="Withdrawal Processed"
							action={{ label: "View Details", onClick: () => {} }}
						>
							Your withdrawal of {formatCurrency(1500)} was processed.
						</InfoPanel>
						<InfoPanel variant="error" title="Payment Failed" onDismiss={() => {}}>
							Payment method was declined.
						</InfoPanel>
						<InfoPanel variant="neutral" title="No Active Campaigns">
							Create your first campaign to start.
						</InfoPanel>
					</div>

					<Subheading>AlertBanner — prominent page-level alerts</Subheading>
					<div className="space-y-3">
						<AlertBanner
							variant="warning"
							title="Organization Pending Approval"
							description="Your organization is under review."
							action={{ label: "Check Status", onClick: () => {} }}
						/>
						<AlertBanner
							variant="success"
							title="Campaign Published"
							description="Summer Sale 2024 is now live."
							onDismiss={() => {}}
						/>
					</div>

					<Subheading>TipBox + ActionLink</Subheading>
					<TipBox>Pro tip: Set your campaign budget to at least 2x your expected enrollment cost.</TipBox>
					<div className="mt-3 space-y-3">
						<ActionLink
							title="Complete KYC Verification"
							description="Required before you can make withdrawals"
							icon={<ShieldExclamationIcon className="size-5" />}
							variant="warning"
							onClick={() => {}}
						/>
						<ActionLink
							title="Set Up Notifications"
							description="Get alerts when enrollments are submitted"
							icon={<BellAlertIcon className="size-5" />}
							onClick={() => {}}
						/>
					</div>

					<Subheading>Current inline approach (what pages actually do)</Subheading>
					<div className="space-y-3">
						<div className="flex items-start gap-2.5 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
							<InformationCircleIcon className="mt-0.5 size-4 shrink-0 text-blue-500" />
							<p className="text-sm text-blue-700 dark:text-blue-300">
								Your organization needs to complete KYC verification.
							</p>
						</div>
						<div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/30">
							<ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
							<p className="text-sm text-amber-700 dark:text-amber-300">Campaign has used 85% of its budget.</p>
						</div>
					</div>
				</div>
				<VerdictBox>
					<strong>Verdict: Keep info-panel.tsx.</strong> InfoPanel is <em>significantly better</em> than inline
					approach:
					<ul className="mt-2 list-inside list-disc space-y-1">
						<li>
							<strong>InfoPanel:</strong> 1 line of JSX, consistent styling, title, actions, dismiss
						</li>
						<li>
							<strong>Inline:</strong> 5+ lines copied everywhere, easy to get colors wrong
						</li>
						<li>
							<strong>AlertBanner:</strong> Great for page-level prominent alerts
						</li>
						<li>
							<strong>TipBox + ActionLink:</strong> Perfect for onboarding flows
						</li>
					</ul>
					<p className="mt-2 font-medium">Recommendation: InfoPanel should be ADOPTED across all pages.</p>
				</VerdictBox>
			</DemoSection>

			{/* ─── 11. PAGE CONTAINER ─────────────────────────────── */}
			<DemoSection
				id="audit-13"
				number={13}
				title="PageContainer / TwoColumnLayout / ContentGrid"
				file="shared/page-container.tsx"
				lines={201}
				verdict="remove"
			>
				<SideBySide
					leftLabel="page-container.tsx — max-width wrappers, grid layouts"
					rightLabel="Current — SidebarLayout handles width, pages use space-y"
					left={
						<div className="space-y-3">
							<div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
								<code className="text-xs text-zinc-600 dark:text-zinc-400">
									<pre className="whitespace-pre-wrap">
										{`<PageContainer maxWidth="6xl">
  <TwoColumnLayout split="7/5">
    <div>Main content</div>
    <div>Sidebar</div>
  </TwoColumnLayout>
</PageContainer>`}
									</pre>
								</code>
							</div>
							<Text className="text-xs">
								201 lines: PageContainer, PageSection, ContentGrid, GridItem, TwoColumnLayout. Adds max-width wrappers
								that conflict with SidebarLayout.
							</Text>
						</div>
					}
					right={
						<div className="space-y-3">
							<div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
								<code className="text-xs text-zinc-600 dark:text-zinc-400">
									<pre className="whitespace-pre-wrap">
										{`<div className="space-y-6 pb-20">
  {/* Header */}
  {/* Stats */}
  {/* Content */}
</div>`}
									</pre>
								</code>
							</div>
							<Text className="text-xs">
								SidebarLayout already handles width. Pages just use <code>space-y-6 pb-20</code> — no wrapper needed.
								Documented in MEMORY.md: "App pages do NOT use mx-auto max-w-* wrappers."
							</Text>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete page-container.tsx.</strong> The SidebarLayout handles page width. Adding
					PageContainer's max-width wrappers would double-constrain content. TwoColumnLayout and ContentGrid are
					one-liners in Tailwind when needed.
				</VerdictBox>
			</DemoSection>

			{/* ─── 14. THEME.TS ────────────────────────────────────── */}
			<DemoSection
				id="audit-14"
				number={14}
				title="theme.ts vs design-tokens.ts"
				file="lib/theme.ts"
				lines={387}
				verdict="remove"
			>
				<SideBySide
					leftLabel="theme.ts — status colors, semantic colors, badge/button maps"
					rightLabel="design-tokens.ts — getStatusColor(), formatStatus()"
					left={
						<div className="space-y-4">
							<Text className="text-xs">
								387 lines — StatusColorConfig with text/bg/icon/border for each status, plus semantic colors, money
								colors, trend colors, surface colors, text colors, border colors, badge colors...
							</Text>
							<div className="space-y-2">
								{(["approved", "awaiting_review", "rejected", "cancelled"] as const).map((status) => {
									const colors = themeStatusColors[status];
									return (
										<div key={status} className={`flex items-center gap-3 rounded-lg p-2.5 ${colors.bg}`}>
											<span className={`text-sm font-medium ${colors.text}`}>{status.replace(/_/g, " ")}</span>
										</div>
									);
								})}
							</div>
						</div>
					}
					right={
						<div className="space-y-4">
							<Text className="text-xs">
								design-tokens.ts — single <code>getStatusColor()</code> returns a Badge color. Plus{" "}
								<code>formatStatus()</code>, <code>formatCurrency()</code>, etc.
							</Text>
							<div className="space-y-2">
								{["approved", "awaiting_review", "rejected", "cancelled"].map((status) => (
									<div
										key={status}
										className="flex items-center gap-3 rounded-lg bg-white p-2.5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
									>
										<Badge color={getStatusColor(status)}>{formatStatus(status)}</Badge>
									</div>
								))}
							</div>
							<Text className="text-xs">
								Simpler approach: Badge + getStatusColor() handles all status display. No need for separate
								text/bg/icon/border configs.
							</Text>
						</div>
					}
				/>
				<VerdictBox>
					<strong>Verdict: Delete theme.ts.</strong> 387 lines of duplicate functionality. design-tokens.ts has
					getStatusColor() + formatStatus() which combine with the Badge component to handle all status display needs.
					theme.ts also exports semanticColors, moneyColors, surfaceColors, textColors, borderColors — none of which are
					imported anywhere.
				</VerdictBox>
			</DemoSection>

			{/* ═══════════════════════════════════════════════════════ */}
			{/* FINAL SUMMARY                                         */}
			{/* ═══════════════════════════════════════════════════════ */}

			<div className="rounded-2xl border-2 border-zinc-900 bg-zinc-900 p-6 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900">
				<div className="flex items-center gap-3">
					<PaintBrushIcon className="size-6" />
					<h2 className="text-xl font-bold">Cleanup Summary</h2>
				</div>
				<div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
					<div>
						<div className="text-3xl font-bold">{removeCount}</div>
						<div className="text-sm opacity-75">Files to delete</div>
					</div>
					<div>
						<div className="text-3xl font-bold">{removeLines.toLocaleString()}</div>
						<div className="text-sm opacity-75">Lines removed</div>
					</div>
					<div>
						<div className="text-3xl font-bold">{keepCount}</div>
						<div className="text-sm opacity-75">Files to adopt</div>
					</div>
					<div>
						<div className="text-3xl font-bold">{auditItems.length}</div>
						<div className="text-sm opacity-75">Total audited</div>
					</div>
				</div>
				<div className="mt-6 space-y-2 text-sm opacity-90">
					<p>
						<strong>Delete:</strong> stat, alert, pagination, radio, listbox, table, virtual-list, page-header, section,
						stats-row, page-container, theme.ts
					</p>
					<p>
						<strong>Keep + Adopt:</strong> description-list.tsx (semantic, accessible), info-panel.tsx (far better than
						inline alerts)
					</p>
				</div>
			</div>
		</div>
	);
}
