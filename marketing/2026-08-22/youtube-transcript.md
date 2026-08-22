# YouTube transcript — 2026-08-22 (~2.5 min)

Hey — Paul here from Sci-Fi Labs.

Quick field note from this week’s commits.

A local agent is only useful if it can actually answer the question you care about. For me that question is usually some version of “what have I been up to this month?” or “show me last month.”

Until a few days ago, Knowledge Graph’s retrieval was still limited by the vector top-k. Ask about August and you’d get seven photos instead of the twenty-three that were actually in the graph. The model never saw the full set, so the answer was incomplete even though the data was sitting on disk.

We fixed that. The agent now walks the graph for the date range, pulls every photo linked by its real EXIF taken-on date, and feeds the complete set to the model. Same for notes. At the same time we added a navigate tool: when you mention a time period the canvas flies to the right bucket so you can see the spatial layout, not just a text reply.

We also stopped the language model from rewriting the user’s question into a bloated keyword salad. The original natural-language message is what gets used for the date scan. Short, human questions work better.

All of this still runs offline on a normal 16 GB laptop. Zero API keys. Unplug the network and it keeps working. That is the whole point of a local agent: the model and the memory both stay on hardware you control.

Contrast that with the rest of the stack people are being offered. This week Comcast turned millions of home routers into motion sensors that keep a week of activity history in their cloud — data that can be handed over under a subpoena. Convenient, ambient, and no longer yours the moment it leaves the house.

Knowledge Graph is the opposite bet. The published version at paulvisciano.com is a demo. The real product is the private copy that runs on your machine, answers questions about your own life, and never phones home.

If that sounds useful, the links are in the description. Thanks for watching.
