import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getShelbyClient } from "@/lib/shelby";
import { getCurrentSession } from "@/lib/server/session";
import {
  buildDownloadFingerprint,
  recordDownload,
  shouldCountDownload,
} from "@/lib/server/download";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
    revisionId: string;
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
    const { id, revisionId } = await context.params;
    const download = req.nextUrl.searchParams.get("download") === "1";

    const dataset = await db.dataset.findUnique({
      where: { id },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    const session = await getCurrentSession();

    const canAccess =
      dataset.isPublic ||
      (session?.ownerAddress &&
        session.ownerAddress.toLowerCase() === dataset.ownerAddress.toLowerCase());

    if (!canAccess) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const revision = await db.datasetRevision.findFirst({
      where: {
        id: revisionId,
        datasetId: id,
      },
    });

    if (!revision) {
      return NextResponse.json(
        { error: "Revision not found" },
        { status: 404 }
      );
    }

    const shelbyClient = await getShelbyClient();

    const result = await shelbyClient.download({
      account: dataset.uploadedByAddress || dataset.ownerAddress,
      blobName: revision.blobName,
    });

    if (!isShelbyBlobLike(result)) {
      throw new Error("Unsupported Shelby download response shape");
    }

    if (download && dataset.isPublic) {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

      const userAgent = req.headers.get("user-agent") || "unknown";

      const fingerprint = buildDownloadFingerprint({
        datasetId: dataset.id,
        ip,
        userAgent,
      });

      const shouldCount = await shouldCountDownload(dataset.id, fingerprint);

      if (shouldCount) {
        await recordDownload(dataset.id, fingerprint);
      }
    }

    return new Response(result.readable, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": dataset.isPublic
          ? "public, max-age=60, stale-while-revalidate=300"
          : "no-store",
        "Content-Disposition": download
          ? `attachment; filename="${dataset.id}-${revision.id}.json"`
          : `inline; filename="${dataset.id}-${revision.id}.json"`,
        ...(typeof result.contentLength === "number"
          ? { "Content-Length": String(result.contentLength) }
          : {}),
      },
    });
  } catch (error: any) {
    console.error("Revision raw fetch error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal server error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}