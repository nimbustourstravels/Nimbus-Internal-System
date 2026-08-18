import { NextRequest, NextResponse } from "next/server";
import { ocrImageToText } from "@/lib/ocr-image";
import { extractLastPageFields } from "./extract";

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

  const fields = extractLastPageFields(text);

  if (!fields.address && !fields.father_name && !fields.mother_name && !fields.spouse_name) {
    return NextResponse.json(
      {
        error:
          "Couldn't find any recognizable fields on this page. Make sure it's the address/last page and the photo is clear.",
      },
      { status: 422 },
    );
  }

  return NextResponse.json(fields);
}
