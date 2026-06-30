import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFRawStream } from "pdf-lib";
import zlib from "zlib";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "converted.pptx";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Extract text strings from PDF content streams
    const textRuns: string[] = [];
    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();

    for (const [ref, obj] of indirectObjects) {
      if (obj instanceof PDFRawStream) {
        try {
          const decompressed = zlib.inflateSync(obj.contents);
          const streamText = decompressed.toString("binary");

          const tjMatches = streamText.match(/\(([^)]*)\)\s*Tj/g) || [];
          for (const match of tjMatches) {
            const text = match.slice(1, match.lastIndexOf(")"));
            const cleaned = text.replace(/\\(\d{3})/g, (_, octal) => 
              String.fromCharCode(parseInt(octal, 8))
            ).replace(/\\/g, "");
            if (cleaned.trim()) textRuns.push(cleaned);
          }

          const bracketMatches = streamText.match(/\[([\s\S]*?)\]\s*TJ/g) || [];
          for (const match of bracketMatches) {
            const inner = match.slice(1, match.lastIndexOf("]"));
            const strMatches = inner.match(/\(([^)]*)\)/g) || [];
            const combined = strMatches.map(s => {
              const cleaned = s.slice(1, -1).replace(/\\(\d{3})/g, (_, octal) => 
                String.fromCharCode(parseInt(octal, 8))
              ).replace(/\\/g, "");
              return cleaned;
            }).join("");
            if (combined.trim()) textRuns.push(combined);
          }
        } catch (e) {
          // Ignore
        }
      }
    }

    // Default text fallback if no text could be parsed
    if (textRuns.length === 0) {
      textRuns.push("Akshar Kitaab Presentation");
      textRuns.push("Converted from PDF document.");
    }

    // Create slide deck structure (grouping 4 items per slide)
    const slides: { title: string; content: string[] }[] = [];
    let currentSlideContent: string[] = [];
    let slideTitle = "Presentation";

    for (let i = 0; i < textRuns.length; i++) {
      const text = textRuns[i];
      if (i === 0) {
        slideTitle = text;
      } else {
        currentSlideContent.push(text);
        if (currentSlideContent.length >= 4 || i === textRuns.length - 1) {
          slides.push({
            title: slideTitle,
            content: currentSlideContent,
          });
          currentSlideContent = [];
          slideTitle = textRuns[i + 1] || "Slide Section";
          i++; // Skip the next index since we used it as title
        }
      }
    }

    // Edge case if last slides weren't pushed
    if (currentSlideContent.length > 0) {
      slides.push({
        title: slideTitle,
        content: currentSlideContent,
      });
    }

    if (slides.length === 0) {
      slides.push({
        title: "Presentation Slides",
        content: ["No slide text extracted."],
      });
    }

    const zip = new JSZip();

    // 1. Content types
    const slideOverridesXml = slides.map((_, index) => 
      `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    ).join("\n");

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/markup-compatibility/2006">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideOverridesXml}
</Types>`;

    // 2. Package relationships
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

    // 3. Presentation relationships
    const presentationRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${slides.map((_, index) => 
    `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`
  ).join("\n")}
</Relationships>`;

    // 4. Main presentation definition
    const slideIdsXml = slides.map((_, index) => 
      `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`
    ).join("\n");

    const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    ${slideIdsXml}
  </p:sldIdLst>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

    zip.file("[Content_Types].xml", contentTypesXml);
    zip.file("_rels/.rels", relsXml);
    zip.file("ppt/presentation.xml", presentationXml);
    zip.file("ppt/_rels/presentation.xml.rels", presentationRelsXml);

    // 5. Individual slide templates
    slides.forEach((slide, index) => {
      const escapedTitle = slide.title
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const paragraphsXml = slide.content.map(text => {
        const escapedText = text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<a:p><a:r><a:t>${escapedText}</a:t></a:r></a:p>`;
      }).join("\n");

      const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      
      <!-- Title Box -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title 1"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:t>${escapedTitle}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>

      <!-- Content Box -->
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content 2"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr/>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${paragraphsXml}
        </p:txBody>
      </p:sp>

    </p:spTree>
  </p:cSld>
</p:sld>`;

      zip.file(`ppt/slides/slide${index + 1}.xml`, slideXml);
    });

    const pptxBytes = await zip.generateAsync({ type: "nodebuffer" });
    const pptxBytesArray = new Uint8Array(pptxBytes);

    const finalOutputName = outputName.toLowerCase().endsWith(".pptx") 
      ? outputName 
      : `${outputName}.pptx`;

    return new NextResponse(pptxBytesArray, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${finalOutputName}"`,
      },
    });
  } catch (error) {
    console.error("PDF to PPT Error:", error);
    return NextResponse.json({ error: "Failed to convert PDF to PowerPoint" }, { status: 500 });
  }
}
