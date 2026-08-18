import { createWorker } from "tesseract.js";
import jpeg from "jpeg-js";
import { PNG } from "pngjs";
import { rotateJpegBuffer } from "./image-rotate";

// heic-convert ships no types and is CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const convertHeic = require("heic-convert") as (opts: {
  buffer: Buffer;
  format: "JPEG" | "PNG";
  quality?: number;
}) => Promise<ArrayBuffer>;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8]);

async function toJpegBuffer(buffer: Buffer): Promise<Buffer> {
  if (buffer.subarray(0, 2).equals(JPEG_MAGIC)) {
    return buffer;
  }

  if (buffer.subarray(0, 4).equals(PNG_MAGIC)) {
    const png = PNG.sync.read(buffer);
    return jpeg.encode({ data: png.data, width: png.width, height: png.height }, 90).data;
  }

  // Anything else (HEIC and its HEIF-family variants) — the common case
  // being an unconverted iPhone photo.
  const converted = await convertHeic({ buffer, format: "JPEG", quality: 0.92 });
  return Buffer.from(converted);
}

// Phone photos frequently lose their EXIF orientation in HEIC conversion,
// leaving the raw sensor buffer (always landscape) with no indication the
// photo was actually taken in portrait. Reading it as-is produces gibberish,
// so we OCR all 4 rotations and keep whichever Tesseract is most confident
// about, stopping early once confidence is clearly good enough.
export async function ocrImageToText(buffer: Buffer): Promise<string> {
  let jpegBuffer: Buffer;
  try {
    jpegBuffer = await toJpegBuffer(buffer);
  } catch {
    throw new Error(
      "Couldn't read this image file. Try exporting it as a JPEG or PNG and uploading again.",
    );
  }

  const worker = await createWorker("eng");
  try {
    const rotations = [0, 90, 270, 180] as const;
    let best: { text: string; confidence: number } | null = null;

    for (const degrees of rotations) {
      let candidate: Buffer;
      try {
        candidate = degrees === 0 ? jpegBuffer : rotateJpegBuffer(jpegBuffer, degrees);
      } catch {
        continue;
      }

      try {
        const { data } = await worker.recognize(candidate);
        if (!best || data.confidence > best.confidence) {
          best = { text: data.text, confidence: data.confidence };
        }
        if (data.confidence >= 75) break;
      } catch {
        // Try the next rotation.
      }
    }

    if (!best) {
      throw new Error("unreadable");
    }
    return best.text;
  } catch {
    throw new Error(
      "Couldn't read this image file. Try exporting it as a JPEG or PNG and uploading again.",
    );
  } finally {
    await worker.terminate();
  }
}
