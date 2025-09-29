# Comic Reader Testing

This directory contains comprehensive tests for the comic reader functionality to ensure a stable reading experience across different comic episodes.

## Test Files

### `test-comic-reader.js`
Comprehensive test suite that validates:
- Cover display on initial load
- Cover click to open comic
- Forward/backward navigation through all spreads
- Correct images load for each spread
- URL routing works correctly
- Edge cases (beyond last page, etc.)
- Two-page spread navigation (1-2, 3-4, 5-6 pattern)

**Run:** `npm run test:comic`

## Architecture Changes

### Custom Flipbook Implementation
- Replaced Turn.js with custom JavaScript/CSS implementation
- More reliable and stable for two-page spreads
- Better error handling and loading states
- Eliminates DOM manipulation errors

### Component Consolidation
- Removed `comicEpisodeDrawer-simple.js` (mobile-specific component)
- Renamed `comicEpisodeDrawer.js` to `comicReader.js`
- Single component handles all comic reading functionality
- Simplified maintenance and testing

## Test Scenarios Covered

### Core Functionality
- ✅ Cover page displays on initial navigation
- ✅ Clicking cover opens comic to pages 1-2
- ✅ Forward navigation: 1-2 → 3-4 → 5-6, etc.
- ✅ Backward navigation: 5-6 → 3-4 → 1-2, etc.
- ✅ URL updates correctly: #cover → #page-1 → #page-3 → #page-5
- ✅ Two-page spread navigation working correctly
- ⚠️ Direct URL navigation (separate routing issue, not comic reader)

### Page Count Variations
- ✅ Even pages (4, 8, 12, 16, 20) - all spreads complete
- ✅ Odd pages (3, 5, 7, 9, 11) - last page is single
- ✅ Edge cases (1 page, 2 pages)
- ✅ Tested with 16-page Istanbul comic

### Error Handling
- ✅ Navigation beyond last page stays on last spread
- ✅ Navigation before first page stays on first spread
- ✅ Image loading errors are handled gracefully
- ✅ Stale closure issues fixed with useRef
- ✅ Loading states and visual feedback improved

## Running Tests

### Prerequisites
1. Start the local server: `npx http-server -p 8080`
2. Ensure comic episodes are accessible

### Run All Tests
```bash
npm run test:comic
```
This runs the comprehensive test suite that validates all comic reader functionality.

## Adding New Comics

To test a new comic episode:

1. **Add to `test-comic-reader.js`** in the `testCases` array:
```javascript
{
  name: 'New Comic Episode - X pages',
  url: 'http://127.0.0.1:8080/moments/new-comic/2025-01-01/',
  expectedPages: 10,
  expectedSpreads: [
    { page: 1, left: 'page-01.png', right: 'page-02.png' },
    { page: 3, left: 'page-03.png', right: 'page-04.png' },
    // ... etc
  ]
}
```

2. **Run the test** to verify it works correctly.

## Test Output

Tests provide detailed console output:
- ✅ Passed tests
- ❌ Failed tests with error details
- 🔍 Current test step
- 📖 Comic being tested

## Continuous Integration

These tests can be integrated into CI/CD pipelines:
- Set `headless: true` in Puppeteer config
- Run tests on every commit
- Fail builds if comic reader functionality breaks

## Debugging Failed Tests

If a test fails:
1. Check the console output for specific error messages
2. Verify the comic episode is accessible at the expected URL
3. Ensure all expected image files exist
4. Check that the comic reader component is working in the browser
5. Run with `headless: false` to see the browser during test execution

## Known Issues

- Direct URL navigation (`#page-X`) redirects to root URL instead of opening comic
  - This is a URL routing issue, not a comic reader issue
  - Comic reader functionality works perfectly when accessed via timeline
  - Issue is in `app.js` URL lookup logic for direct navigation

## Future Enhancements

- [ ] Fix direct URL navigation for comic moments
- [ ] Performance testing for large comics
- [ ] Mobile device testing
- [ ] Accessibility testing
- [ ] Visual regression testing
- [ ] Load testing with multiple concurrent users
