#!/bin/bash
# Transcriber Agent — File Watcher
# Watches inbound folder and triggers agent on new files

set -e

INBOUND_FOLDER="$HOME/.openclaw/media/inbound"
AGENT_SCRIPT="$(dirname "$0")/transcriber.sh"
PIDFILE="/tmp/transcriber-watcher.pid"
LOGFILE="$(dirname "$0")/watcher.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOGFILE"
}

# Check if already running
if [ -f "$PIDFILE" ]; then
    OLD_PID=$(cat "$PIDFILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        log "Watcher already running (PID: $OLD_PID)"
        exit 1
    fi
fi

# Store PID
echo $$ > "$PIDFILE"

log "🎙️  Transcriber watcher starting..."
log "Watching: $INBOUND_FOLDER"
log "Agent: $AGENT_SCRIPT"

# Track existing files (so we don't process old ones on startup)
declare -A EXISTING_FILES
for f in "$INBOUND_FOLDER"/*; do
    if [ -f "$f" ]; then
        EXISTING_FILES["$(basename "$f")"]=1
    fi
done

log "Found ${#EXISTING_FILES[@]} existing files (will skip)"

# Watch for new files
while true; do
    for f in "$INBOUND_FOLDER"/*; do
        if [ -f "$f" ]; then
            filename=$(basename "$f")
            if [ -z "${EXISTING_FILES[$filename]}" ]; then
                # New file detected!
                log "📁 New file detected: $filename"
                
                # Wait a moment for file to finish writing
                sleep 1
                
                # Run the agent
                log "▶️  Running transcriber agent..."
                bash "$AGENT_SCRIPT" >> "$LOGFILE" 2>&1 || log "❌ Agent failed"
                
                # Mark as processed
                EXISTING_FILES[$filename]=1
            fi
        fi
    done
    
    # Check every 3 seconds
    sleep 3
done
