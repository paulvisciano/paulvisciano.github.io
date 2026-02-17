# Comic Reader Style Specifications

This document defines all style values for each device type and orientation combination to prevent style drift.

## Container Styles (comic-episode-container)

### Cover State

| Device | Orientation | Width | Height |
|--------|-------------|-------|--------|
| Mobile | Portrait | 200px | 300px |
| Mobile | Landscape | 200px | 300px |
| Tablet | Portrait | 400px | 600px |
| Tablet | Landscape | 400px | 600px |
| Desktop | Landscape | 400px | 600px |

### Open State

| Device | Orientation | Width | Height |
|--------|-------------|-------|--------|
| Mobile | Portrait | 100vw | 100svh |
| Mobile | Landscape | 70vw | 90svh |
| Tablet | Portrait | 100vw | 100svh |
| Tablet | Landscape | 800px | 600px |
| Desktop | Landscape | 100% (max 1200px) | 700px (medium view) |

**Desktop progression:** Cover → Medium (700px height) → Fullscreen (optional via ⛶ button)

**Fullscreen Mode (when comic is open):**
- Desktop: 100% × 100% (expands from medium view)
- Tablet Landscape: 85% width, 90% height (overrides open dimensions)
- Portrait orientations (Mobile & Tablet): Already use 100vw/100svh by default, no change in fullscreen
- Cover state: Uses static dimensions even in fullscreen

**Common Container Properties:**
- background: #000
- overflow: hidden
- maxWidth: 90vw (except mobile portrait: 100vw, desktop: none)
- maxHeight: 90vh (except mobile portrait: 100svh, desktop: none)
- display: flex
- flexDirection: column
- touchAction: auto (tablet landscape: pan-x pan-y pinch-zoom)
- pointerEvents: auto

**Note:** Tablet and Desktop share the same dimensions (400px x 600px for cover, 800px x 600px for open) to ensure consistency across larger screens.

**Viewport units:** Mobile and tablet portrait use `100svh` (small viewport height) so content fits within the visible area when the browser URL bar is showing on physical devices. See `MOBILE_VIEWPORT_TESTING.md` for simulation tips.

## Cover Display Styles (comic-cover-display)

| Device | Orientation | Margin | Display | Cursor | Box Shadow | Background |
|--------|-------------|--------|---------|--------|------------|------------|
| Mobile | All | 0 auto | block | pointer/default | none | #000 |
| Tablet | All | 0 auto | block | pointer/default | 0 25px 80px rgba(0,0,0,0.9) | #000 |
| Desktop | All | 0 auto | block | pointer/default | 0 25px 80px rgba(0,0,0,0.9) | #000 |

**Common Cover Display Properties:**
- overflow: visible
- pointerEvents: auto/none (based on isVisible)
- position: relative
- padding: 0
- width: (inherits from parent container)
- height: (inherits from parent container)

## Cover Image Styles

| Device | Orientation | objectFit | objectPosition |
|--------|-------------|-----------|----------------|
| Mobile | All | contain | center |
| Tablet | Portrait | contain | center |
| Tablet | Landscape | cover | center |
| Desktop | Portrait | contain | center |
| Desktop | Landscape | cover | center |

**Common Cover Image Properties:**
- width: 100%
- height: 100%
- display: block
- margin: 0
- padding: 0
- transition: transform 0.3s ease
- verticalAlign: top

## Flipbook Styles

| Device | Orientation | Width | Height | Margin | Border Radius | Display |
|--------|-------------|-------|--------|--------|---------------|---------|
| Mobile | Portrait | 100vw | calc(100% - 60px) | 0 | 0 | flex/none |
| Mobile | Landscape | 100% | 100% | 0 | 0 | flex/none |
| Tablet | Portrait | 500px | 750px | 0 auto | 10px | flex/none |
| Tablet | Landscape | 1000px | 750px | 0 auto | 10px | flex/none |
| Desktop | Portrait | auto | auto | 0 auto | 10px | flex/none |
| Desktop | Landscape | 800px | 600px | 0 auto | 10px | flex/none |

**Common Flipbook Properties:**
- background: #000
- overflow: hidden
- position: relative
- display: showCover || isLoading ? 'none' : 'flex'

## Page Layout

| Device | Orientation | Pages Shown | Navigation Increment |
|--------|-------------|-------------|---------------------|
| Mobile | Portrait | 1 | +1 / -1 |
| Mobile | Landscape | 2 | +2 / -2 |
| Tablet | Portrait | 1 | +1 / -1 |
| Tablet | Landscape | 2 | +2 / -2 |
| Desktop | Portrait | 1 | +1 / -1 |
| Desktop | Landscape | 2 | +2 / -2 |





