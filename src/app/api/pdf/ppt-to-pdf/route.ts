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

    // Load PPTX zip
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Create landscape PDF
    const pdfDoc = await PDFDocument.create();
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let slideIndex = 1;
    let hasSlides = false;

    while (true) {
      const slideFile = zip.file(`ppt/slides/slide${slideIndex}.xml`);
      if (!slideFile) break;

      hasSlides = true;
      const slideXml = await slideFile.async("text");

      // Extract slide text runs inside <a:t>
      const tMatches = slideXml.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
      const slideTextLines = tMatches.map((tXml) => {
        const text = tXml.replace(/<a:t[^>]*>/, "").replace(/<\/a:t>/, "");
        return text
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, "'");
      });

      // Add Landscape A4 slide page
      const page = pdfDoc.addPage([841.89, 595.276]);
      const { width, height } = page.getSize();

      // Slide Title / Header
      page.drawText(`Slide ${slideIndex}`, {
        x: 40,
        y: height - 40,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });

      // Simple divider
      page.drawRectangle({
        x: 40,
        y: height - 50,
        width: width - 80,
        height: 2,
        color: rgb(0.8, 0.8, 0.8),
      });

      // Layout text lines inside the slide
      let yPosition = height - 80;
      const fontSize = 11;
      const lineHeight = 16;
      const maxLineWidth = width - 80;

      for (const textLine of slideTextLines) {
        if (!textLine.trim()) continue;

        // Word wrap
        const words = textLine.split(" ");
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);

          if (testWidth > maxLineWidth) {
            page.drawText(currentLine, {
              x: 40,
              y: yPosition,
              size: fontSize,
              font: fontRegular,
              color: rgb(0.2, 0.2, 0.2),
            });
            yPosition -= lineHeight;
            currentLine = word;

            if (yPosition < 40) break; // Don't overflow slide bounds
          } else {
            currentLine = testLine;
          }
        }

        if (yPosition < 40) continue;

        if (currentLine) {
          page.drawText(currentLine, {
            x: 40,
            y: yPosition,
            size: fontSize,
            font: fontRegular,
            color: rgb(0.2, 0.2, 0.2),
          });
          yPosition -= lineHeight * 1.5;
        }
      }

      slideIndex++;
    }

    if (!hasSlides) {
      return NextResponse.json({ error: "Invalid PowerPoint presentation (.pptx)" }, { status: 400 });
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
    console.error("PPT to PDF Error:", error);
    return NextResponse.json({ error: "Failed to convert PowerPoint to PDF" }, { status: 500 });
  }
}
