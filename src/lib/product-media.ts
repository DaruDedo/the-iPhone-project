export type ProductMediaKind = "image" | "video" | "instagram";

const videoExtensionPattern = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

export function getInstagramEmbedUrl(input: string) {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");

    if (host !== "instagram.com") {
      return null;
    }

    const match = url.pathname.match(/^\/(p|reel|reels|tv)\/([^/]+)/i);

    if (!match) {
      return null;
    }

    const type = match[1].toLowerCase() === "reels" ? "reel" : match[1];

    return `https://www.instagram.com/${type}/${match[2]}/embed`;
  } catch {
    return null;
  }
}

export function inferProductMediaKind(url: string): ProductMediaKind {
  if (getInstagramEmbedUrl(url)) {
    return "instagram";
  }

  if (videoExtensionPattern.test(url)) {
    return "video";
  }

  return "image";
}

export function isImageMediaUrl(url: string) {
  return inferProductMediaKind(url) === "image";
}
