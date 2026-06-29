import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "cropped.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pages = pdfDoc.getPages();
    // Simple 10% crop all around
    pages.forEach(page => {
      const { width, height } = page.getSize();
      const cropAmountX = width * 0.1;
      const cropAmountY = height * 0.1;
      
      page.setCropBox(
        cropAmountX, 
        cropAmountY, 
        width - (cropAmountX * 2), 
        height - (cropAmountY * 2)
      );
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
    console.error("Crop PDF Error:", error);
    return NextResponse.json({ error: "Failed to crop PDF" }, { status: 500 });
  }
}
