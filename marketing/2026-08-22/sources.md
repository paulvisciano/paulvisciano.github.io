# Sources — 2026-08-22

## GitHub activity (last ~48 hours)

Heavy, focused work on the Knowledge Graph agent layer and supporting surfaces.

**paulvisciano/knowledge-graph**
- feat(ui): parse and render KG tool results in chat panel (entities/relationships/imagePaths instead of raw JSON)
- fix(api): replace bloated KG queries with user’s original message for date ranges; system-prompt guidance to keep queries short and natural
- feat(mcp): add navigate_knowledge_graph tool — flies the timeline canvas to a time period when the user asks about it
- feat(mcp): fetch all photos for date range via graph traversal API (was ~7 of 23 August photos; now all)
- fix(mcp): filter photos by EXIF date from taken_on relationships (not filename UTC)
- fix(api): bump LLM tool result truncation from 8000 to 24000 chars so month-scale data reaches the model
- Multiple earlier fixes for range queries, relative date parsing (“this month”, “last month”, bare month names), response size, and UI (mic/send merge, keyboard guards, reprocess failed jobs)

**paulvisciano/where-is-paul**
- Navigate to latest timeline entry on initial launch
- Inline crawler-redirect into moment SEO pages for subpath deployment
- Remove Claude Code link from watermark

**paulvisciano/portfolio**
- One-prompt life map post + Google Maps Timeline export guide + Android screenshot + non-tech rewrite + homepage card
- JARVIS project added to portfolio grid; various link and hero fixes

**paulvisciano/JARVIS**
- Docs polish, tablet product shot, app links pointed at paulvisciano.com/apps

Summary: The agent that lives on your machine is only useful if it can actually retrieve your full personal timeline. This window closed the gap between “vector top-k of 7 photos” and “all 23 August photos + notes + navigate the spatial canvas to that month.”

## News (reputable sources only)
1. **Comcast WiFi Motion stores home motion history in the cloud**  
   - The Verge (Aug 20): https://www.theverge.com/tech/982689/comcast-xfinity-wifi-motion-privacy-concerns-response  
   - Feature uses existing Xfinity gateways to detect motion via Wi-Fi signal disruption. Opt-in. Stores up to 7 days of motion activity in Comcast’s cloud so the app can show history. Company states data can be disclosed under valid legal process (subpoena, warrant, etc.).  
   - Supporting: https://www.theverge.com/news/981381/comcast-xfinity-shield-wifi-motion-sensing (Aug 18) and Reuters coverage of Xfinity Shield launch.

No other high-signal local-AI / WebXR / Vision Pro stories from the strict allow-list in the last 24–48 h. Comcast item used as ambient-home-surveillance contrast, not as the primary theme.

## Theme chosen
**Theme 7 — Agentic / local agents**  
Orchestrating agents on your machine instead of handing the workflow (and the data) to a cloud vendor.  

Why today: the Knowledge Graph commits are the concrete proof. A local agent that can answer “what have I been up to this month?” with the full photo set, natural date language, and a spatial fly-to is no longer theoretical. Cloud agents still require the data to leave. Local agents keep both the model and the memory on hardware you control.

Theme rotation note: 2026-08-20 used local AI stack (16 GB / zero API keys). 2026-08-21 used surveillance / surveillance pricing (theme 4). Avoided both.
