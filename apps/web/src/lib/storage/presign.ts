import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

export function storageListo(): boolean {
  return Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY);
}

export function bucketName(): string {
  return process.env.R2_BUCKET || 'eb-decanato-pastoral';
}

export function publicCdnUrl(key: string): string {
  const base = (process.env.R2_PUBLIC_CDN_URL || '').replace(/\/$/, '');
  if (base) return `${base}/${key}`;
  return `/media/${key}`;
}

function r2(): S3Client {
  const account = process.env.R2_ACCOUNT_ID!;
  return new S3Client({
    region: 'auto',
    endpoint: `https://${account}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export function nuevaKey(): string {
  return `comedores/${randomUUID()}.webp`;
}

export async function presignPut(key: string, contentType: string, expires = 300): Promise<string> {
  const ttl = Math.min(Math.max(expires, 30), 900);
  const cmd = new PutObjectCommand({
    Bucket: bucketName(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2(), cmd, { expiresIn: ttl });
}
