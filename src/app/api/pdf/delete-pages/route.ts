import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

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
        pages.add(i - 1); // Convert to 0-indexed
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
        throw new Error(`Invalid page number "${part}". Must be between 1 and ${totalPages}.`);
      }
      pages.add(pageNum - 1); // Convert to 0-indexed
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const pagesStr = formData.get("pages") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    }

    if (!pagesStr || !pagesStr.trim()) {
      return NextResponse.json({ error: "Please specify which pages to delete (e.g. 1,3,5-8)" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();

    const pagesToDelete = parsePages(pagesStr, pageCount);

    if (pagesToDelete.length >= pageCount) {
      return NextResponse.json({ error: "Cannot delete all pages. At least one page must remain." }, { status: 400 });
    }

    // Remove pages in reverse order so indices stay valid
    for (let i = pagesToDelete.length - 1; i >= 0; i--) {
      pdfDoc.removePage(pagesToDelete[i]);
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pages_deleted.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Delete Pages Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete pages" }, { status: 500 });
  }
}
