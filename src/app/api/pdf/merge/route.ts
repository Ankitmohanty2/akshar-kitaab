import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "merged.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (file && file.name.toLowerCase().endsWith(".pdf")) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
    }

    const pdfBytes = await mergedPdf.save();

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
    console.error("Merge PDF Error:", error);
    return NextResponse.json({ error: "Failed to merge PDFs" }, { status: 500 });
  }
}
