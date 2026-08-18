import { createWorker } from "tesseract.js";
// heic-convert ships no types and is CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const convertHeic = require("heic-convert") as (opts: {
  buffer: Buffer;
  format: "JPEG" | "PNG";
  quality?: number;
}) => Promise<ArrayBuffer>;

// iPhones default to HEIC, which Tesseract's image decoder (Leptonica) can't
// read directly. Try OCR as-is first; if that fails (HEIC or any other
// format Leptonica rejects), convert to JPEG and retry once before giving up.
export async function ocrImageToText(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");

  try {
    try {
      const { data } = await worker.recognize(buffer);
      return data.text;
    } catch {
      const converted = Buffer.from(await convertHeic({ buffer, format: "JPEG", quality: 0.92 }));
      const { data } = await worker.recognize(converted);
      return data.text;
    }
  } catch {
    throw new Error(
      "Couldn't read this image file. Try exporting it as a JPEG or PNG and uploading again.",
    );
  } finally {
    await worker.terminate();
  }
}
