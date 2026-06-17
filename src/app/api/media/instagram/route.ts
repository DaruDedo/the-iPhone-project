import { NextResponse } from "next/server";
import { instagramGetUrl } from "instagram-url-direct";

type InstagramMediaDetail = {
  type?: string;
  url?: string;
  thumbnail?: string;
  dimensions?: {
    width?: number | string;
    height?: number | string;
  };
};

function isInstagramUrl(input: string) {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    return host === "instagram.com";
  } catch {
    return false;
  }
}

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const instagramUrl = url.searchParams.get("url")?.trim();

  if (!instagramUrl || !isInstagramUrl(instagramUrl)) {
    return NextResponse.json({ error: "A valid Instagram URL is required." }, { status: 400 });
  }

  try {
    const data = await instagramGetUrl(instagramUrl, {
      retries: 1,
      delay: 700,
    });
    const details = (data.media_details ?? []) as InstagramMediaDetail[];
    const preferred =
      details.find((item) => item.type?.toLowerCase() === "video" && item.url) ??
      details.find((item) => item.url);
    const directUrl = preferred?.url ?? data.url_list?.[0];

    if (!directUrl) {
      return NextResponse.json({ error: "No playable Instagram media found." }, { status: 404 });
    }

    return NextResponse.json(
      {
        kind: preferred?.type?.toLowerCase() === "image" ? "image" : "video",
        url: directUrl,
        thumbnail: preferred?.thumbnail ?? null,
        width: preferred?.dimensions?.width ?? null,
        height: preferred?.dimensions?.height ?? null,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Instagram media could not be resolved right now.",
      },
      { status: 502 },
    );
  }
}
