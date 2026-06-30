import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const prompt = (formData.get("prompt") as string) || "Untitled Generated Document";
    const outputName = (formData.get("output_name") as string) || "generated.pdf";

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.89]); // A4 Size
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Margins and positions
    const margin = 50;
    let yPosition = height - margin;

    // Draw header/accent line
    page.drawRectangle({
      x: margin,
      y: yPosition - 10,
      width: width - margin * 2,
      height: 3,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPosition -= 40;

    // Title
    page.drawText("GENERATED DOCUMENT", {
      x: margin,
      y: yPosition,
      size: 24,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    yPosition -= 30;

    // Date / Subtitle
    const dateStr = `Created on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`;
    page.drawText(dateStr, {
      x: margin,
      y: yPosition,
      size: 10,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });

    yPosition -= 40;

    // Word wrapping for prompt text
    const maxLineWidth = width - margin * 2;
    const fontSize = 12;
    const lineHeight = 18;
    const paragraphs = prompt.split("\n");

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        yPosition -= lineHeight;
        continue;
      }

      const words = paragraph.split(" ");
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

          // Add a new page if we exceed margins
          if (yPosition < margin) {
            yPosition = height - margin;
            // Add new page... for simplicity in single page prompt outputs we just limit to page boundary or append new page
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
      }
    }

    // Save PDF
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
    console.error("Generate PDF Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
