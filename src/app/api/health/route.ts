import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "LETSPACE API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
}
