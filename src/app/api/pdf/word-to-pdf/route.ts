import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "converted.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();

    // Parse docx zip
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file("word/document.xml")?.async("text");

    if (!docXml) {
      return NextResponse.json({ error: "Invalid Word document (.docx)" }, { status: 400 });
    }

    // Extract text paragraphs using regex
    const paragraphMatches = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
    const paragraphs = paragraphMatches.map((pXml) => {
      const tMatches = pXml.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
      return tMatches.map((tXml) => {
        const text = tXml.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, "");
        return text
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
      }).join("");
    });

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.276, 841.89]); // A4 Size
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const margin = 50;
    let yPosition = height - margin;
    const maxLineWidth = width - margin * 2;
    const fontSize = 11;
    const lineHeight = 16;

    // Header
    page.drawText("CONVERTED WORD DOCUMENT", {
      x: margin,
      y: yPosition,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    
    yPosition -= 30;

    for (const paragraphText of paragraphs) {
      if (!paragraphText.trim()) {
        yPosition -= lineHeight;
        continue;
      }

      // Word wrapping
      const words = paragraphText.split(" ");
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);

        if (testWidth > maxLineWidth) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: fontRegular,
            color: rgb(0.2, 0.2, 0.2),
          });
          yPosition -= lineHeight;
          currentLine = word;

          // Check page boundary
          if (yPosition < margin) {
            page = pdfDoc.addPage([595.276, 841.89]);
            yPosition = height - margin;
          }
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        page.drawText(currentLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
        });
        yPosition -= lineHeight * 1.5;
        
        if (yPosition < margin) {
          page = pdfDoc.addPage([595.276, 841.89]);
          yPosition = height - margin;
        }
      }
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
    console.error("Word to PDF Error:", error);
    return NextResponse.json({ error: "Failed to convert Word document to PDF" }, { status: 500 });
  }
}
