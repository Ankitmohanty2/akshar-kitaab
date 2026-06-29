import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import JSZip from "jszip";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    if (files.length === 1) {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let compressedBuffer;
      let contentType = file.type;
      
      if (file.type.includes("png")) {
        compressedBuffer = await sharp(buffer).png({ quality: 60, compressionLevel: 9 }).toBuffer();
      } else {
        compressedBuffer = await sharp(buffer).jpeg({ quality: 60 }).toBuffer();
        contentType = "image/jpeg";
      }

      return new NextResponse(new Uint8Array(compressedBuffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `attachment; filename="compressed_${file.name}"`,
        },
      });
    }

    const zip = new JSZip();
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let compressedBuffer;
      if (file.type.includes("png")) {
        compressedBuffer = await sharp(buffer).png({ quality: 60, compressionLevel: 9 }).toBuffer();
      } else {
        compressedBuffer = await sharp(buffer).jpeg({ quality: 60 }).toBuffer();
      }
      
      zip.file(`compressed_${file.name}`, compressedBuffer);
    }

    const zipContent = await zip.generateAsync({ type: "uint8array" });
    return new NextResponse(Buffer.from(zipContent), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="compressed_images.zip"`,
      },
    });

  } catch (error) {
    console.error("Compress Image Error:", error);
    return NextResponse.json({ error: "Failed to compress images" }, { status: 500 });
  }
}
