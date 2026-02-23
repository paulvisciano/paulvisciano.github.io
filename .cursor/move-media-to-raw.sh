#!/bin/bash
# Move audio/media from OpenClaw inbound to memory/raw/DATE/
# Usage: ./move-media-to-raw.sh [DATE]
# Moves all files from ~/.openclaw/media/inbound/ to memory/raw/DATE/

set -e

OPENCLAW_INBOUND="/Users/paulvisciano/.openclaw/media/inbound"
REPO="/Users/paulvisciano/Personal/paulvisciano.github.io"
DATE="${1:-$(date +%Y-%m-%d)}"

echo "📁 Media Mover — Moving audio to raw folder"
echo "==========================================="

# Validate date
if ! date -j -f "%Y-%m-%d" "$DATE" >/dev/null 2>&1; then
    echo "❌ Invalid date: $DATE"
    exit 1
fi

# Create raw folder structure
RAW_DIR="$REPO/memory/raw/$DATE"
AUDIO_DIR="$RAW_DIR/audio"
mkdir -p "$AUDIO_DIR"
echo "📂 Target: $AUDIO_DIR"

# Move all media files from inbound
if [ ! -d "$OPENCLAW_INBOUND" ]; then
    echo "⚠️  OpenClaw inbound folder not found: $OPENCLAW_INBOUND"
    exit 1
fi

count=0
for file in "$OPENCLAW_INBOUND"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Move to raw audio folder
        mv "$file" "$AUDIO_DIR/$filename"
        echo "✅ Moved: $filename"
        ((count++))
    fi
done

if [ $count -eq 0 ]; then
    echo "ℹ️  No media files to move"
else
    echo ""
    echo "✅ Moved $count file(s) to $AUDIO_DIR"
    echo ""
    echo "Audio files are now available for:"
    echo "  1. Memory sync extraction (narrative context)"
    echo "  2. Integration into comic system"
    echo "  3. Archive with daily moment"
fi
