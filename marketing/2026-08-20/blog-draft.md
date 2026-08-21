# Why I Keep the Knowledge Graph Offline

When I left OutSystems in March 2026, the first thing I built was not a flashy demo. It was a private memory system that never leaves the machine.

Knowledge Graph is simple on the surface: an infinite canvas of time. Photos, voice notes, and conversations float as nodes. You scroll through days and months. You speak to query or add. Underneath it sits LightRAG plus local models via llama.cpp. Whisper handles the voice. Nothing is uploaded. Nothing is rented.

That choice was deliberate. In enterprise work I spent years designing systems that assumed cloud services were the default — convenient, elastic, always available. The trade-off was invisible until you started thinking about ownership. Once the data leaves your hardware, the model, the embeddings, the retrieval layer all become someone else’s infrastructure. You can still use them, but you no longer control the boundary.

Running everything locally changes the texture of the work. Inference is slower on a laptop than on a dedicated cluster, but the latency is honest. There is no network round-trip, no rate limit, no surprise policy change. The graph is just files on disk. If the machine dies, the data is still yours to move. If I want to experiment with a new embedding model, I swap it in without asking permission.

This is not a manifesto against the cloud. Cloud infrastructure is excellent for many things. It is simply not required for a personal knowledge system that needs to remain private by default. The spatial interface — the canvas you move through rather than a chat window you talk at — only reinforces that. Memory should feel like a place you inhabit, not a service you rent.

The same principle is now shaping the next pieces of the stack. Where is Paul? already runs as a spatial life map on the web and mobile; the path toward Vision Pro and other XR surfaces is clearer when the underlying data and models stay local. The goal is not isolation. It is the freedom to decide, every day, what leaves the device and what stays.

Five months in, the quietest win is still the most important one: the models just stay put.
