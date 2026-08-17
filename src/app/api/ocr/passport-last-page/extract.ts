// The Indian passport's last (address) page has no machine-readable zone —
// it's plain printed labels and values, so extraction is heuristic label
// matching on OCR text rather than a standardized parse like MRZ.

const STOP_PATTERNS: RegExp[] = [
  /name\s+of\s+(father|mother|spouse)/i,
  /^address/i,
  /old\s+passport/i,
  /file\s+no/i,
  /place\s+of\s+issue/i,
];

function findValueAfterLabel(lines: string[], labelPattern: RegExp): string | null {
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(labelPattern);
    if (!match) continue;

    const sameLine = lines[i].slice((match.index ?? 0) + match[0].length).replace(/^[:\-\s]+/, "").trim();
    if (sameLine) return sameLine;

    const collected: string[] = [];
    for (let j = i + 1; j < lines.length && collected.length < 3; j++) {
      if (STOP_PATTERNS.some((stop) => stop.test(lines[j]))) break;
      if (lines[j]) collected.push(lines[j]);
    }
    return collected.length > 0 ? collected.join(", ") : null;
  }
  return null;
}

export function extractLastPageFields(rawText: string) {
  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    address: findValueAfterLabel(lines, /^address/i),
    father_name: findValueAfterLabel(lines, /name\s+of\s+father(\s*\/\s*legal\s+guardian)?/i),
    mother_name: findValueAfterLabel(lines, /name\s+of\s+mother/i),
    spouse_name: findValueAfterLabel(lines, /name\s+of\s+spouse/i),
  };
}
