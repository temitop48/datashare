import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json(
        { error: "Missing search query" },
        { status: 400 }
      );
    }

    const datasets = await db.dataset.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
          { chain: { contains: q } },
          { category: { contains: q } },
          { tags: { contains: q } },
        ],
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
          // ⚡ Cache search results briefly
          // keeps UI fast while still reflecting updates quickly
          "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (error: any) {
    console.error("Search datasets error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}