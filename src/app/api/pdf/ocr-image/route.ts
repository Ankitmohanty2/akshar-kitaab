import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "extracted_text.txt";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Perform OCR using tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      buffer,
      "eng",
      { logger: (m) => console.log(m) }
    );

    const finalOutputName = outputName.toLowerCase().endsWith(".txt") 
      ? outputName 
      : `${outputName}.txt`;

    return new NextResponse(text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${finalOutputName}"`,
      },
    });
  } catch (error) {
    console.error("OCR Image Error:", error);
    return NextResponse.json({ error: "Failed to extract text from image" }, { status: 500 });
  }
}
