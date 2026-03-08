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
  // Revoke after a delay — the browser needs time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Download a base64-encoded file with a given content type.
 */
export function downloadBase64(base64Data: string, filename: string, contentType: string): void {
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: contentType });
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
