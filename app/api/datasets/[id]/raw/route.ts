import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getShelbyClient } from "@/lib/shelby";
import { canCurrentUserAccessDataset } from "@/lib/server/dataset-access";
import { incrementDownloadCount, canIncrementDownload } from "@/lib/server/download";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ShelbyBlobLike = {
  account: string;
  name: string;
  readable: ReadableStream;
  contentLength?: number;
};

function isShelbyBlobLike(value: unknown): value is ShelbyBlobLike {
  return !!value && typeof value === "object" && "readable" in value;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const download = req.nextUrl.searchParams.get("download") === "1";

    const access = await canCurrentUserAccessDataset(id);

    if (access.reason === "not_found") {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    if (!access.allowed || !access.dataset) {
      return NextResponse.json(
        { error: "Forbidden: you do not have access to this dataset" },
        { status: 403 }
      );
    }

    const dataset = access.dataset;

    if (!dataset.blobName || dataset.blobName === "pending") {
      return NextResponse.json(
        { error: "Dataset file is not available" },
        { status: 409 }
      );
    }

    const shelbyClient = await getShelbyClient();

    const result = await shelbyClient.download({
      account: dataset.uploadedByAddress || dataset.ownerAddress,
      blobName: dataset.blobName,
    });


    if (!isShelbyBlobLike(result)) {
      throw new Error("Unsupported Shelby download response shape");
    }

    await db.dataset.update({
      where: { id: dataset.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });


    const ip =
     req.headers.get("x-forwarded-for") ||
     req.headers.get("x-real-ip") ||
     "unknown";

    if (dataset.isPublic && canIncrementDownload(ip, dataset.id)) {
    incrementDownloadCount(dataset.id).catch(console.error);
    }


    return new Response(result.readable, {
  status: 200,
  headers: {
    "Content-Type": "application/json",

    // 🔥 CACHE BOOST
    "Cache-Control": dataset.isPublic
      ? "public, max-age=60, stale-while-revalidate=300"
      : "no-store",

    "Content-Disposition": download
      ? `attachment; filename="${dataset.id}.json"`
      : `inline; filename="${dataset.id}.json"`,

    ...(typeof result.contentLength === "number"
      ? { "Content-Length": String(result.contentLength) }
      : {}),
  },
});
  } catch (error: any) {
    console.error("Raw dataset fetch error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}