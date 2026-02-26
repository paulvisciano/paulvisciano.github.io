# Skill: Send to WhatsApp

**Purpose:** Send formatted transcript block back to WhatsApp (Step C — the missing piece).

---

## Input

- `channel`: "whatsapp"
- `target`: `${WHATSAPP_TARGET}` (set in .env file — never commit your number)
- `message`: Formatted transcript block (from update-transcript skill)

---

## Process

```bash
# Using OpenClaw message tool (reads target from env var)
openclaw message send \
    --channel whatsapp \
    --target "$WHATSAPP_TARGET" \
    --message "$FORMATTED_BLOCK"
```

Or via API:
```javascript
await openclaw.message.send({
    channel: 'whatsapp',
    target: process.env.WHATSAPP_TARGET,
    message: formattedBlock
});
```

---

## Output

- Message sent to WhatsApp
- Chat becomes the visible transcript
- Returns: Message ID + delivery status

---

## Why This Matters

This is **Step C** — the piece that's been broken since genesis (Feb 21).

Without Step C:
- Transcript exists only on disk
- User can't see logging happening
- No verification that system is working

With Step C:
- WhatsApp chat IS the transcript
- User sees real-time archiving
- System is transparent + verifiable

---

**Created:** Feb 27, 2026  
**Agent:** Transcriber  
**Purpose:** Fix the auto-logging gap that's been broken since day one
