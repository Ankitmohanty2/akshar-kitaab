import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const textOverlay = (formData.get("text_overlay") as string) || "";
    const outputName = (formData.get("output_name") as string) || "edited.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      // Draw text overlay as a header on every page
      page.drawText(textOverlay, {
        x: 50,
        y: height - 40,
        size: 12,
        font: font,
        color: rgb(0.8, 0.1, 0.1), // Styled red color to stand out
      });
    }

    const pdfBytes = await pdfDoc.save();

    const finalOutputName = outputName.toLowerCase().endsWith(".pdf") 
      ? outputName 
      : `${outputName}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${finalOutputName}"`,
      },
    });
  } catch (error) {
    console.error("Edit PDF Error:", error);
    return NextResponse.json({ error: "Failed to edit PDF" }, { status: 500 });
  }
}
