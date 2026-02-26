#!/bin/bash
# Transcriber Agent — Main Execution Script
# Runs on every new WhatsApp message to auto-log media + transcripts

set -e

# Load environment variables (if .env exists)
if [ -f "$(dirname "$0")/.env" ]; then
    set -a
    source "$(dirname "$0")/.env"
    set +a
fi

# Configuration
INBOUND_FOLDER="$HOME/.openclaw/media/inbound"
ARCHIVE_BASE="${ARCHIVE_BASE:-$HOME/Personal/paulvisciano.github.io/memory/raw}"
TODAY=$(date +%Y-%m-%d)
TIMEZONE="Asia/Bangkok"
WHATSAPP_TARGET="${WHATSAPP_TARGET:-$OPENCLAW_WHATSAPP_TARGET}"

# Create today's folders
mkdir -p "$ARCHIVE_BASE/$TODAY"/{audio,images,integrated}

TRANSCRIPT_FILE="$ARCHIVE_BASE/$TODAY/integrated/transcript.md"

# Initialize transcript if it doesn't exist
if [ ! -f "$TRANSCRIPT_FILE" ]; then
    echo "# WhatsApp transcript — $(date +%B\ %d,\ %Y)" > "$TRANSCRIPT_FILE"
    echo "" >> "$TRANSCRIPT_FILE"
fi

# Function: Archive and process audio
process_audio() {
    local audio_file="$1"
    local timestamp=$(stat -f "%Sm" -t "%H%M" "$audio_file")
    local time_seconds=$(stat -f "%Sm" -t "%H%M%S" "$audio_file")
    local archived_name="$TODAY-$time_seconds.ogg"
    
    # Check file size (skip if too small = corrupted)
    local file_size=$(stat -f%z "$audio_file" 2>/dev/null || echo "0")
    if [ "$file_size" -lt 10000 ]; then
        echo "⚠️  Skipping $audio_file (only $file_size bytes - likely corrupted)"
        return 1
    fi
    
    # Copy to archive
    cp "$audio_file" "$ARCHIVE_BASE/$TODAY/audio/$archived_name"
    
    # Transcribe using OpenClaw's whisper skill (local STT)
    local transcript=""
    transcript=$(openclaw whisper "$audio_file" 2>/dev/null | head -1 | tr '\n' ' ' | head -c 2000)
    
    # Fallback if empty
    if [ -z "$transcript" ] || [[ "$transcript" == *"[Transcription"* ]]; then
        transcript="[Transcription unavailable - gateway media issue]"
    fi
    
    # Format transcript block
    local block="**Paul [$timestamp GMT+7]:** (audio) \"$transcript\"

**Audio archived: $archived_name**
"
    
    # Append to transcript
    echo "$block" >> "$TRANSCRIPT_FILE"
    echo "---" >> "$TRANSCRIPT_FILE"
    
    # Output for Step C (natural response inclusion)
    echo "STEP_C_BLOCK_START"
    echo "$block"
    echo "STEP_C_BLOCK_END"
    
    echo "✓ Processed audio: $archived_name ($(echo $transcript | wc -w | tr -d ' ') words)"
}

# Function: Archive images
process_image() {
    local image_file="$1"
    local timestamp=$(stat -f "%Sm" -t "%H%M" "$image_file")
    local time_seconds=$(stat -f "%Sm" -t "%H%M%S" "$image_file")
    local filename=$(basename "$image_file")
    local archived_name="$TODAY-$time_seconds-${filename%.*}.jpg"
    
    # Copy to archive
    cp "$image_file" "$ARCHIVE_BASE/$TODAY/images/$archived_name"
    
    # Format image block
    local block="**Paul [$timestamp GMT+7]:** (image) [Image attached]

**Image archived: $archived_name**
"
    
    # Append to transcript
    echo "$block" >> "$TRANSCRIPT_FILE"
    echo "---" >> "$TRANSCRIPT_FILE"
    
    # Output for Step C
    echo "STEP_C_BLOCK_START"
    echo "$block"
    echo "STEP_C_BLOCK_END"
    
    echo "✓ Processed image: $archived_name"
}

# Main: Process new files in inbound folder
echo "🎙️  Transcriber Agent starting..."
echo "Watching: $INBOUND_FOLDER"
echo "Archive: $ARCHIVE_BASE/$TODAY/"
echo ""

# Process all unprocessed audio files
for audio in "$INBOUND_FOLDER"/*.ogg; do
    if [ -f "$audio" ]; then
        # Check if already archived (by comparing with files in archive)
        filename=$(basename "$audio")
        if ! ls "$ARCHIVE_BASE/$TODAY/audio/"*"$filename"* &>/dev/null; then
            process_audio "$audio" || true  # Continue even if one fails
        fi
    fi
done

# Process all unprocessed images
for image in "$INBOUND_FOLDER"/*.jpg "$INBOUND_FOLDER"/*.png; do
    if [ -f "$image" ]; then
        filename=$(basename "$image")
        if ! ls "$ARCHIVE_BASE/$TODAY/images/"*"$filename"* &>/dev/null; then
            process_image "$image"
        fi
    fi
done

echo ""
echo "✅ Transcriber Agent complete"
