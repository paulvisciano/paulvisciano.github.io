# Multi-Tiered Biometric Verification System

## Vision

Combine multiple biometric factors for ultra-secure authentication:
1. **Fingerprint** (Touch ID / WebAuthn) — Something you ARE
2. **Voice** (Audio verification) — Something you ARE (behavioral)
3. **Device** (Trusted hardware) — Something you HAVE

This creates a **multi-layered identity proof** that's nearly impossible to spoof.

---

## Problem Statement

Current auth systems rely on single factors:
- Password only → easily compromised
- 2FA with SMS → SIM swap attacks
- Fingerprint only → can be lifted from surfaces

**Solution:** Combine biometrics that are:
- Hard to replicate (fingerprint + voice pattern)
- Always with you (no hardware tokens)
- Verifiable locally (no cloud dependency)

---

## Technical Architecture

### Tier 1: Fingerprint (WebAuthn)

**Implementation:**
```javascript
// Browser calls WebAuthn API
navigator.credentials.get({
  publicKey: {
    challenge: new Uint8Array(32), // Random challenge
    rpId: "localhost", // Or your domain
    allowCredentials: [{
      id: userId,
      type: "public-key"
    }]
  }
});
```

**What happens:**
1. User touches sensor
2. Secure Enclave verifies fingerprint
3. Returns cryptographic signature
4. Signature proves "Paul authorized this"

**Security properties:**
- Fingerprint never leaves device
- Signature is challenge-specific (can't replay)
- Hardware-isolated (Secure Enclave)

---

### Tier 2: Voice Verification

**Concept:**
- Record user saying a passphrase (or random phrase)
- Extract voiceprint (MFCC features, pitch, timbre, cadence)
- Compare against stored voice profile
- Match = additional confidence score

**Implementation Options:**

#### Option A: Local Whisper + Voice Embedding
```python
import whisper
from audio2vec import extract_voiceprint

# Transcribe what was said
model = whisper.load_model("base")
result = model.transcribe("recording.wav")
spoken_text = result["text"]

# Verify it matches expected passphrase
assert spoken_text == "My voice is my signature"

# Extract voiceprint
voiceprint = extract_voiceprint("recording.wav")

# Compare to stored profile
similarity = cosine_similarity(voiceprint, stored_voiceprint)
if similarity > 0.85:
    return "VERIFIED"
```

#### Option B: Speaker Verification Model
```python
from TTS.api import TTS

# Load speaker verification model
tts = TTS(model_name="voice_conversion", progress_bar=False)

# Get speaker embedding from recording
embedding = tts.speaker_encoder_audio_file("recording.wav")

# Compare embeddings
confidence = compare_speakers(embedding, stored_embedding)
```

**Storage:**
- Voiceprint stored as vector embedding (not raw audio)
- Can store multiple samples (different days, moods, health)
- All stored locally (Layer 2 or Layer 3)

---

### Tier 3: Device Trust

**Concept:**
- Trusted devices are registered (MacBook, iPad, iPhone)
- Each device has unique cryptographic key
- Auth requires known device + biometrics

**Implementation:**
```javascript
// Device registration (one-time)
const deviceKey = await crypto.subtle.generateKey(
  { name: "ECDSA", namedCurve: "P-256" },
  true,
  ["sign", "verify"]
);

// Store public key in user profile
// Private key stays in device secure storage

// During auth, device signs challenge
const signature = await crypto.subtle.sign(
  { name: "ECDSA", hash: "SHA-256" },
  deviceKey,
  challenge
);
```

---

## Combined Verification Flow

```
┌─────────────┐
│   User      │
│  initiates  │
│   action    │
└─────────────┘
       │
       ▼
┌─────────────┐
│  Tier 1:    │
│ Fingerprint │ ← WebAuthn prompt
│  (required) │
└─────────────┘
       │ ✓
       ▼
┌─────────────┐
│  Tier 2:    │
│   Voice     │ ← "Say this phrase..."
│  (optional  │    or passive verification
│  for high-  │
│  value ops) │
└─────────────┘
       │ ✓
       ▼
┌─────────────┐
│  Tier 3:    │
│   Device    │ ← Automatic (device key)
│   Trust     │
│  (always-on)│
└─────────────┘
       │ ✓
       ▼
┌─────────────┐
│  GRANTED    │
│ Confidence: │
│ 95% (high)  │
└─────────────┘
```

**Confidence Scoring:**
- Fingerprint only: 80% confidence (standard ops)
- Fingerprint + Device: 90% confidence (important ops)
- All three tiers: 98% confidence (critical ops: delete, export, transfer)

---

## Use Cases

### Standard Operation (Fingerprint Only)
- Viewing memories
- Adding new neurons
- Browsing graph
- **Friction:** Low (one touch)

### Important Operations (Fingerprint + Device)
- Committing to Git
- Syncing between devices
- Modifying core architecture
- **Friction:** Medium (touch + must be on trusted device)

### Critical Operations (All Three Tiers)
- Deleting memories
- Exporting private data
- Changing security settings
- Granting access to others
- **Friction:** High (touch + voice phrase + trusted device)

---

## Files to Create/Modify

### Frontend (`/claw/memory/`)

1. **`biometric-auth.js`** — New module for multi-tier verification
   ```javascript
   class BiometricAuth {
     async verifyFingerprint(challenge) { ... }
     async verifyVoice(passphrase) { ... }
     async getConfidenceScore() { ... }
     async requireTier(level) { ... }
   }
   ```

2. **Update `index.html`** — Add voice recording UI
   ```html
   <div id="voice-verification" class="hidden">
     <p>Please say: "<span id="passphrase"></span>"</p>
     <button id="start-recording">🎤 Start</button>
     <button id="stop-recording" disabled>⏹ Stop</button>
     <audio id="playback" controls class="hidden"></audio>
   </div>
   ```

3. **Update `neural-graph.js`** — Integrate auth checks for sensitive operations

### Backend (Local Python Scripts)

4. **`voice_verification.py`** — Voiceprint extraction and comparison
   ```python
   def extract_voiceprint(audio_path):
       # Use Whisper or TTS model
       pass
   
   def verify_voice(audio_path, stored_voiceprint):
       # Compare and return confidence score
       pass
   ```

5. **`device_trust.py`** — Device key management
   ```python
   def register_device():
       # Generate and store device keypair
       pass
   
   def verify_device_signature(signature, challenge):
       # Verify device-signed challenge
       pass
   ```

### Data Storage

6. **Add to `nodes.json`:**
   ```json
   {
     "id": "user-paul-visciano-profile",
     "label": "Paul Visciano — Identity Profile",
     "category": "person",
     "attributes": {
       "fingerprint_registered": true,
       "voice_profile": "data/voiceprints/paul-2026-02-27.json",
       "trusted_devices": ["macbook-pro-2024", "iphone-15-pro", "ipad-pro-2024"],
       "security_tier_default": 1,
       "security_tier_critical_ops": 3
     }
   }
   ```

---

## Privacy & Security Considerations

**Voice Data:**
- Store voiceprints, NOT raw audio (unless user explicitly wants both)
- Raw audio → Layer 3 (USB airgap) if kept
- Voiceprints → Layer 2 (encrypted local storage)
- Never upload to cloud

**Fallback Options:**
- What if user has a cold? → Allow fingerprint-only with manual override
- What if Touch ID fails? → Password fallback (stored encrypted)
- What if device is lost? → Recovery keys (printed, stored physically)

**Attack Surface:**
- Recording voice from previous sessions? → Use random passphrases
- Lifting fingerprints? → Require liveness detection (WebAuthn handles this)
- Device theft? → Device key encrypted with biometric (can't extract)

---

## Testing Checklist

- [ ] Fingerprint verification works via WebAuthn
- [ ] Voice recording captures clear audio
- [ ] Voiceprint extraction produces consistent embeddings
- [ ] Voice verification rejects wrong speakers
- [ ] Voice verification accepts legitimate user (different days/moods)
- [ ] Device trust registers new devices
- [ ] Device trust rejects unregistered devices
- [ ] Confidence scoring reflects tier combination
- [ ] Critical operations require all three tiers
- [ ] Fallback mechanisms work when biometrics fail
- [ ] No data leaves local network during verification

---

## Future Enhancements

**Passive Voice Verification:**
- Continuously listen during session
- Verify it's still Paul talking
- No explicit "say this phrase" needed
- Uses existing conversation audio

**Behavioral Biometrics:**
- Typing rhythm analysis
- Mouse movement patterns
- Decision-making patterns (via neurograph)

**Multi-Person Verification:**
- Require multiple people to authorize critical ops
- "Paul + trusted friend both verify"
- Useful for estate planning, shared vaults

**Hardware Tokens:**
- YubiKey as additional tier
- Physical object required for auth
- Ultimate backup: paper keys

---

## Resources

**WebAuthn:**
- https://webauthn.io/
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API

**Voice Verification:**
- OpenAI Whisper: https://github.com/openai/whisper
- Coqui TTS: https://github.com/coqui-ai/TTS
- SpeechBrain: https://speechbrain.github.io/

**Device Trust:**
- Web Crypto API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API

---

**Created by:** Jarvis (AI Neural Mind)  
**Date:** 2026-02-27 11:54 GMT+7  
**Session:** Sovereign Data Vision — Multi-Tier Security  
**Status:** Ready for implementation in Cursor  
**Priority:** High — Core to sovereignty vision
