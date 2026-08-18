import { NextRequest, NextResponse } from "next/server";
import { parse } from "mrz";
import { ocrImageToText } from "@/lib/ocr-image";
import { extractMrzLines, mrzDateToISO } from "./mrz-utils";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text: string;
  try {
    text = await ocrImageToText(buffer);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not read this image." },
      { status: 422 },
    );
  }

  const mrzLines = extractMrzLines(text);
  if (mrzLines.length < 2) {
    return NextResponse.json(
      {
        error:
          "Couldn't find the machine-readable zone (the two lines of text at the bottom of the passport photo page). Try a clearer, well-lit, straight-on photo.",
      },
      { status: 422 },
    );
  }

  let parsed;
  try {
    parsed = parse(mrzLines);
  } catch {
    return NextResponse.json(
      { error: "Found text at the bottom of the image but couldn't read it as a passport MRZ." },
      { status: 422 },
    );
  }

  const { fields } = parsed;
  const fullName = [fields.firstName, fields.lastName].filter(Boolean).join(" ").trim();

  return NextResponse.json({
    full_name: fullName || null,
    nationality: fields.nationality ?? null,
    dob: mrzDateToISO(fields.birthDate, "past"),
    passport_number: fields.documentNumber ?? parsed.documentNumber ?? null,
    passport_expiry: mrzDateToISO(fields.expirationDate, "future"),
    valid: parsed.valid,
  });
}
