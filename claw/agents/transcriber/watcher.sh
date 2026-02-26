#!/bin/bash
# Transcriber Agent — File Watcher
# Watches inbound folder and triggers agent on new files

set -e

INBOUND_FOLDER="$HOME/.openclaw/media/inbound"
AGENT_SCRIPT="$(dirname "$0")/transcriber.sh"
PIDFILE="/tmp/transcriber-watcher.pid"
LOGFILE="$(dirname "$0")/watcher.log"
STATEFILE="$(dirname "$0")/.watcher-state"

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
# Use a simple file list instead of associative array (macOS bash 3.2 compat)
if [ -f "$STATEFILE" ]; then
    cp "$STATEFILE" "${STATEFILE}.old"
fi
ls -1 "$INBOUND_FOLDER" 2>/dev/null > "$STATEFILE" || touch "$STATEFILE"

EXISTING_COUNT=$(wc -l < "$STATEFILE")
log "Found $EXISTING_COUNT existing files (will skip)"

# Watch for new files
while true; do
    # Get current file list
    ls -1 "$INBOUND_FOLDER" 2>/dev/null > "${STATEFILE}.new" || touch "${STATEFILE}.new"
    
    # Find new files (in new but not in old state)
    NEW_FILES=$(comm -23 "${STATEFILE}.new" "$STATEFILE" 2>/dev/null || true)
    
    if [ -n "$NEW_FILES" ]; then
        while IFS= read -r filename; do
            if [ -n "$filename" ]; then
                # New file detected!
                log "📁 New file detected: $filename"
                
                # Wait a moment for file to finish writing
                sleep 1
                
                # Run the agent
                log "▶️  Running transcriber agent..."
                bash "$AGENT_SCRIPT" >> "$LOGFILE" 2>&1 && log "✅ Agent completed" || log "❌ Agent failed"
            fi
        done <<< "$NEW_FILES"
        
        # Update state
        mv "${STATEFILE}.new" "$STATEFILE"
    else
        # No new files, clean up temp file
        rm -f "${STATEFILE}.new"
    fi
    
    # Check every 3 seconds
    sleep 3
done
