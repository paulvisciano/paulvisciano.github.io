# Skill: Prepare Response Block (Step C)

**Purpose:** Prepare formatted transcript block for inclusion in natural agent response.

---

## Input

- `speaker`: "Paul" or "Jarvis"
- `timestamp`: "HH:MM GMT+7"
- `mediaType`: "audio" | "image" | "text"
- `mediaRef`: "2026-02-27-HHMMSS.ogg" (archived filename)
- `content`: Transcript text or message text

---

## Process

The agent prepares a formatted block and outputs it to stdout or a queue file. The main agent (Jarvis) then includes this block in its natural response message.

```bash
# Format the block
if [ "$MEDIA_TYPE" = "audio" ]; then
    BLOCK="**$SPEAKER [$TIMESTAMP GMT+7]:** (audio) \"$CONTENT\"

**Audio archived: $MEDIA_REF**
"
elif [ "$MEDIA_TYPE" = "image" ]; then
    BLOCK="**$SPEAKER [$TIMESTAMP GMT+7]:** (image) [Image attached]

**Image archived: $MEDIA_REF**
"
else
    BLOCK="**$SPEAKER [$TIMESTAMP GMT+7]:** $CONTENT
"
fi

# Output for main agent to include in response
echo "$BLOCK"
# Or write to queue file for main agent to read
echo "$BLOCK" >> /tmp/transcriber-queue.md
```

---

## Output

- Formatted block ready for inclusion in natural response
- Chat becomes the visible transcript (via normal message flow)

---

## Why This Matters

This is **Step C** — reimagined.

Instead of a separate tool call that might fail:
- Agent prepares the formatted block
- Main agent (Jarvis) includes it naturally in response
- No auth issues, no tool failures
- Chat IS the transcript, through normal conversation flow

**Without Step C:**
- Transcript exists only on disk
- User can't see logging happening

**With Step C (natural flow):**
- WhatsApp chat IS the transcript
- User sees real-time archiving
- System is transparent + verifiable
- No separate tool auth needed

---

**Created:** Feb 27, 2026  
**Updated:** Feb 27, 2026 (simplified to natural message flow)  
**Agent:** Transcriber  
**Purpose:** Fix auto-logging Step C by integrating with normal conversation flow
