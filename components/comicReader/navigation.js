// ============================================================================
// Device-Specific Navigation Logic
// ============================================================================

/**
 * Calculate next page number based on orientation
 * Portrait (single page): increments by 1
 * Landscape (two-page spread): increments by 2
 */
const getNextPageNumber = (currentPage, orientation) => {
  const increment = orientation === 'portrait' ? 1 : 2;
  return currentPage + increment;
};

/**
 * Calculate previous page number based on orientation
 * Portrait (single page): decrements by 1
 * Landscape (two-page spread): decrements by 2
 */
const getPreviousPageNumber = (currentPage, orientation) => {
  const increment = orientation === 'portrait' ? 1 : 2;
  return currentPage - increment;
};

/**
 * Check if we should go back to cover
 * Portrait (single page): if on page 1
 * Landscape (two-page spread): if on page 1 or 2
 */
const shouldGoBackToCover = (currentPage, orientation) => {
  if (orientation === 'portrait') {
    return currentPage === 1;
  } else {
    return currentPage === 1 || currentPage === 2;
  }
};

/**
 * Touch/swipe gesture handlers for mobile and tablets
 */
const createSwipeHandlers = (nextPage, previousPage) => {
  let touchStart = null;
  let touchEnd = null;
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd = null;
    touchStart = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left = next page
      nextPage();
    } else if (isRightSwipe) {
      // Swipe right = previous page
      previousPage();
    }
  };

  return { onTouchStart, onTouchMove, onTouchEnd };
};

// Export utilities
window.ComicReaderNavigation = {
  getNextPageNumber,
  getPreviousPageNumber,
  shouldGoBackToCover,
  createSwipeHandlers
};

