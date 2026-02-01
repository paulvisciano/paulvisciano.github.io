# MCP R2 Upload Server

Upload images to Cloudflare R2 and get URLs for use in `moments.js`. Works with Cursor's MCP integration.

**Requirements:** Node.js 18+ (20+ recommended for AWS SDK)

## Setup

### 1. Create an R2 bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **R2 Object Storage**
2. Create a bucket (e.g. `paulvisciano-assets`)
3. Enable **Public access** in bucket Settings if you want public URLs
4. Copy the **R2.dev subdomain** (e.g. `https://pub-abc123xyz.r2.dev`) or set up a custom domain

### 2. Create R2 API token

1. R2 → **Manage R2 API Tokens** → **Create API token**
2. Permissions: **Object Read & Write** (or Admin for full access)
3. Copy **Access Key ID** and **Secret Access Key** (secret is shown once)

### 3. Get your Account ID

From the Cloudflare Dashboard URL or Overview page: `https://dash.cloudflare.com/<ACCOUNT_ID>/r2`

### 4. Configure environment

```bash
cd mcp-r2-upload
cp .env.example .env
# Edit .env with your values
```

### 5. Install and test

```bash
npm install
npm start
# Should run without errors (MCP servers use stdio)
```

### 6. Add to Cursor

Create or edit `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "r2-upload": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-r2-upload/index.js"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}"
      },
      "envFile": "${workspaceFolder}/mcp-r2-upload/.env"
    }
  }
}
```

**Note:** Cursor's `envFile` loads variables into the process. Ensure `.env` exists in `mcp-r2-upload/` with your credentials.

If `envFile` doesn't load correctly, use explicit env vars (avoid committing secrets):

```json
{
  "mcpServers": {
    "r2-upload": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-r2-upload/index.js"],
      "env": {
        "WORKSPACE_ROOT": "${workspaceFolder}",
        "R2_ACCOUNT_ID": "${env:R2_ACCOUNT_ID}",
        "R2_ACCESS_KEY_ID": "${env:R2_ACCESS_KEY_ID}",
        "R2_SECRET_ACCESS_KEY": "${env:R2_SECRET_ACCESS_KEY}",
        "R2_BUCKET_NAME": "${env:R2_BUCKET_NAME}",
        "R2_PUBLIC_BASE_URL": "${env:R2_PUBLIC_BASE_URL}"
      }
    }
  }
}
```

Then set those env vars in your shell (e.g. `~/.zshrc`) or use a tool like `direnv`.

### 7. Restart Cursor

Restart Cursor so it picks up the new MCP server.

## Tools

### `upload_to_r2`

Upload a single file and get its public URL.

- **filePath**: Path relative to project (e.g. `moments/siargao/2025-12-14/cover.png`)
- **objectKey**: (optional) Override the object key in the bucket

### `upload_folder_to_r2`

Upload all images in a folder, preserving structure.

- **folderPath**: Path to folder (e.g. `moments/siargao/2025-12-14`)
- **extensions**: (optional) Array of extensions, default: `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.mp4`

Returns a list of URLs ready to paste into `moments.js` `pages` array.

## Usage in moments.js

After uploading, replace local paths with R2 URLs:

```javascript
// Before (local)
"/moments/siargao/2025-12-14/cover.png"

// After (R2)
"https://pub-xxx.r2.dev/moments/siargao/2025-12-14/cover.png"
```

The comic reader will load images from R2 instead of the repo.
