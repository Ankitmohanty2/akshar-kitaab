import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const signatureImage = (formData.get("signature_image") as string) || "";
    const sigPage = (formData.get("sig_page") as string) || "1";
    const sigX = (formData.get("sig_x") as string) || "100";
    const sigY = (formData.get("sig_y") as string) || "100";
    const outputName = (formData.get("output_name") as string) || "signed.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    if (!signatureImage) {
      return NextResponse.json({ error: "No signature image provided" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Decode base64 image
    const base64Data = signatureImage.replace(/^data:image\/png;base64,/, "");
    const sigImageBytes = Buffer.from(base64Data, "base64");

    // Embed PNG image
    const sigImg = await pdfDoc.embedPng(sigImageBytes);

    // Select page
    const totalPages = pdfDoc.getPageCount();
    const targetPageIndex = Math.max(0, Math.min(parseInt(sigPage) - 1, totalPages - 1));
    const page = pdfDoc.getPages()[targetPageIndex];

    // Draw signature
    page.drawImage(sigImg, {
      x: parseFloat(sigX),
      y: parseFloat(sigY),
      width: 150, // Standard display size
      height: 56, // Keeps aspect ratio of 400x150 drawing pad
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
    console.error("Sign PDF Error:", error);
    return NextResponse.json({ error: "Failed to sign PDF" }, { status: 500 });
  }
}
