// ============================================================================
// Device-Specific Flipbook Creation and Updates
// ============================================================================

/**
 * Convert style object to CSS string for cssText
 */
const styleObjectToCss = (styleObj) => {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
};

/**
 * Create flipbook structure for mobile (single page view)
 */
const createMobileFlipbook = (flipbookElement, currentPages, styles) => {
  if (!styles) {
    console.error('ComicReaderFlipbook: styles object is required');
    return { leftPage: null, rightPage: null };
  }
  
  const spreadContainer = document.createElement('div');
  spreadContainer.className = 'simple-flipbook-spread';
  spreadContainer.style.cssText = styleObjectToCss(styles.spreadContainerStyle);
  
  // Create left page (full width for mobile)
  const leftPage = document.createElement('div');
  leftPage.className = 'simple-flipbook-page left-page';
  leftPage.style.cssText = styleObjectToCss(styles.mobileLeftPageStyle);
  
  spreadContainer.appendChild(leftPage);
  flipbookElement.appendChild(spreadContainer);
  
  return { leftPage, rightPage: null };
};

/**
 * Create flipbook structure for tablet/desktop (two-page spread)
 */
const createDesktopFlipbook = (flipbookElement, currentPages, styles) => {
  if (!styles) {
    console.error('ComicReaderFlipbook: styles object is required');
    return { leftPage: null, rightPage: null };
  }
  
  const spreadContainer = document.createElement('div');
  spreadContainer.className = 'simple-flipbook-spread';
  spreadContainer.style.cssText = styleObjectToCss(styles.spreadContainerStyle);
  
  // Create left page
  const leftPage = document.createElement('div');
  leftPage.className = 'simple-flipbook-page left-page';
  leftPage.style.cssText = styleObjectToCss(styles.desktopLeftPageStyle);
  
  // Create right page
  const rightPage = document.createElement('div');
  rightPage.className = 'simple-flipbook-page right-page';
  rightPage.style.cssText = styleObjectToCss(styles.desktopRightPageStyle);
  
  spreadContainer.appendChild(leftPage);
  spreadContainer.appendChild(rightPage);
  flipbookElement.appendChild(spreadContainer);
  
  return { leftPage, rightPage };
};

/**
 * Update pages for mobile (single page view)
 */
const updateMobilePages = (leftPage, pageNumber, currentPages, previousPage, nextPage, styles) => {
  if (!leftPage || !styles) return;
  
  leftPage.innerHTML = '';
  const pageIndex = pageNumber - 1; // 0-based index
  
  // Create container for page and navigation
  const pageContainer = document.createElement('div');
  pageContainer.style.cssText = styleObjectToCss(styles.mobilePageContainerStyle);
  
  // Create page content area
  const pageContent = document.createElement('div');
  pageContent.style.cssText = styleObjectToCss(styles.mobilePageContentStyle);
  
  if (pageIndex >= 0 && pageIndex < currentPages.length) {
    const img = document.createElement('img');
    img.src = currentPages[pageIndex];
    img.alt = `Page ${pageNumber}`;
    img.style.cssText = styleObjectToCss(styles.mobilePageImageStyle);
    img.onerror = () => {};
    pageContent.appendChild(img);
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = styleObjectToCss(styles.errorMessageStyle);
    errorDiv.textContent = `No page ${pageNumber}`;
    pageContent.appendChild(errorDiv);
  }
  
  pageContainer.appendChild(pageContent);
  leftPage.appendChild(pageContainer);
};

/**
 * Update pages for tablet/desktop (two-page spread)
 */
const updateDesktopPages = (leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage, styles) => {
  if (!leftPage || !styles) return;
  
  // Clear existing content
  leftPage.innerHTML = '';
  if (rightPage) rightPage.innerHTML = '';
  
  const leftPageIndex = pageNumber - 1; // 0-based index for left page
  const rightPageIndex = pageNumber; // 0-based index for right page
  
  // Add left page image
  if (leftPageIndex >= 0 && leftPageIndex < currentPages.length) {
    const leftImg = document.createElement('img');
    leftImg.src = currentPages[leftPageIndex];
    leftImg.alt = `Page ${leftPageIndex + 1}`;
    leftImg.style.cssText = styleObjectToCss(styles.desktopPageImageStyle);
    leftImg.onerror = () => {};
    leftPage.appendChild(leftImg);
  } else {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = styleObjectToCss(styles.errorMessageStyle);
    errorDiv.textContent = `No page ${leftPageIndex + 1}`;
    leftPage.appendChild(errorDiv);
  }
  
  // Add right page image
  if (rightPage && rightPageIndex >= 0 && rightPageIndex < currentPages.length) {
    const rightImg = document.createElement('img');
    rightImg.src = currentPages[rightPageIndex];
    rightImg.alt = `Page ${rightPageIndex + 1}`;
    rightImg.style.cssText = styleObjectToCss(styles.desktopPageImageStyle);
    rightImg.onload = () => {};
    rightImg.onerror = () => {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = styleObjectToCss(styles.errorMessageStyle);
      errorDiv.textContent = `Page ${rightPageIndex + 1} - Image failed to load`;
      rightPage.innerHTML = '';
      rightPage.appendChild(errorDiv);
    };
    rightPage.appendChild(rightImg);
  } else if (rightPage) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = styleObjectToCss(styles.errorMessageStyle);
    errorDiv.textContent = `No page ${rightPageIndex + 1}`;
    rightPage.appendChild(errorDiv);
  }
  
  // Add click handlers for desktop navigation
  leftPage.onclick = (e) => {
    e.stopPropagation();
    previousPage();
  };
  if (rightPage) {
    rightPage.onclick = (e) => {
      e.stopPropagation();
      nextPage();
    };
  }
};

/**
 * Create flipbook based on device type and orientation
 */
const createFlipbook = (flipbookElement, deviceType, orientation, currentPages, styles) => {
  if (!styles) {
    console.error('ComicReaderFlipbook: styles object is required');
    return { leftPage: null, rightPage: null };
  }
  
  // Portrait = single page, Landscape = two-page spread
  const useSinglePage = orientation === 'portrait';
  
  if (useSinglePage) {
    return createMobileFlipbook(flipbookElement, currentPages, styles);
  } else {
    return createDesktopFlipbook(flipbookElement, currentPages, styles);
  }
};

/**
 * Update pages based on device type and orientation
 */
const updatePages = (deviceType, orientation, leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage, styles) => {
  if (!styles) {
    console.error('ComicReaderFlipbook: styles object is required');
    return;
  }
  
  // Portrait = single page, Landscape = two-page spread
  const useSinglePage = orientation === 'portrait';
  
  if (useSinglePage) {
    updateMobilePages(leftPage, pageNumber, currentPages, previousPage, nextPage, styles);
  } else {
    updateDesktopPages(leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage, styles);
  }
};

// Export utilities
window.ComicReaderFlipbook = {
  createFlipbook,
  updatePages
};

