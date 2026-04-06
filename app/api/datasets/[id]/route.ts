import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/server/session";
import { createActivityLog } from "@/lib/server/activity";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// ✅ STEP 5: CACHE CONFIG
const CACHE_TTL_SECONDS = 60; // cache for 60 seconds

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

    return NextResponse.json(
      {
        success: true,
        dataset,
      },
      {
        headers: {
          // ✅ Cache control
          "Cache-Control": `public, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=${CACHE_TTL_SECONDS}`,
        },
      }
    );
  } catch (error: any) {
    console.error("Get dataset error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await req.json();

    const existing = await db.dataset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    if (
      existing.ownerAddress.toLowerCase() !==
      session.ownerAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this dataset" },
        { status: 403 }
      );
    }

    const updated = await db.dataset.update({
      where: { id },
      data: {
        ...(typeof body.title === "string"
          ? { title: body.title.trim() }
          : {}),
        ...(typeof body.description === "string"
          ? { description: body.description.trim() }
          : {}),
        ...(typeof body.chain === "string"
          ? { chain: body.chain.trim() }
          : {}),
        ...(typeof body.category === "string"
          ? { category: body.category.trim() }
          : {}),
        ...(typeof body.version === "string"
          ? { version: body.version.trim() }
          : {}),
        ...(Array.isArray(body.tags)
          ? {
              tags: body.tags
                .map((tag: string) => tag.trim())
                .join(","),
            }
          : {}),
        ...(typeof body.isPublic === "boolean"
          ? { isPublic: body.isPublic }
          : {}),
      },
    });

    // ✅ ACTIVITY LOG
    await createActivityLog({
      datasetId: updated.id,
      action: "UPDATE_METADATA",
      actorAddress: session.ownerAddress,
      metadata: {
        updatedFields: Object.keys(body),
      },
    });

    return NextResponse.json({
      success: true,
      dataset: updated,
    });
  } catch (error: any) {
    console.error("Update dataset error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getCurrentSession();

    if (!session?.ownerAddress) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existing = await db.dataset.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Dataset not found" },
        { status: 404 }
      );
    }

    if (
      existing.ownerAddress.toLowerCase() !==
      session.ownerAddress.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this dataset" },
        { status: 403 }
      );
    }

    // ✅ LOG BEFORE DELETE
    await createActivityLog({
      datasetId: existing.id,
      action: "DELETE",
      actorAddress: session.ownerAddress,
      metadata: {
        title: existing.title,
        version: existing.version,
        checksum: existing.checksum,
      },
    });

    await db.dataset.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Dataset deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete dataset error:", error);

    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}