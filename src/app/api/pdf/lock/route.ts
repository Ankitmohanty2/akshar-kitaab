import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Password protection requires a pro PDF engine like QPDF. Coming soon!" }, 
    { status: 501 }
  );
}
