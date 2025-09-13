# Rich Backstory Content Guide

The interactive episode template now supports rich HTML content in backstories, allowing you to embed videos, maps, image galleries, and interactive elements.

## Content Types Supported

### 1. Plain Text (Legacy)
```json
{
  "backstory": "This is plain text with **bold** formatting and line breaks.\n\nNew paragraphs are created with double newlines."
}
```

### 2. HTML Content
```json
{
  "backstory": "<p>This is <strong>HTML content</strong> with full formatting support.</p>\n\n<p>You can include any HTML tags within the backstory.</p>"
}
```

### 3. Image Galleries
```json
{
  "backstory": "<div class=\"image-gallery\">\n  <img src=\"2025/episode-15/cp-1.png\" alt=\"Image 1\" class=\"gallery-image\">\n  <img src=\"2025/episode-15/cp-2.png\" alt=\"Image 2\" class=\"gallery-image\">\n  <img src=\"2025/episode-15/cp-3.png\" alt=\"Image 3\" class=\"gallery-image\">\n</div>\n\n<p>Images in galleries are clickable and will zoom on tap.</p>"
}
```

### 4. YouTube Videos
```json
{
  "backstory": "<p>Check out this video from the experience:</p>\n\n<div class=\"video-embed\">\n  <h4 class=\"media-title\">Rooftop Experience</h4>\n  <div class=\"video-wrapper\">\n    <iframe src=\"https://www.youtube.com/embed/VIDEO_ID\" title=\"Video Title\" frameborder=\"0\" allowfullscreen></iframe>\n  </div>\n</div>\n\n<p>Videos are embedded and playable within the backstory.</p>"
}
```

### 5. Google Maps Links
```json
{
  "backstory": "<p>Here's the location we visited:</p>\n\n<div class=\"map-embed\">\n  <h4 class=\"media-title\">Tichuca Rooftop Bar</h4>\n  <div class=\"map-wrapper\">\n    <a href=\"https://www.google.com/maps/search/?api=1&query=Tichuca+Rooftop+Bar+Bangkok\" target=\"_blank\" rel=\"noopener\">\n      <div style=\"display: flex; align-items: center; justify-content: center; height: 100%; background: #333; border-radius: 8px; color: white;\">\n        <div style=\"text-align: center;\">\n          <div style=\"font-size: 2rem; margin-bottom: 8px;\">🗺️</div>\n          <div>Tichuca Rooftop Bar</div>\n          <div style=\"font-size: 0.7rem;\">Tap to view on Google Maps</div>\n        </div>\n      </div>\n    </a>\n  </div>\n</div>"
}
```

### 6. Links and External Content
```json
{
  "backstory": "<p>Check out these resources:</p>\n\n<ul>\n  <li><a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">External Link</a></li>\n  <li><a href=\"https://paulvisciano.github.io/moments/urban-runner-episode-13-2025-09-09\" target=\"_blank\" rel=\"noopener\">Related Episode</a></li>\n</ul>\n\n<p>Links open in new tabs and have hover effects.</p>"
}
```

## Available CSS Classes

### Media Containers
- `.video-embed` - Container for video content
- `.map-embed` - Container for map content
- `.image-gallery` - Grid container for multiple images

### Media Elements
- `.media-title` - Title for media sections
- `.video-wrapper` - Wrapper for video iframes
- `.map-wrapper` - Wrapper for map content
- `.gallery-image` - Individual images in galleries

### Text Formatting
- `.backstory-content-inner` - Main content container
- Standard HTML tags: `<p>`, `<strong>`, `<em>`, `<a>`, `<ul>`, `<ol>`, `<li>`, etc.

## Best Practices

1. **Mobile-First**: All content is optimized for mobile viewing
2. **Performance**: Images should be optimized for web
3. **Accessibility**: Always include alt text for images
4. **External Links**: Use `target=\"_blank\"` and `rel=\"noopener\"` for external links
5. **Responsive**: Media content automatically scales to fit the backstory overlay

## Example: Complete Rich Backstory

```json
{
  "id": 5,
  "title": "Rooftop Ascent",
  "backstory": "<p>Tichuca Rooftop Bar sits sky‑high on the <strong>46th floor of the T‑One Building</strong> on Soi Sukhumvit 40.</p>\n\n<div class=\"image-gallery\">\n  <img src=\"2025/episode-15/cp-5.png\" alt=\"Rooftop View\" class=\"gallery-image\">\n  <img src=\"2025/episode-15/cp-6.png\" alt=\"Atmosphere\" class=\"gallery-image\">\n</div>\n\n<p>The crowd is stylish, photo‑ready, expecting spectacle. But the setting amplified the moment.</p>\n\n<p><a href=\"https://www.tichucarooftop.com\" target=\"_blank\" rel=\"noopener\">Visit Tichuca</a> | <a href=\"https://goo.gl/maps/example\" target=\"_blank\" rel=\"noopener\">Directions</a></p>",
  "image": "2025/episode-15/cp-5.png"
}
```

This creates a rich, interactive backstory with images, links, and formatted text that enhances the storytelling experience.
