/** UTF-8 BOM — ensures Excel opens CSV with correct encoding (₹, accented chars). */
const CSV_BOM = "\uFEFF";

/**
 * Sanitize a cell value to prevent CSV injection (formula injection).
 * Excel/Sheets execute formulas starting with = + - @ \t \r even inside quotes.
 */
function sanitizeCell(value: string): string {
	if (value.length > 0 && /^[=+\-@\t\r]/.test(value)) {
		return `'${value}`;
	}
	return value;
}

/**
 * Trigger a browser file download via a temporary anchor element.
 */
function triggerDownload(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Build and download a CSV file from headers + rows.
 * - RFC 4180 compliant (all cells quoted, double-quotes escaped)
 * - CSV injection sanitized
 * - UTF-8 BOM for Excel compatibility
 */
export function downloadCSV(headers: string[], rows: (string | number)[][], filename: string): void {
	const quote = (cell: string) => `"${cell.replace(/"/g, '""')}"`;
	const safeQuote = (cell: string | number) => quote(sanitizeCell(String(cell)));

	const csvContent = CSV_BOM + [
		headers.map((h) => quote(String(h))).join(","),
		...rows.map((row) => row.map(safeQuote).join(",")),
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	triggerDownload(blob, `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
}

/**
 * Download a pre-built CSV string (e.g., from a backend export endpoint).
 * Backend already includes BOM + sanitization, so we pass through as-is.
 */
export function downloadCSVString(csv: string, filename: string): void {
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	triggerDownload(blob, filename);
}

/**
 * Download a base64-encoded XLSX file from a backend export endpoint.
 */
export function downloadExcel(base64Data: string, filename: string): void {
	const binaryStr = atob(base64Data);
	const bytes = new Uint8Array(binaryStr.length);
	for (let i = 0; i < binaryStr.length; i++) {
		bytes[i] = binaryStr.charCodeAt(i);
	}
	const blob = new Blob([bytes], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	triggerDownload(blob, filename);
}
