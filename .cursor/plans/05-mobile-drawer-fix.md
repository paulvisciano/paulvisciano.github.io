# Plan: Mobile Drawer Fix (UI Responsiveness)

## Problem
On mobile (Android), the bottom drawer panel (that shows node details, filters, or related information) appears **completely empty**. 

Likely causes:
1. CSS/layout breaking on small screens
2. Drawer content not rendering in mobile viewport
3. Hidden by default on mobile with no toggle
4. Content overflow or z-index issues
5. Touch event handlers not triggering drawer open

Impact: Users on mobile can't see node details, can't apply filters, can't navigate. The experience is half-broken.

---

## Solution
Fix the mobile drawer to display content properly and be accessible via touch.
