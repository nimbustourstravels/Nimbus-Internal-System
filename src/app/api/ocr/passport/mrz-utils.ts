// Isolates the two 44-character MRZ lines from raw OCR text of a passport photo page.
export function extractMrzLines(rawText: string): string[] {
  const candidates = rawText
    .split("\n")
    .map((line) => line.trim().toUpperCase().replace(/\s+/g, ""))
    .filter((line) => line.length >= 30 && /^[A-Z0-9<]+$/.test(line));

  return candidates.slice(-2).map((line) => line.padEnd(44, "<").slice(0, 44));
}

// MRZ dates are YYMMDD with no century. Birth dates must be in the past;
// expiry dates on a document scanned today are always in the 2000s.
export function mrzDateToISO(
  value: string | null | undefined,
  mode: "past" | "future",
): string | null {
  if (!value || !/^\d{6}$/.test(value)) return null;

  const yy = value.slice(0, 2);
  const mm = value.slice(2, 4);
  const dd = value.slice(4, 6);

  let year = 2000 + Number(yy);

  if (mode === "past" && new Date(`${year}-${mm}-${dd}`).getTime() > Date.now()) {
    year = 1900 + Number(yy);
  }

  return `${year}-${mm}-${dd}`;
}
