import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "rotated.pdf";
    const rotationStr = formData.get("rotation") as string | null;
    const rotationAngle = parseInt(rotationStr || "90", 10);

    if (![90, 180, 270].includes(rotationAngle)) {
      return NextResponse.json({ error: "Rotation must be 90, 180, or 270 degrees." }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + rotationAngle));
    });

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
    console.error("Rotate PDF Error:", error);
    return NextResponse.json({ error: "Failed to rotate PDF" }, { status: 500 });
  }
}
