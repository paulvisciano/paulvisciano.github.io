#!/usr/bin/env node
/**
 * Quick test script to verify R2 upload works
 * Usage: node test-upload.js <filePath>
 */
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || "";

const filePath = process.argv[2] || "moments/siargao/2025-12-14/cover.png";
const workspaceRoot = process.env.WORKSPACE_ROOT || resolve(__dirname, "..");
const resolvedPath = resolve(workspaceRoot, filePath);

console.log("Uploading:", resolvedPath);
console.log("Bucket:", BUCKET_NAME);
console.log("");

if (!existsSync(resolvedPath)) {
  console.error("Error: File not found:", resolvedPath);
  process.exit(1);
}

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error("Error: Missing R2 credentials in .env");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const key = filePath.replace(/^\//, "");
const body = readFileSync(resolvedPath);
const ext = resolvedPath.toLowerCase().slice(resolvedPath.lastIndexOf("."));
const contentType = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".mp4": "video/mp4" }[ext] || "application/octet-stream";

try {
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  const url = PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}` : `r2://${BUCKET_NAME}/${key}`;
  console.log("✓ Upload successful!");
  console.log("");
  console.log("Public URL:", url);
} catch (err) {
  console.error("Upload failed:", err.message);
  process.exit(1);
}
