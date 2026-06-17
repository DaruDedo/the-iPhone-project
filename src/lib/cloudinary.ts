import crypto from "crypto";

type CloudinaryUploadResult = {
  secure_url?: string;
  public_id?: string;
  resource_type?: string;
  bytes?: number;
  format?: string;
  error?: {
    message?: string;
  };
};

function getCloudinaryConfig() {
  const urlConfig = parseCloudinaryUrl(process.env.CLOUDINARY_URL);

  return {
    cloudName: cleanEnvValue(process.env.CLOUDINARY_CLOUD_NAME) || urlConfig.cloudName,
    apiKey: cleanEnvValue(process.env.CLOUDINARY_API_KEY) || urlConfig.apiKey,
    apiSecret: cleanEnvValue(process.env.CLOUDINARY_API_SECRET) || urlConfig.apiSecret,
    defaultFolder: cleanEnvValue(process.env.CLOUDINARY_UPLOAD_FOLDER) || "the-iphone-project",
  };
}

function cleanEnvValue(value?: string) {
  return value?.trim();
}

function parseCloudinaryUrl(rawUrl?: string) {
  if (!rawUrl) {
    return {};
  }

  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== "cloudinary:") {
      return {};
    }

    return {
      cloudName: parsed.hostname,
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
    };
  } catch {
    return {};
  }
}

export function isCloudinaryConfigured() {
  const config = getCloudinaryConfig();

  return Boolean(config.cloudName && config.apiKey && config.apiSecret);
}

function cleanFolder(prefix: string, defaultFolder: string) {
  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const cleanDefaultFolder = defaultFolder
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]/g, "-");

  return cleanPrefix ? `${cleanDefaultFolder}/${cleanPrefix}` : cleanDefaultFolder;
}

function signParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(file: File, prefix: string) {
  const config = getCloudinaryConfig();

  if (!config.cloudName || !config.apiKey || !config.apiSecret) {
    throw new Error("Cloudinary credentials are missing.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = cleanFolder(prefix, config.defaultFolder);
  const signature = signParams({ folder, timestamp }, config.apiSecret);
  const form = new FormData();

  form.append("file", file);
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const result = (await response.json()) as CloudinaryUploadResult;

  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? "Cloudinary upload failed.");
  }

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    format: result.format,
  };
}
