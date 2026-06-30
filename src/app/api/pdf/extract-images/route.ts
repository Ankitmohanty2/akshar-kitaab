import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFRawStream, PDFName } from "pdf-lib";
import zlib from "zlib";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    const outputName = (formData.get("output_name") as string) || "extracted_images.zip";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const zip = new JSZip();

    let imgCount = 0;
    const indirectObjects = pdfDoc.context.enumerateIndirectObjects();

    for (const [ref, obj] of indirectObjects) {
      if (obj instanceof PDFRawStream) {
        const dict = obj.dict;
        const subtype = dict.get(PDFName.of("Subtype"));
        if (subtype === PDFName.of("Image")) {
          imgCount++;
          const filter = dict.get(PDFName.of("Filter"));
          const filterName = filter ? filter.toString() : "";
          const widthObj = dict.get(PDFName.of("Width"));
          const heightObj = dict.get(PDFName.of("Height"));
          const width = widthObj ? (widthObj as any).value : 0;
          const height = heightObj ? (heightObj as any).value : 0;

          // Extract stream bytes
          let bytes = obj.contents;

          if (filterName.includes("DCTDecode")) {
            // It's a JPEG
            zip.file(`image_${imgCount}_${width}x${height}.jpg`, bytes);
          } else if (filterName.includes("FlateDecode")) {
            try {
              // Decompress FlateDecode stream
              const decompressed = zlib.inflateSync(bytes);
              zip.file(`image_${imgCount}_${width}x${height}.bin`, decompressed);
            } catch (err) {
              // Fallback to raw bytes if decompression fails
              zip.file(`image_${imgCount}_${width}x${height}.raw`, bytes);
            }
          } else {
            // Other formats (e.g. LZWDecode, CCITTFaxDecode)
            zip.file(`image_${imgCount}_${width}x${height}.raw`, bytes);
          }
        }
      }
    }

    if (imgCount === 0) {
      return NextResponse.json({ error: "No images found in the PDF document" }, { status: 400 });
    }

    const zipBytes = await zip.generateAsync({ type: "nodebuffer" });
    const zipBytesArray = new Uint8Array(zipBytes);

    const finalOutputName = outputName.toLowerCase().endsWith(".zip") 
      ? outputName 
      : `${outputName}.zip`;

    return new NextResponse(zipBytesArray, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${finalOutputName}"`,
      },
    });
  } catch (error) {
    console.error("Extract Images Error:", error);
    return NextResponse.json({ error: "Failed to extract images" }, { status: 500 });
  }
}
