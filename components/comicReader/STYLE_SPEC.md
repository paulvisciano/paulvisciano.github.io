# Comic Reader Style Specifications

This document defines all style values for each device type and orientation combination to prevent style drift.

## Container Styles (comic-episode-container)

| Device | Orientation | State | Width | Height | Position | Border Radius | Border | Box Shadow | Justify Content |
|--------|-------------|-------|-------|--------|----------|---------------|--------|------------|-----------------|
| Mobile | Portrait | Cover/Open | 100vw | 100dvh | fixed | 0 | none | none | center |
| Mobile | Landscape | Cover | 200px | 300px | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | - |
| Mobile | Landscape | Open | 400px | 300px | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | - |
| Tablet | Portrait | Cover/Open | auto | auto | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | center |
| Tablet | Landscape | Cover/Open | auto | auto | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | - |
| Desktop | Portrait | Cover | 400px | 600px | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | center |
| Desktop | Portrait | Open | auto | auto | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | center |
| Desktop | Landscape | Cover/Open | auto | auto | relative | 15px | 4px solid #d4c5a9 | 0 25px 80px rgba(0,0,0,0.9) | - |

**Common Container Properties:**
- background: #000
- overflow: hidden
- maxWidth: 90vw (except mobile portrait: 100vw)
- maxHeight: 90vh (except mobile portrait: 100dvh)
- display: flex
- flexDirection: column
- touchAction: auto (tablet landscape: pan-x pan-y pinch-zoom)
- pointerEvents: auto

## Cover Display Styles (comic-cover-display)

| Device | Orientation | Margin | Display | Cursor | Box Shadow | Background |
|--------|-------------|--------|---------|--------|------------|------------|
| Mobile | All | 0 auto | block | pointer/default | none | #000 |
| Tablet | Portrait | 0 auto | block | pointer/default | 0 25px 80px rgba(0,0,0,0.9) | #000 |
| Tablet | Landscape | 0 auto | block | pointer/default | 0 25px 80px rgba(0,0,0,0.9) | #000 |
| Desktop | All | 0 auto | block | pointer/default | 0 25px 80px rgba(0,0,0,0.9) | #000 |

**Common Cover Display Properties:**
- overflow: hidden
- pointerEvents: auto/none (based on isVisible)
- position: relative
- padding: 0

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

