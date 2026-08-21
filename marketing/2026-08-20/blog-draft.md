# How I Run Local AI on a 16GB Laptop

Since day one the constraint was simple: it had to run on a normal 16GB laptop. No high-end GPU. No cloud credits. No rented inference.

Most local AI setups quietly assume more hardware or still lean on external services. I started the other way around. The entire stack — model, retrieval, voice, and spatial interface — had to live inside the machine I already owned.

Knowledge Graph is the first result of that decision. An infinite canvas of time where photos, voice notes, and conversations float as nodes. You scroll through days and months. You speak to query or add. Underneath it sits LightRAG plus quantized models via llama.cpp. Whisper handles the voice. Everything stays on disk.

The 16GB limit forced better choices. Quantization became non-negotiable. Context windows had to be managed carefully. Embedding and retrieval needed to be efficient enough that the laptop stayed usable for other work at the same time. Those constraints shaped the architecture more than any abstract preference for privacy.

The payoff is ownership. There is no network round-trip, no rate limit, no surprise policy change. If the machine dies, the data is still yours to move. If I want to try a different model, I swap the files and restart. The spatial interface — a canvas you move through rather than a chat window you talk at — only works cleanly when the underlying system is this self-contained.

This is not a claim that every AI workload belongs on a laptop. It is a practical demonstration that a personal knowledge system and spatial memory layer can. The same principle now guides the rest of the stack, including the path toward Vision Pro surfaces.

Five months in, the quietest win is still the most useful one: the models just stay put, and they fit on hardware most people already have.
