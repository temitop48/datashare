import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/server/session";
import { getDatasetRevisions } from "@/lib/server/revisions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

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

    const revisions = await getDatasetRevisions(id);

    return NextResponse.json({
      success: true,
      revisions,
    });
  } catch (error: any) {
    console.error("Get revisions error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}