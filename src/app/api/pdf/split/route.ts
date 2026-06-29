import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";

/**
 * Parse a page specification string like "1,3,5-8" into an array of 0-indexed page numbers.
 */
function parsePages(pagesStr: string, totalPages: number): number[] {
  const pages = new Set<number>();
  const parts = pagesStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || end < 1 || start > totalPages || end > totalPages) {
        throw new Error(`Invalid page range "${part}". Pages must be between 1 and ${totalPages}.`);
      }

      for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
        pages.add(i - 1);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Invalid page number "${part}". Must be between 1 and ${totalPages}.`);
      }
      pages.add(pageNum - 1);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "split_pages";
    const pagesStr = formData.get("pages") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();

    // If specific pages are provided, extract only those
    if (pagesStr && pagesStr.trim()) {
      const selectedPages = parsePages(pagesStr, pageCount);

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, selectedPages);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
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
    }

    // Fallback: split every page into individual PDFs in a zip
    const zip = new JSZip();

    for (let i = 0; i < pageCount; i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      zip.file(`page_${i + 1}.pdf`, pdfBytes);
    }

    const zipContent = await zip.generateAsync({ type: "uint8array" });

    const finalOutputName = outputName.toLowerCase().endsWith(".zip") 
      ? outputName 
      : `${outputName}.zip`;

    return new NextResponse(Buffer.from(zipContent), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${finalOutputName}"`,
      },
    });
  } catch (error: any) {
    console.error("Split PDF Error:", error);
    return NextResponse.json({ error: error.message || "Failed to split PDF" }, { status: 500 });
  }
}
