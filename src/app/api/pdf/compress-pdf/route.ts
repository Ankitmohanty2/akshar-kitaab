import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "compressed.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    
    // Load and optimize by copying to a fresh document
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const compressedDoc = await PDFDocument.create();
    
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await compressedDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => compressedDoc.addPage(page));

    // Save using Next-gen object streams and compression settings
    const pdfBytes = await compressedDoc.save({
      useObjectStreams: true,
    });

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
    console.error("Compress PDF Error:", error);
    return NextResponse.json({ error: "Failed to compress PDF" }, { status: 500 });
  }
}
