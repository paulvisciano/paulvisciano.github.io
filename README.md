🗺️ My Journey 🚀

🌟 Visit the Live Site! 🌟

https://paulvisciano.github.io/

Explore my journey and passions on an interactive 3D globe—don’t miss out! 🌐

Welcome to my personal blog! 🎉 This site is a vibrant space where I share a variety of passions and experiences, from coding tips 💻 to volleyball 🏐, travel adventures ✈️, coffee shop discoveries ☕, nutrition insights 🥗, travel tips 🗺️, philosophical thoughts 🤔, personal opinions 💬, and so much more! The blog features an interactive 3D globe 🌐 powered by Globe.GL, showcasing locations tied to my posts, with a minimalist design inspired by the world-cities example. Through a series of blog posts, I’m mapping out my entire life—from birth to my current adventures and future travel plans—detailing how long I’ve stayed in each place and including photos from those locations 📸. I’m only getting started on this journey, and it will take a while to add back posts mapping my life, but I’ll be doing this by dictating notes to Grok, so stay tuned for more updates! 🕰️
Development Process 🚀
This website was brought to life through a collaborative journey with Grok, an AI assistant created by xAI, starting on May 15, 2025. Here’s how we built it step by step:

Dreaming Big & Setting Goals 🎯:

I wanted a personal blog with an interactive 3D globe to highlight locations tied to my diverse posts, mirroring the sleek style of the world-cities example on Globe.GL.
Key features included a globe with city markers, labels, a starfield background 🌟, a tag filter bar, a timeline footer, and popovers for post snippets.
The blog needed to support 13 destinations (e.g., Austin, Destin, Tokyo) to start, with plans to expand into topics like coding, volleyball, nutrition, and philosophy.


First Draft & Learning Curve 📝:

We kicked off with an initial setup using React, Tailwind CSS, and Globe.GL, pulling in resources via CDNs.
The first globe had a topographic texture, city markers, and labels, but we hit some bumps with runtime errors ("Global Error:") due to overly complex features (e.g., cloud layers).


Simplifying to Shine ✨:

To fix the errors, we streamlined the globe by removing extras and focused on matching the world-cities example exactly.
The globe was set to a dark, semi-transparent base color (#1a2526, opacity 0.8), with a topographic texture for mountains 🏔️, cyan circles (#00D4FF) for city markers, and labels right below the circles.
A starfield background was stretched to fill the entire viewport (100vh, 100%) for that cosmic vibe 🌌.


Polishing & Debugging 🛠️:

Fine-tuned the label positioning with adjustments to place them directly below the circles.
Made sure the hover effect for labels matched the example (a semi-transparent background on hover).
Added error handling to keep things stable.
Organized the code into modular files for clarity.


Final Touches & Ready to Share 🎈:

Bundled everything into a ZIP file structure for easy sharing.
Added a .gitignore file to keep my Git repository clean by excluding temporary files.
Hosted the site on GitHub Pages to share it with the world 🌍.


Mapping My Life’s Journey 🗺️:

Expanded the blog to include a series of posts mapping out my entire life—from birth to the present and future travel plans.
Added details on how long I stayed in each place, along with photos from those locations 📸, integrating these events into the 3D globe and timeline footer.



Features 🌟

Interactive 3D Globe 🌐: A sleek globe with a dark, semi-transparent base, topographic texture, and cyan city markers, perfectly matching the world-cities example.
City Markers & Labels 📍: Each location (e.g., Austin, Tokyo) is marked with a cyan circle (#00D4FF) and a label below, with a hover effect showing a semi-transparent background.
Starfield Background 🌌: A starry backdrop fills the entire viewport, creating an immersive experience.
Tag Filter Bar 🏷️: A bar at the bottom of the main content area (z-index 10) lets you filter posts by tags (e.g., "beach volleyball", "coffee").
Timeline Footer ⏳: A fixed footer (z-index 20) shows a horizontal timeline of posts, with clickable entries to zoom to locations.
Popovers 💬: Click a marker or timeline entry to zoom the globe to the city (altitude 0.1) and see a popover (z-index 40) with the post title, snippet, and a link to the full post.

Disclaimer ⚠️
This project, including all code, structure, and documentation, was generated with the assistance of Grok, an AI developed by xAI, as of 07:11 PM MDT on Thursday, May 15, 2025. The development process involved iterative refinements to match the world-cities example, with Grok providing code, debugging assistance, and project setup guidance.
Future Enhancements 🌈

Add More Posts 📝: Expand the blog with coding tips 💻, volleyball updates 🏐, coffee shop reviews ☕, nutrition advice 🥗, travel tips 🗺️, philosophical thoughts 🤔, and personal opinions 💬.
Include Photos 📸: Add photos for destinations like Destin, Breckenridge, and Miami in the timeline.
SEO Optimization 🔍: Add meta tags to index.html for better discoverability:<meta name="description" content="Explore my personal blog with coding tips, volleyball updates, travel adventures, coffee shops, nutrition, philosophical thoughts, and more, featuring an interactive 3D globe powered by Globe.GL! 🌍">
<meta name="keywords" content="personal blog, coding tips, volleyball, travel, coffee shops, nutrition, philosophy, 3D interactive globe, Globe.GL, Austin, Destin, Tokyo">


Share the Blog 📢: Share the GitHub Pages URL with friends, communities, or on social media to reach a wider audience.

For any issues or further enhancements, please refer to the development process above or contact the project maintainer. Happy exploring! 🚀
