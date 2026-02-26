# Learning 03: Privacy-First Development

**Date:** Feb 27, 2026  
**Time:** 02:09-02:17 GMT+7  
**Session:** Privacy audit + remediation  

**Spoken by:** Paul Visciano + Jarvis  
**Location:** Remote collaboration  
**Captured by:** Auto-logging transcript  

---

## The Problem

During agent development, sensitive data was accidentally committed:

**What happened:**
1. Created transcriber agent config
2. Hardcoded phone number: `+XXXXXXXXXXX` (redacted)
3. Committed to git
4. Only noticed after commit

**Files affected:**
- `config.json`
- `AGENT.md`
- `send-to-whatsapp.md`
- `.env.example`
- `process-whatsapp-transcripts.sh`

---

## The Fix

**Immediate remediation:**

**Step 1: Replace with env vars**
```json
// Before
"whatsappTarget": "+XXXXXXXXXXX"  // REDACTED

// After
"whatsappTarget": "${WHATSAPP_TARGET}"
```

**Step 2: Create .env.example**
```bash
# Safe template (no real data)
WHATSAPP_TARGET="+XXXXXXXXXXX"
```

**Step 3: Add .env to gitignore**
```bash
# .gitignore
.env
```

**Step 4: Amend commits**
```bash
git add -A
git commit --amend -m "security: remove hardcoded phone number"
```

**Step 5: Scrub git history**
```bash
git filter-branch --force --tree-filter '
  find . -type f -name "*.md" -exec sed -i "" "s/XXX) XXX-XXXX/REDACTED/g" {} \;
' --prune-empty HEAD
```

---

## The Principle

**Privacy from day one, not as an afterthought.**

The three-layer architecture demands:
- **Layer 1 (Public GitHub):** No sensitive data, ever
- **Layer 2 (Local encrypted):** Private config, secrets
- **Layer 3 (USB airgap):** Cold storage backup

**Rule:** If it shouldn't be public, it never touches Layer 1.

---

## Best Practices

**1. Environment Variables for Secrets**

```bash
# .env (gitignored)
WHATSAPP_TARGET="+XXXXXXXXXXX"  # REDACTED
API_KEY="sk-..."
DATABASE_URL="postgresql://..."
```

```javascript
// Code reads from env
const target = process.env.WHATSAPP_TARGET;
```

**2. .env.example Templates**

```bash
# .env.example (safe to commit)
WHATSAPP_TARGET="+XXXXXXXXXXX"
API_KEY="your-api-key-here"
DATABASE_URL="postgresql://user:pass@localhost/db"
```

**3. Gitignore Sensitive Files**

```bash
# .gitignore
.env
*.key
*.pem
secrets/
config.local.json
```

**4. Pre-commit Hooks**

```bash
#!/bin/bash
# Check for phone numbers before commit
if git diff --cached | grep -E '\+?\d{10,}'; then
  echo "❌ Phone number detected in commit!"
  exit 1
fi
```

**5. Git History Audits**

```bash
# Search entire history for sensitive data
git log -p --all | grep -E "813.*296.*3635|18132963635"
```

---

## Why This Matters

**1. Git is Permanent**

Once committed, data exists forever in history:
- Even if you delete the file
- Even if you amend the commit
- Even if you push and delete

**Only solution:** Never commit it in the first place.

**2. Public Repos are Public**

GitHub means anyone can:
- Clone your repo
- Search commit history
- Find sensitive data
- Exploit it

**3. Privacy is a Feature**

Users trust you with their data:
- Phone numbers
- Chat transcripts
- Audio recordings
- Personal thoughts

That trust is sacred. Protect it.

---

## The Three-Layer Model

```
┌─────────────────────────────────────────┐
│  Layer 1: Public GitHub                 │
│  - Agent specs                          │
│  - Learning files                       │
│  - Neural graph (nodes, synapses)       │
│  - Documentation                        │
│                                         │
│  ❌ NO: Phone numbers, API keys, secrets│
└─────────────────────────────────────────┘
           ↓ (gitignored)
┌─────────────────────────────────────────┐
│  Layer 2: Local Encrypted               │
│  - .env files                           │
│  - Private transcripts                  │
│  - Raw audio recordings                 │
│  - Personal config                      │
│                                         │
│  ✅ YES: All sensitive data lives here  │
└─────────────────────────────────────────┘
           ↓ (manual backup)
┌─────────────────────────────────────────┐
│  Layer 3: USB Airgap                    │
│  - Cold storage backup                  │
│  - Encrypted drive                      │
│  - Physically disconnected              │
│                                         │
│  ✅ YES: Ultimate backup, offline       │
└─────────────────────────────────────────┘
```

---

## Quotes from Session

**Paul:** "We want to keep any of my private information private so right now you have my phone number committed. We don't want to do that."

**Jarvis:** "You're absolutely right. I just committed your phone number to the public repo. That's a privacy failure."

**Paul:** "None of the MD files should have my private information in them. Right now you also have committed, it's not pushed yet, which is good, but it should not even be the commits, because someone can go back and look at history and be able to reveal my phone number."

**Jarvis:** "You're absolutely right. Even in commit history is a vulnerability. Let me scrub it completely before any push happens."

---

## Git References

**Commits:**
- `e4ccf4b` — security: remove hardcoded phone number, use env vars
- `a743d5a` — security: scrub from git history
- `620d645` — security: remove from process-whatsapp-transcripts.sh

**Files Modified:**
- `/claw/agents/transcriber/config.json`
- `/claw/agents/transcriber/AGENT.md`
- `/claw/agents/transcriber/skills/send-to-whatsapp.md`
- `/claw/agents/transcriber/.env.example`
- `/claw/agents/transcriber/transcriber.sh`
- `/process-whatsapp-transcripts.sh`

---

## Related Learnings

- [Learning 13: Three-Layer Airgapped Security](/claw/memory/raw/2026-02-24/learnings/13-three-layer-airgapped-security.md) — Architecture design
- [Learning 17: Complete Transparency Architecture](/claw/memory/raw/2026-02-24/learnings/17-complete-transparency-architecture.md) — What to share vs. what to protect

---

## Neural Integration

**Add neurons:**
- `privacy-first-development` (category: value)
- `three-layer-security-model` (category: architecture)
- `git-history-audit` (category: practice)

**Add synapses to:**
- `transparency-vs-secrecy`
- `data-sovereignty`
- `agent-security`

**Frequency:** 100 (core value)
**Criticality:** core-foundation

**Status:** ✅ Documented | ⏳ Pending neural integration
