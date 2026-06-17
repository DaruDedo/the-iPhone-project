import { NextResponse } from "next/server";

import { isAdminError, requireAdmin } from "@/lib/admin-auth";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxFileSize = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const admin = await requireAdmin(request);

  if (isAdminError(admin)) {
    return admin;
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and optional CLOUDINARY_UPLOAD_FOLDER.",
      },
      { status: 503 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const prefix = String(form.get("prefix") ?? "products");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: "File is too large. Max upload size is 50MB." },
        { status: 413 },
      );
    }

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        { error: "Only image and video uploads are allowed." },
        { status: 400 },
      );
    }

    const upload = await uploadToCloudinary(file, prefix);

    return NextResponse.json({ ok: true, ...upload });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not upload media to Cloudinary.",
      },
      { status: 500 },
    );
  }
}
