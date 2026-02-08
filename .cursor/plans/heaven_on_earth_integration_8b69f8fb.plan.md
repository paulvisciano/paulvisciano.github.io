---
name: Heaven on Earth integration
overview: Ship Comic Reader 4.0—a new version of the comic reader that is more immersive and seamlessly blends images and video. Heaven on Earth is the first episode using it; the same reader and controls (close, next/prev episode, cover nav) apply so users can move between any comic and land on this one without learning new UI. All assets (cover, pages, videos) are uploaded to the existing Cloudflare R2 bucket and rendered via R2 URLs in the app. Reusable for future immersive episodes.
todos: []
isProject: false
---

# Heaven on Earth — Comic Reader 4.0

## Approach

**Comic Reader 4.0:** This is a **new version of the existing comic book reader** (you have already iterated on the reader; this is the next step). It is more immersive and switches between images and video seamlessly. It is **not** a one-off custom page—it is the same reader experience, with a new rendering mode that will be used for Heaven on Earth and future episodes.

**Seamless integration:** When a user is navigating between comic books (e.g. next/prev episode, or clicking the timeline), they can land on Heaven on Earth and **use the same controls** they are used to: close button, next/prev episode, cover navigation. The reader stays open; only the content and layout change (classic flipbook vs. v4 immersive with video). So:

- **One entry point:** Same `handleOpenBlogPost` / comic flow; no separate "drawer type" for this moment.
- **Same chrome:** Close, next episode, previous episode, cover—all provided by the existing reader shell.
- **v4 mode:** When the opened episode is marked as Comic Reader 4.0 (e.g. `comicReaderVersion: 4` or `immersiveComic: true`), the reader renders in immersive mode: cover, then pages (spread/sequential), then optional video section with orientation-aware portrait/landscape video. Theme (e.g. cloud-white/sky for Heaven on Earth) can be per-episode or default.

**Reusable:** Future moments can use the same v4 reader by setting the same flag and providing the expected assets (cover, page-1…page-N, optional video-portrait / video-landscape).

---

## 1. Assets: Cloudflare R2 bucket, rendered via links

**All assets are uploaded to the existing Cloudflare R2 bucket** and **rendered via R2 URLs** in the app. No comic images or videos are stored in the repo for this moment; the reader loads cover, pages, and videos from the bucket (same pattern as the Siargao moment in [moments/moments.js](moments/moments.js) with `cover`, `image`, and `pages` as full R2 URLs).

**Bucket:** Use the existing bucket (public base URL e.g. `https://pub-9466bb5132e74aeba333004ad0c21f21.r2.dev`). Upload to a path like `moments/da-nang/2026-02-07/heaven-on-earth/` (or your chosen prefix).

**Upload:** Use the existing [mcp-r2-upload](mcp-r2-upload/) MCP server (`upload_to_r2` or `upload_folder_to_r2`) or your usual upload flow. Source files can live temporarily under [moments/da nang/2026-02-07/](moments/da nang/2026-02-07/) (cover, page-1, page-2, video-portrait, video-landscape; add page-3, page-4 and rename `video-landspape.mp4` to video-landscape as needed) then upload to R2 and use the returned URLs in moments.js.

**In moments.js:** The Heaven on Earth entry should provide **explicit R2 URLs** for the reader to use, e.g.:

- **cover:** `"https://pub-xxx.r2.dev/moments/da-nang/2026-02-07/heaven-on-earth/cover.png"`
- **pages:** array of 4 URLs for page-1 … page-4 (or a **baseUrl** if the reader supports building paths from it for v4).
- **videoPortraitUrl** / **videoLandscapeUrl:** full R2 URLs for the two videos (so the v4 reader can switch by orientation).

**Repo (URL routing only):** The canonical URL remains `/moments/da-nang/2026-02-07/heaven-on-earth/`. To support direct links and 404 redirect, add **only** a redirect in the repo: [moments/da-nang/2026-02-07/heaven-on-earth/index.html](moments/da-nang/2026-02-07/heaven-on-earth/index.html) that redirects to `/?path=/moments/da-nang/2026-02-07/heaven-on-earth/`. No cover, page, or video files need to be committed; they are served from R2.

---

## 2. Comic Reader 4.0 — same reader, new mode

The experience uses the **same comic reader** as other episodes: same overlay on the globe, same `body.comic-is-open`, same drawer flow. The reader is **extended** to support a **v4 / immersive mode** so that when the opened episode has `comicReaderVersion: 4` (or `immersiveComic: true`), it renders in the new layout instead of the classic Turn.js flipbook.

**Integration:** No separate component or drawer branch. In [components/globe.js](components/globe.js), comic episodes continue to open via `handleOpenBlogPost` and render **ComicReader** with the same `blogPostContent`. Inside [components/comicReader.js](components/comicReader.js) (and related modules under [components/comicReader/](components/comicReader/)), the reader checks the episode’s version: if v4, it renders the immersive layout (cover, spread pages, optional video section with orientation-aware video); otherwise it uses the existing flipbook. **Same controls everywhere:** close, next/prev episode, cover navigation—all implemented once in the reader and work for both classic and v4 episodes. Next/prev episode logic (e.g. `getNextEpisode` / `getPreviousEpisode` in core.js) already uses `isComic`; Heaven on Earth will have `isComic: true` and `comicReaderVersion: 4`, so it appears in the same list and users can navigate to/from it like any other comic.

**Theme:** Meditative, surreal “castle in the sky” (Ba Na Hills / Golden Bridge). Cloud-white background, soft sky gradients (e.g. light blue/white), generous spacing, calm typography (e.g. a clean serif or rounded sans).

- **Viewport / mobile-first:** `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, responsive layout, touch-friendly.

**Sections (order):**

1. **Cover**
  Full-bleed or large hero: `cover.png` with title “Heaven on Earth” if not already on the image.
2. **Comic pages (immersive, no Turn.js)**
  - **Spread layout:** Two-page spreads where appropriate (e.g. page-1 + page-2 as one row on desktop; page-3 + page-4 as another). On narrow viewports, stack vertically (page-1, page-2, page-3, page-4) or keep paired with horizontal scroll.  
  - Use `<img>` with `loading="lazy"`, `alt` text, and optionally `max-width: 100%` so they scale and support pinch-zoom / tap-to-expand (or a simple lightbox) if you add minimal JS.
3. **Meditation Mode**
  - **CTA:** Prominent line: “Press Play. Breathe. Watch the clouds move.”
  - **HTML5 video:** `<video>` with `video.mp4` (and optional `<source type="video/webm" src="video.webm">`) from the same folder. Controls, no autoplay (or muted autoplay if desired). Ensure `width: 100%` / responsive so it scales on mobile.
  - **Now Playing card:**  
    - **Artist — Track title** (e.g. “Mei-Ian — [track title]”; you can fill the real track name or leave a placeholder).  
    - **Caption:** “I used to meditate to this track to feel airy… her voice is celestial… perfect for this setting.”
  - **Optional:** “Enter Fullscreen Meditation” button that calls `video.requestFullscreen()` (with prefixed variants for older browsers).
4. **Navigation**
  - **Back:** “Back to Da Nang” (or “Back to Feb 7, 2026”) linking to the parent date/city on the main site, e.g. `/?path=/moments/da-nang/2026-02-07/` or `https://paulvisciano.github.io/?path=/moments/da-nang/2026-02-07/`.  
  - **Next/Prev:** Only if you want them; can link to adjacent moments via fullLink (e.g. next/prev moment in [moments.js](moments/moments.js)) or omit for v1.

**Tech:** Extend the existing [components/comicReader.js](components/comicReader.js) and [components/comicReader/](components/comicReader/) (e.g. add a v4 render path in render.js or a dedicated immersive view module). Orientation logic for video with `orientationchange` and `matchMedia('(orientation: portrait)')`. No new top-level component; no new heavy deps. **Asset URLs:** For v4 episodes, use URLs from the episode data (R2 links for cover, pages, videoPortraitUrl, videoLandscapeUrl)—not derived from fullLink. Future v4 episodes: set `comicReaderVersion: 4` and provide R2 (or absolute) URLs for assets in moments.js.

---

## 3. Timeline / registry (moments.js)

**File:** [moments/moments.js](moments/moments.js)

Add one new entry to `window.momentsInTime` (e.g. after the existing “Da Nang: Vietnam Chapter Begins” entry around line 1736), with **explicit fullLink** so the app and 404 handler resolve the path correctly:

- **id:** e.g. `"heaven-on-earth-2026-02-07"` or `"danang-heaven-on-earth-2026-02-07"`
- **title:** `"Heaven on Earth"`
- **date:** `new Date("2026-02-07T00:00:00Z")`
- **timelineHighlight:** `"Heaven on Earth"` or `"Ba Na Hills"`
- **tags:** `["meditation", "clouds", "mountains", "castle", "Mei-Ian", "sound-healing"]`
- **snippet:** `"A castle in the sky, floating on a cloud—paired with a Mei-Ian meditation track."`
- **fullLink:** `"/moments/da-nang/2026-02-07/heaven-on-earth/"`
- **location:** Same as Da Nang, e.g. `{ lat: 16.0544, lng: 108.2022, name: "Da Nang, Vietnam" }` (or “Ba Na Hills, Vietnam” if you prefer)
- **stayDuration:** 1 (or as you like)
- **formattedDuration:** `formatDuration(1)`
- **isComic: true** so it opens in the comic reader and participates in next/prev episode navigation like other comics.
- **comicReaderVersion: 4** (or **immersiveComic: true**) so the reader renders in v4 immersive mode.
- **R2 (or absolute) URLs for assets:** **cover**, **pages** (array of 4 image URLs), **videoPortraitUrl**, **videoLandscapeUrl** pointing to the Cloudflare bucket (same pattern as Siargao in moments.js). Optional: **theme** or **videoSection** for styling/captions.

**Linking and navigation:** When the user clicks "Heaven on Earth" on the timeline, the app opens the comic reader (same as any other comic). Next/Prev from another comic can land on Heaven on Earth and vice versa; the same controls apply. Deep link `/moments/da-nang/2026-02-07/heaven-on-earth/` should be matched on load and open the reader with this episode.

The deep link for “Heaven on Earth” in the timeline should be `/moments/da-nang/2026-02-07/heaven-on-earth/`.

---

## 4. Optional: redirect at parent path

If you want `/moments/da-nang/2026-02-07/` to list or redirect to this experience, you could add a minimal [moments/da-nang/2026-02-07/index.html](moments/da-nang/2026-02-07/index.html) that either redirects to `heaven-on-earth/` or shows a simple index with a link to “Heaven on Earth”. Not required for the core deliverable.

---

## 5. Summary of file and code changes


| Action     | Path / change                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Create** | `moments/da-nang/2026-02-07/heaven-on-earth/index.html` (redirect); v4 immersive render path inside [components/comicReader/](components/comicReader/)                                                                                                                           |
| **Upload** | Upload cover, page-1…page-4, video-portrait.mp4, video-landscape.mp4 to the **existing Cloudflare R2 bucket** (path e.g. `moments/da-nang/2026-02-07/heaven-on-earth/`). No asset files in repo.                                                                                 |
| **Edit**   | [moments/moments.js](moments/moments.js) — add one moment entry with `isComic: true`, `comicReaderVersion: 4`, fullLink, and **R2 URLs** for cover, pages, videoPortraitUrl, videoLandscapeUrl                                                                                   |
| **Edit**   | [components/comicReader.js](components/comicReader.js) and [components/comicReader/](components/comicReader/) — add v4 mode: detect comicReaderVersion 4, render immersive layout using **episode R2 URLs** (cover, pages, video) with same chrome (close, next/prev, cover nav) |


Comic reader is extended (v4 mode); no separate viewer component. No new heavy dependencies. Everything stays static and GitHub-Pages friendly.