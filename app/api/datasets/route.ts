import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const chain = searchParams.get("chain");
    const category = searchParams.get("category");

    const datasets = await db.dataset.findMany({
      where: {
        ...(chain ? { chain } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        count: datasets.length,
        datasets,
      },
      {
        headers: {
          // ⚡ Cache for faster repeated loads
          // max-age=30 → fresh for 30s
          // stale-while-revalidate=120 → serve stale while updating in background
          "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("List datasets error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}