import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import "regenerator-runtime/runtime";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const devanagariFontPath = join(
  process.cwd(),
  "public",
  "NotoSansDevanagari-Regular.ttf",
);

function decodeXmlText(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractParagraphText(paragraphXml: string) {
  const tokens =
    paragraphXml.match(/<w:t(?:\s[^>]*)?>[\s\S]*?<\/w:t>|<w:tab\s*\/>|<w:br(?:\s[^>]*)?\/>/g) ??
    [];

  return tokens
    .map((token) => {
      if (token.startsWith("<w:tab")) return "\t";
      if (token.startsWith("<w:br")) return "\n";
      return decodeXmlText(token.replace(/<w:t(?:\s[^>]*)?>/, "").replace(/<\/w:t>/, ""));
    })
    .join("");
}

function supports(font: PDFFont, character: string) {
  const codePoint = character.codePointAt(0);
  return codePoint !== undefined && font.getCharacterSet().includes(codePoint);
}

function getFontForCharacter(character: string, regular: PDFFont, devanagari: PDFFont) {
  if (supports(devanagari, character)) return devanagari;
  if (supports(regular, character)) return regular;
  return regular;
}

function safeCharacter(character: string, regular: PDFFont, devanagari: PDFFont) {
  return supports(devanagari, character) || supports(regular, character) ? character : "?";
}

function measureText(text: string, size: number, regular: PDFFont, devanagari: PDFFont) {
  let width = 0;
  let run = "";
  let runFont: PDFFont | undefined;

  for (const originalCharacter of text) {
    const character = safeCharacter(originalCharacter, regular, devanagari);
    const font = getFontForCharacter(character, regular, devanagari);
    if (runFont && font !== runFont) {
      width += runFont.widthOfTextAtSize(run, size);
      run = "";
    }
    runFont = font;
    run += character;
  }

  return width + (runFont && run ? runFont.widthOfTextAtSize(run, size) : 0);
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  regular: PDFFont,
  devanagari: PDFFont,
) {
  let currentX = x;
  let run = "";
  let runFont: PDFFont | undefined;

  const flush = () => {
    if (!runFont || !run) return;
    page.drawText(run, {
      x: currentX,
      y,
      size,
      font: runFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    currentX += runFont.widthOfTextAtSize(run, size);
    run = "";
  };

  for (const originalCharacter of text) {
    const character = safeCharacter(originalCharacter, regular, devanagari);
    const font = getFontForCharacter(character, regular, devanagari);
    if (runFont && font !== runFont) flush();
    runFont = font;
    run += character;
  }
  flush();
}

function wrapText(text: string, maxWidth: number, size: number, regular: PDFFont, devanagari: PDFFont) {
  const lines: string[] = [];

  for (const sourceLine of text.split("\n")) {
    const words = sourceLine.split(/(\s+)/).filter(Boolean);
    let line = "";

    for (const word of words) {
      const candidate = line + word;
      if (!line || measureText(candidate, size, regular, devanagari) <= maxWidth) {
        line = candidate;
        continue;
      }

      lines.push(line.trimEnd());
      line = word.trimStart();

      if (measureText(line, size, regular, devanagari) > maxWidth) {
        let chunk = "";
        for (const character of line) {
          if (chunk && measureText(chunk + character, size, regular, devanagari) > maxWidth) {
            lines.push(chunk);
            chunk = character;
          } else {
            chunk += character;
          }
        }
        line = chunk;
      }
    }

    lines.push(line.trimEnd());
  }

  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "converted.pdf";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json({ error: "Only .docx Word documents are supported" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "The Word document must be 25 MB or smaller" }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();

    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file("word/document.xml")?.async("text");

    if (!docXml) {
      return NextResponse.json({ error: "Invalid Word document (.docx)" }, { status: 400 });
    }

    const paragraphMatches = docXml.match(/<w:p[\s\S]*?<\/w:p>/g) || [];
    const paragraphs = paragraphMatches.map(extractParagraphText);

    if (!paragraphs.some((paragraph) => paragraph.trim())) {
      return NextResponse.json(
        { error: "No readable text was found in the Word document" },
        { status: 400 },
      );
    }

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    let page = pdfDoc.addPage([595.276, 841.89]); // A4 Size
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const devanagariFontBytes = await readFile(devanagariFontPath);
    const fontDevanagari = await pdfDoc.embedFont(devanagariFontBytes, { subset: true });

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

      const lines = wrapText(paragraphText, maxLineWidth, fontSize, fontRegular, fontDevanagari);
      for (const line of lines) {
        if (yPosition < margin) {
          page = pdfDoc.addPage([595.276, 841.89]);
          yPosition = height - margin;
        }
        if (line) {
          drawText(page, line, margin, yPosition, fontSize, fontRegular, fontDevanagari);
        }
        yPosition -= lineHeight;
      }
      yPosition -= lineHeight * 0.5;
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
