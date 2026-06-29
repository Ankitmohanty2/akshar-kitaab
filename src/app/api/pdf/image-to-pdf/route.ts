import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "images_to.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    const pdfDoc = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      let image;
      
      const fileType = file.type.toLowerCase();
      
      if (fileType.includes("jpeg") || fileType.includes("jpg")) {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (fileType.includes("png")) {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        continue;
      }

      const { width, height } = image.scale(1);
      const page = pdfDoc.addPage([width, height]);
      
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: width,
        height: height,
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
    console.error("Image to PDF Error:", error);
    return NextResponse.json({ error: "Failed to convert images to PDF" }, { status: 500 });
  }
}
