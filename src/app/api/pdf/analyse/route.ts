import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
    
    const metadata = {
      title: pdfDoc.getTitle() || "N/A",
      author: pdfDoc.getAuthor() || "N/A",
      subject: pdfDoc.getSubject() || "N/A",
      creator: pdfDoc.getCreator() || "N/A",
      producer: pdfDoc.getProducer() || "N/A",
      pageCount: pdfDoc.getPageCount(),
      creationDate: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate()?.toISOString() : "N/A",
      modificationDate: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate()?.toISOString() : "N/A",
    };

    return NextResponse.json({ metadata }, { status: 200 });
  } catch (error) {
    console.error("Analyse PDF Error:", error);
    return NextResponse.json({ error: "Failed to analyse PDF" }, { status: 500 });
  }
}
