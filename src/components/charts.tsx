/**
 * Charts - Themed wrapper components for Recharts
 * Provides chart components with Catalyst theme integration
 */

import clsx from "clsx";
import {
	Area,
	Bar,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	Pie,
	AreaChart as RechartsAreaChart,
	BarChart as RechartsBarChart,
	LineChart as RechartsLineChart,
	PieChart as RechartsPieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

// =============================================================================
// THEME COLORS
// =============================================================================

export const chartColors = {
	primary: "rgb(59 130 246)", // blue-500
	secondary: "rgb(14 165 233)", // sky-500
	success: "rgb(34 197 94)", // green-500
	warning: "rgb(245 158 11)", // amber-500
	danger: "rgb(239 68 68)", // red-500
	info: "rgb(14 165 233)", // sky-500
	zinc: "rgb(113 113 122)", // zinc-500
};

export const chartColorPalette = [
	chartColors.primary,
	chartColors.secondary,
	chartColors.success,
	chartColors.warning,
	chartColors.danger,
	chartColors.info,
	chartColors.zinc,
	"rgb(236 72 153)", // pink-500
	"rgb(20 184 166)", // teal-500
	"rgb(249 115 22)", // orange-500
];

// =============================================================================
// CUSTOM TOOLTIP
// =============================================================================

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{ name?: string; value?: number | string; color?: string }>;
	label?: string;
	isDark?: boolean;
}

function CustomTooltip({ active, payload, label, isDark }: CustomTooltipProps) {
	if (!active || !payload?.length) return null;

	return (
		<div
			className={clsx(
				"rounded-lg border px-3 py-2 shadow-lg",
				isDark ? "border-zinc-700 bg-zinc-800 text-white" : "border-zinc-200 bg-white text-zinc-900"
			)}
		>
			<p className="mb-1 text-sm font-medium">{label}</p>
			{payload.map((item: { name?: string; value?: number | string; color?: string }) => (
				<p key={item.name || item.value} className="text-sm" style={{ color: item.color }}>
					{item.name}: {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
				</p>
			))}
		</div>
	);
}

// =============================================================================
// LINE CHART
// =============================================================================

export interface LineChartData {
	[key: string]: string | number;
}

export interface LineChartSeries {
	dataKey: string;
	name?: string;
	color?: string;
	strokeWidth?: number;
	dot?: boolean;
}

export interface LineChartProps {
	data: LineChartData[];
	series: LineChartSeries[];
	xAxisKey: string;
	height?: number;
	className?: string;
	showGrid?: boolean;
	showLegend?: boolean;
	showTooltip?: boolean;
	curved?: boolean;
}

export function LineChart({
	data,
	series,
	xAxisKey,
	height = 300,
	className,
	showGrid = true,
	showLegend = false,
	showTooltip = true,
	curved = true,
}: LineChartProps) {
	const isDark =
		typeof document !== "undefined" && document.documentElement.classList.contains("dark");

	return (
		<div className={clsx("w-full min-w-0", className)} style={{ height, minHeight: height }}>
			<ResponsiveContainer width="100%" height={height} debounce={50}>
				<RechartsLineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
					{showGrid && (
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={isDark ? "rgb(63 63 70)" : "rgb(228 228 231)"}
							vertical={false}
						/>
					)}
					<XAxis
						dataKey={xAxisKey}
						stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
						fontSize={12}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)}
					/>
					{showTooltip && <Tooltip content={<CustomTooltip isDark={isDark} />} />}
					{showLegend && <Legend />}
					{series.map((s, index) => (
						<Line
							key={s.dataKey}
							type={curved ? "monotone" : "linear"}
							dataKey={s.dataKey}
							name={s.name || s.dataKey}
							stroke={s.color || chartColorPalette[index % chartColorPalette.length]}
							strokeWidth={s.strokeWidth || 2}
							dot={s.dot ?? false}
							activeDot={{ r: 6 }}
						/>
					))}
				</RechartsLineChart>
			</ResponsiveContainer>
		</div>
	);
}

// =============================================================================
// AREA CHART
// =============================================================================

export interface AreaChartProps {
	data: LineChartData[];
	series: LineChartSeries[];
	xAxisKey: string;
	height?: number;
	className?: string;
	showGrid?: boolean;
	showLegend?: boolean;
	showTooltip?: boolean;
	stacked?: boolean;
	gradient?: boolean;
}

export function AreaChart({
	data,
	series,
	xAxisKey,
	height = 300,
	className,
	showGrid = true,
	showLegend = false,
	showTooltip = true,
	stacked = false,
	gradient = true,
}: AreaChartProps) {
	const isDark =
		typeof document !== "undefined" && document.documentElement.classList.contains("dark");

	return (
		<div className={clsx("w-full min-w-0", className)} style={{ height, minHeight: height }}>
			<ResponsiveContainer width="100%" height={height} debounce={50}>
				<RechartsAreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
					<defs>
						{series.map((s, index) => {
							const color = s.color || chartColorPalette[index % chartColorPalette.length];
							return (
								<linearGradient
									key={s.dataKey}
									id={`gradient-${s.dataKey}`}
									x1="0"
									y1="0"
									x2="0"
									y2="1"
								>
									<stop offset="5%" stopColor={color} stopOpacity={0.3} />
									<stop offset="95%" stopColor={color} stopOpacity={0} />
								</linearGradient>
							);
						})}
					</defs>
					{showGrid && (
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={isDark ? "rgb(63 63 70)" : "rgb(228 228 231)"}
							vertical={false}
						/>
					)}
					<XAxis
						dataKey={xAxisKey}
						stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
						fontSize={12}
						tickLine={false}
						axisLine={false}
					/>
					<YAxis
						stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
						fontSize={12}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => (typeof value === "number" ? value.toLocaleString() : value)}
					/>
					{showTooltip && <Tooltip content={<CustomTooltip isDark={isDark} />} />}
					{showLegend && <Legend />}
					{series.map((s, index) => {
						const color = s.color || chartColorPalette[index % chartColorPalette.length];
						return (
							<Area
								key={s.dataKey}
								type="monotone"
								dataKey={s.dataKey}
								name={s.name || s.dataKey}
								stroke={color}
								strokeWidth={s.strokeWidth || 2}
								fill={gradient ? `url(#gradient-${s.dataKey})` : color}
								fillOpacity={gradient ? 1 : 0.2}
								stackId={stacked ? "stack" : undefined}
							/>
						);
					})}
				</RechartsAreaChart>
			</ResponsiveContainer>
		</div>
	);
}

// =============================================================================
// BAR CHART
// =============================================================================

export interface BarChartProps {
	data: LineChartData[];
	series: LineChartSeries[];
	xAxisKey: string;
	height?: number;
	className?: string;
	showGrid?: boolean;
	showLegend?: boolean;
	showTooltip?: boolean;
	stacked?: boolean;
	horizontal?: boolean;
	barSize?: number;
}

export function BarChart({
	data,
	series,
	xAxisKey,
	height = 300,
	className,
	showGrid = true,
	showLegend = false,
	showTooltip = true,
	stacked = false,
	horizontal = false,
	barSize = 20,
}: BarChartProps) {
	const isDark =
		typeof document !== "undefined" && document.documentElement.classList.contains("dark");

	return (
		<div className={clsx("w-full min-w-0", className)} style={{ height, minHeight: height }}>
			<ResponsiveContainer width="100%" height={height} debounce={50}>
				<RechartsBarChart
					data={data}
					layout={horizontal ? "vertical" : "horizontal"}
					margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
				>
					{showGrid && (
						<CartesianGrid
							strokeDasharray="3 3"
							stroke={isDark ? "rgb(63 63 70)" : "rgb(228 228 231)"}
							horizontal={!horizontal}
							vertical={horizontal}
						/>
					)}
					{horizontal ? (
						<>
							<XAxis
								type="number"
								stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								type="category"
								dataKey={xAxisKey}
								stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
								fontSize={12}
								tickLine={false}
								axisLine={false}
								width={80}
							/>
						</>
					) : (
						<>
							<XAxis
								dataKey={xAxisKey}
								stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
								fontSize={12}
								tickLine={false}
								axisLine={false}
							/>
							<YAxis
								stroke={isDark ? "rgb(161 161 170)" : "rgb(113 113 122)"}
								fontSize={12}
								tickLine={false}
								axisLine={false}
								tickFormatter={(value) =>
									typeof value === "number" ? value.toLocaleString() : value
								}
							/>
						</>
					)}
					{showTooltip && <Tooltip content={<CustomTooltip isDark={isDark} />} />}
					{showLegend && <Legend />}
					{series.map((s, index) => (
						<Bar
							key={s.dataKey}
							dataKey={s.dataKey}
							name={s.name || s.dataKey}
							fill={s.color || chartColorPalette[index % chartColorPalette.length]}
							stackId={stacked ? "stack" : undefined}
							barSize={barSize}
							radius={[4, 4, 0, 0]}
						/>
					))}
				</RechartsBarChart>
			</ResponsiveContainer>
		</div>
	);
}

// =============================================================================
// PIE CHART
// =============================================================================

export interface PieChartData {
	name: string;
	value: number;
	color?: string;
}

export interface PieChartProps {
	data: PieChartData[];
	height?: number;
	className?: string;
	showLegend?: boolean;
	showTooltip?: boolean;
	innerRadius?: number;
	outerRadius?: number;
	label?: boolean;
}

export function PieChart({
	data,
	height = 300,
	className,
	showLegend = true,
	showTooltip = true,
	innerRadius = 0,
	outerRadius = 80,
	label = false,
}: PieChartProps) {
	const isDark =
		typeof document !== "undefined" && document.documentElement.classList.contains("dark");

	return (
		<div className={clsx("w-full min-w-0", className)} style={{ height, minHeight: height }}>
			<ResponsiveContainer width="100%" height={height} debounce={50}>
				<RechartsPieChart>
					{showTooltip && <Tooltip content={<CustomTooltip isDark={isDark} />} />}
					{showLegend && <Legend />}
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						innerRadius={innerRadius}
						outerRadius={outerRadius}
						paddingAngle={2}
						dataKey="value"
						label={
							label
								? ({ name, percent }: { name?: string; percent?: number }) =>
										`${name} ${((percent ?? 0) * 100).toFixed(0)}%`
								: false
						}
						labelLine={label}
					>
						{data.map((entry) => (
							<Cell
								key={entry.name}
								fill={
									entry.color || chartColorPalette[data.indexOf(entry) % chartColorPalette.length]
								}
							/>
						))}
					</Pie>
				</RechartsPieChart>
			</ResponsiveContainer>
		</div>
	);
}

// =============================================================================
// DONUT CHART (Alias for PieChart with innerRadius)
// =============================================================================

export interface DonutChartProps extends Omit<PieChartProps, "innerRadius"> {
	thickness?: number;
}

export function DonutChart({ thickness = 20, outerRadius = 80, ...props }: DonutChartProps) {
	return <PieChart innerRadius={outerRadius - thickness} outerRadius={outerRadius} {...props} />;
}

// =============================================================================
// SPARKLINE
// =============================================================================

export interface SparklineProps {
	data: number[];
	width?: number;
	height?: number;
	color?: string;
	className?: string;
	showArea?: boolean;
}

export function Sparkline({
	data,
	width = 100,
	height = 30,
	color = chartColors.primary,
	className,
	showArea = true,
}: SparklineProps) {
	const chartData = data.map((value, index) => ({ value, index }));

	return (
		<div
			className={clsx("min-w-0", className)}
			style={{ width, height, minWidth: width, minHeight: height }}
		>
			<ResponsiveContainer width={width} height={height} debounce={50}>
				{showArea ? (
					<RechartsAreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
						<defs>
							<linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={color} stopOpacity={0.3} />
								<stop offset="95%" stopColor={color} stopOpacity={0} />
							</linearGradient>
						</defs>
						<Area
							type="monotone"
							dataKey="value"
							stroke={color}
							strokeWidth={1.5}
							fill="url(#sparkline-gradient)"
						/>
					</RechartsAreaChart>
				) : (
					<RechartsLineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
						<Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
					</RechartsLineChart>
				)}
			</ResponsiveContainer>
		</div>
	);
}

// Re-export recharts components for advanced usage
export {
	ResponsiveContainer,
	LineChart as RechartsLine,
	AreaChart as RechartsArea,
	BarChart as RechartsBar,
	PieChart as RechartsPie,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	Line,
	Area,
	Bar,
	Pie,
	Cell,
};
