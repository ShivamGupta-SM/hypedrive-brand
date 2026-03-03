/**
 * Trigger a browser download for a CSV file.
 */
export function downloadCSV(headers: string[], rows: (string | number)[][], filename: string): void {
	const csvContent = [
		headers.join(","),
		...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
	].join("\n");

	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
	link.click();
	URL.revokeObjectURL(url);
}
