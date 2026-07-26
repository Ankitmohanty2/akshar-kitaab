import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 180;

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const CONVERSION_TIMEOUT_MS = 120_000;
const execFileAsync = promisify(execFile);

type ProcessError = Error & {
  code?: string | number;
  killed?: boolean;
  stderr?: string;
};

function safeDownloadName(requestedName: string) {
  const withoutExtension = requestedName.replace(/\.pdf$/i, "");
  const safeBaseName = withoutExtension
    .replace(/[^\p{L}\p{N}._ -]/gu, "_")
    .trim()
    .slice(0, 120);

  return `${safeBaseName || "converted"}.pdf`;
}

function contentDisposition(fileName: string) {
  const asciiName = fileName.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_");
  return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

export async function POST(req: NextRequest) {
  let workDirectory: string | undefined;

  try {
    const formData = await req.formData();
    const uploadedFile = formData.get("files");
    const outputName = String(formData.get("output_name") || "converted.pdf");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "No Word document uploaded" }, { status: 400 });
    }

    const extension = extname(uploadedFile.name).toLowerCase();
    if (extension !== ".doc" && extension !== ".docx") {
      return NextResponse.json(
        { error: "Only .doc and .docx Word documents are supported" },
        { status: 400 },
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "The Word document must be 25 MB or smaller" },
        { status: 413 },
      );
    }

    workDirectory = await mkdtemp(join(tmpdir(), "akshar-word-"));
    const inputPath = join(workDirectory, `source${extension}`);
    const outputPath = join(workDirectory, "source.pdf");
    const profileUrl = pathToFileURL(join(workDirectory, "libreoffice-profile")).href;

    await writeFile(inputPath, Buffer.from(await uploadedFile.arrayBuffer()));

    const libreOfficeBinary = process.env.LIBREOFFICE_PATH || "soffice";
    await execFileAsync(
      libreOfficeBinary,
      [
        `-env:UserInstallation=${profileUrl}`,
        "--headless",
        "--nologo",
        "--nodefault",
        "--nofirststartwizard",
        "--convert-to",
        "pdf:writer_pdf_Export",
        "--outdir",
        workDirectory,
        inputPath,
      ],
      {
        timeout: CONVERSION_TIMEOUT_MS,
        windowsHide: true,
        maxBuffer: 1024 * 1024,
        env: { ...process.env, HOME: workDirectory },
      },
    );

    let pdfBytes: Buffer;
    try {
      pdfBytes = await readFile(outputPath);
    } catch {
      return NextResponse.json(
        { error: "LibreOffice could not convert this Word document" },
        { status: 422 },
      );
    }

    const finalOutputName = safeDownloadName(outputName);
    return new NextResponse(Uint8Array.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBytes.byteLength),
        "Content-Disposition": contentDisposition(finalOutputName),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const processError = error as ProcessError;
    console.error("Word to PDF Error:", processError);

    if (processError.code === "ENOENT") {
      return NextResponse.json(
        {
          error:
            "LibreOffice is not installed. Run the app with Docker or set LIBREOFFICE_PATH.",
        },
        { status: 503 },
      );
    }

    if (processError.killed || processError.code === "ETIMEDOUT") {
      return NextResponse.json(
        { error: "The Word document took too long to convert" },
        { status: 504 },
      );
    }

    if (typeof processError.code === "number") {
      return NextResponse.json(
        { error: "LibreOffice could not read this Word document" },
        { status: 422 },
      );
    }

    return NextResponse.json(
      { error: "Failed to convert the Word document" },
      { status: 500 },
    );
  } finally {
    if (workDirectory) {
      await rm(workDirectory, { recursive: true, force: true }).catch((cleanupError) => {
        console.error("Word conversion cleanup failed:", cleanupError);
      });
    }
  }
}
