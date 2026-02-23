import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

function getClient(): S3Client | null {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (
    !endpoint || endpoint.includes("placeholder") ||
    !accessKeyId || accessKeyId.includes("placeholder") ||
    !secretAccessKey || secretAccessKey.includes("placeholder")
  ) {
    return null; // R2 not configured — fall back to direct URLs
  }

  return new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function getBucket() { return process.env.R2_BUCKET_NAME ?? "contentforge-media"; }
function getPublicUrl() { return process.env.R2_PUBLIC_URL ?? ""; }

/** Upload a raw Buffer to R2. Returns the permanent public URL, or null if R2 is unconfigured. */
export async function uploadBuffer(
  buffer: Buffer,
  ext: string,
  contentType: string
): Promise<string | null> {
  const client = getClient();
  if (!client || !getPublicUrl()) return null;

  const key = `${Date.now()}-${randomUUID()}.${ext}`;
  await client.send(
    new PutObjectCommand({ Bucket: getBucket(), Key: key, Body: buffer, ContentType: contentType })
  );
  return `${getPublicUrl()}/${key}`;
}

/** Fetch a remote URL and re-upload to R2. Returns permanent URL, or null if R2/fetch fails. */
export async function uploadFromUrl(
  url: string,
  ext: string,
  contentType: string
): Promise<string | null> {
  if (!getClient() || !getPublicUrl()) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return uploadBuffer(buffer, ext, contentType);
  } catch {
    return null;
  }
}

/** Decode a base64 string and upload to R2. Returns permanent URL, or null if R2 unconfigured. */
export async function uploadBase64(
  base64: string,
  ext: string,
  contentType: string
): Promise<string | null> {
  if (!getClient() || !getPublicUrl()) return null;
  const buffer = Buffer.from(base64, "base64");
  return uploadBuffer(buffer, ext, contentType);
}
