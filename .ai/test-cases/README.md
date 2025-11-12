# Test Cases

This folder contains test cases for the moments site functionality.

## Test Suite

### Test 1: Root Navigation
**Test**: Navigate to root URL (`/`) should redirect to and display the current moment (where the user is currently located).

**Expected Behavior**: 
- Page loads and shows timeline
- Displays the current moment based on today's date
- Currently: Ubud (Nov 7-15, 2025)

**Status**: ✅ PASSING

---

### Test 2: Timeline Click Updates URL
**Test**: Clicking on a timeline entry should update the URL correctly.

**Example**: Clicking on "Lisbon Work Trip" should update URL to `/moments/lisbon/2025-10-12/`

**Expected Behavior**:
- URL updates to the correct format: `/moments/{city}/{YYYY-MM-DD}/`
- Moment is displayed in the overlay/map
- Timeline entry is highlighted

**Status**: ✅ PASSING

---

### Test 3: Direct URL Navigation
**Test**: Navigating directly to a moment URL should land on that moment in the timeline.

**Example**: Navigate to `https://paulvisciano.github.io/moments/lisbon/2025-10-12/` directly

**Expected Behavior**:
- URL redirects to `/?path=/moments/lisbon/2025-10-12/`
- Moment is correctly identified and displayed
- Timeline scrolls to and highlights the correct moment
- Map zooms to the correct location

**Status**: ✅ PASSING

---

### Test 4: Comic Book Cover and First Pages
**Test**: Navigating to a comic book URL should show the cover, and clicking the cover should open the first 2 pages.

**Example**: Navigate to `https://paulvisciano.github.io/moments/miami/2025-10-06/`

**Expected Behavior**:
1. Direct navigation to comic URL shows the comic book cover
2. Cover is clickable and displays "🖱️ Click to open comic book" (desktop) or "📖 Tap to start reading" (mobile)
3. Clicking/tapping the cover opens the comic book to pages 1 and 2 (two-page spread on desktop)
4. Navigation controls are available (previous/next buttons)
5. Page indicator shows current page (e.g., "1 / 15")

**Status**: ✅ PASSING

**Notes**:
- Cover should be displayed first (not auto-opening to pages)
- Desktop shows two-page spread (pages 1 and 2 side by side)
- Mobile shows single page at a time
- Navigation should allow going back to cover from first page

---

## Running Tests

These tests can be run manually in the browser:

1. **Test 1**: Navigate to `https://paulvisciano.github.io/`
2. **Test 2**: Click any timeline entry and verify URL updates
3. **Test 3**: Navigate directly to `https://paulvisciano.github.io/moments/lisbon/2025-10-12/`
4. **Test 4**: Navigate to `https://paulvisciano.github.io/moments/miami/2025-10-06/` and click the cover

## Test History

- **2025-01-XX**: Initial test suite created
  - All tests passing on live site
  - Tests verified on localhost and production

