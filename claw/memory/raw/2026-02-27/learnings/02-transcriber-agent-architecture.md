# Learning 02: Transcriber Agent Architecture

**Date:** Feb 27, 2026  
**Time:** 02:04-02:42 GMT+7  
**Session:** Agent build + test  

**Spoken by:** Paul Visciano + Jarvis  
**Location:** Remote collaboration  
**Captured by:** Auto-logging transcript  

---

## The Problem

Auto-logging has been broken since genesis (Feb 21):
- ✅ Step A: Archive media — worked
- ✅ Step B: Update transcript — worked
- ❌ Step C: Send to WhatsApp — **broken**

Step C failed because:
- Agent tried to use `message` tool directly
- Tool auth errors (gateway pairing issues)
- No fallback mechanism

---

## The Solution

**Transcriber Agent** — a specialized agent with 4 skills:

### Skill 1: Archive Media
- Watches `~/.openclaw/media/inbound/`
- Copies audio to `/memory/raw/YYYY-MM-DD/audio/YYYY-MM-DD-HHMMSS.ogg`
- Copies images to `/memory/raw/YYYY-MM-DD/images/YYYY-MM-DD-HHMMSS.jpg`
- Creates dated folders automatically

### Skill 2: Transcribe Audio
- Uses Whisper CLI (local, no API key)
- Supports multiple languages (en, es, bg)
- Outputs plain text transcript
- Handles transcription failures gracefully

### Skill 3: Update Transcript
- Appends to `integrated/transcript.md` (never overwrites)
- Format: `**Paul [HH:MM GMT+7]:** (audio) "transcript"`
- Includes media reference: `**Audio archived: YYYY-MM-DD-HHMMSS.ogg**`
- Creates file with header if doesn't exist

### Skill 4: Prepare Response Block (Step C)
- **Key innovation:** Doesn't send via tool
- Outputs formatted block for main agent
- Main agent includes in natural response
- No auth issues, no tool failures

---

## The Breakthrough: Natural Message Flow

**Old approach (failed):**
```bash
echo "$block" | openclaw message send --channel whatsapp --target "$NUMBER"
# Error: gateway closed (1008): pairing required
```

**New approach (works):**
```bash
# Agent outputs STEP_C block
echo "STEP_C_BLOCK_START"
echo "$block"
echo "STEP_C_BLOCK_END"

# Main agent reads and includes in natural response
# No tool call, no auth issues
```

**Why this works:**
- Main agent (Jarvis) already has WhatsApp access
- Responses flow through normal routing
- No separate tool auth needed
- Chat becomes transcript naturally

---

## File Structure

```
claw/agents/transcriber/
├── AGENT.md                 # Agent specification
├── config.json              # Configuration (uses env vars)
├── transcriber.sh           # Main execution script
├── .env.example             # Template (safe to commit)
├── .env                     # Actual config (gitignored)
└── skills/
    ├── archive-media.md     # Skill 1
    ├── transcribe-audio.md  # Skill 2
    ├── update-transcript.md # Skill 3
    └── send-to-whatsapp.md  # Skill 4 (renamed: prepare-response-block)
```

---

## Configuration

**config.json:**
```json
{
  "whatsappTarget": "${WHATSAPP_TARGET}",
  "inboundFolder": "~/.openclaw/media/inbound/",
  "archiveBase": "~/Personal/paulvisciano.github.io/memory/raw/",
  "languages": ["en", "es", "bg"],
  "pollIntervalSeconds": 5
}
```

**.env (gitignored):**
```bash
WHATSAPP_TARGET="+XXXXXXXXXXX"
```

**Privacy:** Phone number never in git. Uses env var.

---

## Execution Flow

```
1. User sends audio note via WhatsApp
   ↓
2. OpenClaw gateway receives → saves to inbound/
   ↓
3. Transcriber agent runs (polling or event-driven)
   ↓
4. Skill 1: Archive media
   - Copy to dated folder
   - Rename with timestamp
   ↓
5. Skill 2: Transcribe audio
   - Run Whisper CLI
   - Extract text
   ↓
6. Skill 3: Update transcript
   - Format entry
   - Append to transcript.md
   ↓
7. Skill 4: Prepare response block
   - Output STEP_C block
   ↓
8. Main agent reads STEP_C block
   - Includes in natural response
   - Sends via normal routing
   ↓
9. User sees formatted block in WhatsApp
   - Chat = transcript
```

---

## Test Results

**Test 1: Basic archiving**
- ✅ Audio archived correctly
- ✅ Transcript updated
- ✅ Formatted block prepared

**Test 2: Privacy**
- ✅ Phone number removed from public files
- ✅ .env gitignored
- ✅ Git history scrubbed

**Test 3: Natural flow**
- ✅ No tool auth errors
- ✅ Formatted blocks included in responses
- ✅ Chat = transcript verified

---

## Why This Matters

**1. Reliability**

Agents are more reliable than manual work:
- Consistent execution
- No forgetting steps
- Documented behavior
- Version controlled

**2. Transparency**

Everything in GitHub:
- Agent spec visible
- Skills documented
- Config auditable
- Changes traceable

**3. Reusability**

Others can:
- Fork the agent
- Customize for their needs
- Contribute improvements
- Share back

**4. Sovereignty**

You own the infrastructure:
- No dependency on external services
- Runs on your machine
- Your data stays local
- You control the code

---

## Quotes from Session

**Paul:** "Let's build that agent."

**Jarvis:** "Let's build it."

**Paul:** "We want to keep any of my private information private so right now you have my phone number committed. We don't want to do that."

**Jarvis:** "You're absolutely right. I just committed your phone number to the public repo. That's a privacy failure."

**Paul:** "Yes, yes please." (in response to natural message flow approach)

---

## Git References

**Commits:**
- `76fe3ad` — agent: transcriber agent with 4 skills
- `e4ccf4b` — security: remove hardcoded phone number
- `a743d5a` — security: scrub from git history
- `c9c59c9` — agent: Step C uses natural message flow

**Files:**
- `/claw/agents/transcriber/AGENT.md`
- `/claw/agents/transcriber/config.json`
- `/claw/agents/transcriber/transcriber.sh`
- `/claw/agents/transcriber/skills/*.md`

---

## Related Learnings

- [Learning 04: Auto-Logging System](/claw/memory/raw/2026-02-24/learnings/04-auto-logging-system.md) — Original spec
- [Learning 05: Two-Layer Memory Architecture](/claw/memory/raw/2026-02-24/learnings/05-two-layer-memory-architecture.md) — Context for private vs public

---

## Neural Integration

**Add neurons:**
- `transcriber-agent-architecture` (category: infrastructure)
- `step-c-natural-flow` (category: breakthrough)
- `agent-skill-system` (category: pattern)

**Add synapses to:**
- `auto-logging-system`
- `privacy-first-development`
- `agent-orchestration`

**Frequency:** 95 (core infrastructure)

**Status:** ✅ Documented | ⏳ Pending neural integration
