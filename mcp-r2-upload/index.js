#!/usr/bin/env node
/**
 * MCP Server for Cloudflare R2 Uploads
 * Uploads images to an R2 bucket and returns public URLs for use in moments.js
 */

import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, ".env") });

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync, existsSync } from "fs";
import { resolve, basename } from "path";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL || ""; // e.g. https://pub-xxx.r2.dev or https://cdn.yourdomain.com

function getS3Client() {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      "Missing R2 credentials. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in .env"
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

const server = new Server(
  {
    name: "r2-upload",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "upload_to_r2",
      description:
        "Upload an image or file from the workspace to Cloudflare R2 and return the public URL. Use this to upload comic pages, covers, or other assets and get URLs for moments.js. The file path should be relative to the project root or absolute.",
      inputSchema: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description:
              "Path to the file to upload (e.g. moments/siargao/2025-12-14/cover.png)",
          },
          objectKey: {
            type: "string",
            description:
              "Optional. Key/path in the bucket (defaults to the same path as filePath)",
          },
        },
        required: ["filePath"],
      },
    },
    {
      name: "upload_folder_to_r2",
      description:
        "Upload all images in a folder to R2, preserving structure. Returns an array of { localPath, url } for updating moments.js.",
      inputSchema: {
        type: "object",
        properties: {
          folderPath: {
            type: "string",
            description:
              "Path to folder (e.g. moments/siargao/2025-12-14)",
          },
          extensions: {
            type: "array",
            items: { type: "string" },
            description:
              "File extensions to include (default: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4'])",
          },
        },
        required: ["folderPath"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "upload_to_r2") {
    const { filePath, objectKey } = args || {};
    if (!filePath) {
      return {
        content: [
          {
            type: "text",
            text: "Error: filePath is required",
          },
        ],
        isError: true,
      };
    }

    const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
    const resolvedPath = resolve(workspaceRoot, filePath);

    if (!existsSync(resolvedPath)) {
      return {
        content: [
          {
            type: "text",
            text: `Error: File not found: ${resolvedPath}`,
          },
        ],
        isError: true,
      };
    }

    try {
      const client = getS3Client();
      if (!BUCKET_NAME) {
        return {
          content: [{ type: "text", text: "Error: R2_BUCKET_NAME not set" }],
          isError: true,
        };
      }

      const key = objectKey || filePath.replace(/^\//, "");
      const body = readFileSync(resolvedPath);
      const contentType = getContentType(resolvedPath);

      await client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      );

      const url = PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}` : `r2://${BUCKET_NAME}/${key}`;

      return {
        content: [
          {
            type: "text",
            text: `Uploaded successfully.\n\n**URL for moments.js:**\n\`${url}\`\n\nKey: ${key}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Upload failed: ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (name === "upload_folder_to_r2") {
    const { folderPath, extensions } = args || {};
    if (!folderPath) {
      return {
        content: [{ type: "text", text: "Error: folderPath is required" }],
        isError: true,
      };
    }

    const { readdirSync } = await import("fs");
    const extList = extensions?.length
      ? extensions.map((e) => (e.startsWith(".") ? e : `.${e}`))
      : [".png", ".jpg", ".jpeg", ".gif", ".webp", ".mp4"];

    const workspaceRoot = process.env.WORKSPACE_ROOT || process.cwd();
    const resolvedFolder = resolve(workspaceRoot, folderPath);

    if (!existsSync(resolvedFolder) || !(await import("fs")).statSync(resolvedFolder).isDirectory()) {
      return {
        content: [{ type: "text", text: `Error: Folder not found: ${resolvedFolder}` }],
        isError: true,
      };
    }

    const files = [];
    const folderPrefix = folderPath.replace(/^\//, "").replace(/\/$/, "");
    function collect(dir, prefix = "") {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = resolve(dir, entry.name);
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          collect(full, rel);
        } else if (extList.some((e) => entry.name.toLowerCase().endsWith(e))) {
          files.push({ fullPath: full, key: `${folderPrefix}/${rel}` });
        }
      }
    }
    collect(resolvedFolder);

    const client = getS3Client();
    if (!BUCKET_NAME) {
      return {
        content: [{ type: "text", text: "Error: R2_BUCKET_NAME not set" }],
        isError: true,
      };
    }

    const results = [];
    for (const { fullPath, key } of files) {
      try {
        const body = readFileSync(fullPath);
        const contentType = getContentType(fullPath);
        await client.send(
          new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: body,
            ContentType: contentType,
          })
        );
        const url = PUBLIC_BASE_URL ? `${PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}` : `r2://${BUCKET_NAME}/${key}`;
        results.push({ key, url });
      } catch (err) {
        results.push({ key, error: err.message });
      }
    }

    const lines = results.map((r) => (r.error ? `- ${r.key}: ERROR ${r.error}` : `- "${r.url}"  // ${r.key}`)).join("\n");
    const urlsForMoments = results.filter((r) => !r.error).map((r) => r.url);

    return {
      content: [
        {
          type: "text",
          text: `Uploaded ${results.filter((r) => !r.error).length}/${files.length} files.\n\n**URLs for moments.js pages array:**\n\`\`\`\n${urlsForMoments.map((u) => `"${u}"`).join(",\n")}\n\`\`\``,
        },
      ],
    };
  }

  return {
    content: [{ type: "text", text: `Unknown tool: ${name}` }],
    isError: true,
  };
});

function getContentType(path) {
  const ext = path.toLowerCase().slice(path.lastIndexOf("."));
  const map = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
  };
  return map[ext] || "application/octet-stream";
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
