import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Unlocking PDFs requires QPDF and is not available yet." },
    { status: 501 },
  );
}
