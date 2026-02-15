# Mobile Viewport Testing Guide

## The Problem

Chrome DevTools device mode simulates the **full viewport** (no browser chrome). On physical mobile devices, the browser URL bar and navigation UI take up ~50–100px, so content that looks correct in the simulator can appear shifted or cut off on real devices.

## Simulating Physical Device in DevTools

Chrome DevTools does not simulate the URL bar. Use these workarounds to approximate physical device behavior:

### Option 1: Custom Device with Reduced Height (Recommended)

Create a custom device that subtracts typical mobile browser chrome from the viewport height:

1. Open DevTools → **Toggle device toolbar** (or `Cmd+Shift+M` / `Ctrl+Shift+M`)
2. Click the **Dimensions** dropdown → **Edit**
3. Click **Add custom device**
4. Add a device, e.g.:
   - **Name:** `iPhone 14 Pro (with URL bar)`
   - **Width:** `393` (or your target device width)
   - **Height:** `~700` (iPhone 14 Pro CSS height is 844px; subtract ~100–140px for URL bar + bottom nav)
5. Save and select it from the Dimensions dropdown

**Typical height reductions for common devices:**

| Device           | Full CSS Height | Simulated Height (with chrome) |
|------------------|-----------------|--------------------------------|
| iPhone 14 Pro    | 844px           | 700–750px                      |
| iPhone SE        | 667px           | 580–620px                      |
| Pixel 7          | 915px           | 780–820px                      |
| Samsung Galaxy   | 915px           | 780–820px                      |

### Option 2: Responsive Mode + Manual Height

1. Switch to **Responsive** in the Dimensions dropdown
2. Set width to your target (e.g. `393` for iPhone 14 Pro)
3. **Manually reduce the height** by dragging the bottom handle or typing a smaller value (e.g. `700` instead of `844`)

### Option 3: Blisk Browser

[Blisk](https://blisk.io/) is a Chromium-based browser with built-in mobile toolbar simulation for some devices. Useful for more accurate previews without custom setup.

## Viewport Units Reference

| Unit   | Meaning                                      | When to use                          |
|--------|----------------------------------------------|--------------------------------------|
| `100vh` | Legacy; often equals large viewport on mobile | Avoid for full-height mobile layouts |
| `100dvh` | Dynamic; changes as URL bar shows/hides       | General use, but can cause shift on load |
| `100svh` | Small viewport; browser UI visible            | **Mobile full-height** – fits visible area on load |
| `100lvh` | Large viewport; browser UI hidden             | When URL bar is collapsed (e.g. after scroll) |

For full-height overlays and containers on mobile, we use `100svh` so content fits within the visible area when the URL bar is showing.

## Quick Checklist Before Deploying Mobile Changes

- [ ] Test in DevTools with **reduced height** (Option 1 or 2 above)
- [ ] Verify close button, nav bar, and content are fully visible
- [ ] Test on a physical device when possible
- [ ] Use Remote Debugging (Chrome → `chrome://inspect`) for real-device debugging
