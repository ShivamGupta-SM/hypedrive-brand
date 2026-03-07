import { FinancialStatsGridBordered } from "@/components/shared/financial-stats-grid";
import { Skeleton } from "@/components/skeleton";

export function LoadingSkeleton() {
	return (
		<div className="space-y-4 sm:space-y-6 animate-fade-in">
			{/* Header Card */}
			<div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:p-6 dark:bg-zinc-900 dark:ring-zinc-800">
				{/* Breadcrumb + Actions row */}
				<div className="mb-4 flex items-center justify-between gap-4">
					<div className="flex items-center gap-2">
						<Skeleton width={80} height={14} borderRadius={6} />
						<Skeleton width={10} height={14} borderRadius={2} />
						<Skeleton width={120} height={14} borderRadius={6} />
					</div>
					<div className="flex gap-2">
						<Skeleton width={36} height={36} borderRadius={8} className="sm:hidden" />
						<Skeleton width={90} height={36} borderRadius={8} className="hidden sm:block" />
						<Skeleton width={90} height={36} borderRadius={8} className="hidden sm:block" />
					</div>
				</div>
				{/* Title + badges */}
				<div className="flex flex-wrap items-center gap-2.5">
					<Skeleton width={220} height={26} borderRadius={8} />
					<Skeleton width={65} height={22} borderRadius={12} />
					<Skeleton width={65} height={22} borderRadius={12} />
				</div>
				{/* Description */}
				<Skeleton width="70%" height={16} borderRadius={6} className="mt-1.5" />
				{/* Meta info */}
				<div className="mt-3 flex gap-4">
					<Skeleton width={100} height={16} borderRadius={6} />
					<Skeleton width={170} height={16} borderRadius={6} />
					<Skeleton width={70} height={16} borderRadius={6} />
				</div>
			</div>

			{/* Tabs */}
			<div className="flex gap-1 sm:gap-1.5">
				<Skeleton width={90} height={32} borderRadius={999} />
				<Skeleton width={100} height={32} borderRadius={999} />
				<Skeleton width={70} height={32} borderRadius={999} />
			</div>

			{/* Stats */}
			<FinancialStatsGridBordered
				stats={[
					{ name: "Order Value", value: "" },
					{ name: "Avg. Order", value: "" },
					{ name: "Enrollments", value: "" },
					{ name: "Approved", value: "" },
					{ name: "Pending", value: "" },
				]}
				loading
				columns={5}
			/>

			{/* Progress Card */}
			<div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
				<div className="grid sm:grid-cols-2">
					{[1, 2].map((i) => (
						<div key={i} className="p-3.5 sm:p-4">
							<div className="mb-2.5 flex items-center justify-between">
								<Skeleton width={110} height={14} borderRadius={6} />
								<Skeleton width={50} height={14} borderRadius={6} />
							</div>
							<Skeleton width="100%" height={8} borderRadius={4} />
							<div className="mt-2 flex gap-3">
								<Skeleton width={60} height={10} borderRadius={4} />
								<Skeleton width={60} height={10} borderRadius={4} />
								<Skeleton width={60} height={10} borderRadius={4} />
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Content Grid */}
			<div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
				<div className="space-y-4 sm:space-y-5">
					<Skeleton width="100%" height={52} borderRadius={12} />
					<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
						{[1, 2, 3, 4].map((i) => (
							<Skeleton key={i} width="100%" height={120} borderRadius={12} />
						))}
					</div>
				</div>
				<div className="space-y-4 sm:space-y-5">
					{[1, 2].map((i) => (
						<div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800">
							<div className="border-b border-zinc-200 px-3.5 py-2.5 sm:px-4 sm:py-3 dark:border-zinc-700">
								<Skeleton width={100 + i * 20} height={16} />
							</div>
							<div className="space-y-2 p-3.5 sm:p-4">
								{[1, 2, 3, 4].map((j) => (
									<Skeleton key={j} width="100%" height={32} borderRadius={6} />
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
