// ============================================================================
// Device-Specific Flipbook Creation and Updates
// ============================================================================

/**
 * Create flipbook structure for mobile (single page view)
 */
const createMobileFlipbook = (flipbookElement, currentPages) => {
  const spreadContainer = document.createElement('div');
  spreadContainer.className = 'simple-flipbook-spread';
  spreadContainer.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.3s ease;
  `;
  
  // Create left page (full width for mobile)
  const leftPage = document.createElement('div');
  leftPage.className = 'simple-flipbook-page left-page';
  leftPage.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  spreadContainer.appendChild(leftPage);
  flipbookElement.appendChild(spreadContainer);
  
  return { leftPage, rightPage: null };
};

/**
 * Create flipbook structure for tablet/desktop (two-page spread)
 */
const createDesktopFlipbook = (flipbookElement, currentPages) => {
  const spreadContainer = document.createElement('div');
  spreadContainer.className = 'simple-flipbook-spread';
  spreadContainer.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
    transition: transform 0.3s ease;
  `;
  
  // Create left page
  const leftPage = document.createElement('div');
  leftPage.className = 'simple-flipbook-page left-page';
  leftPage.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Create right page
  const rightPage = document.createElement('div');
  rightPage.className = 'simple-flipbook-page right-page';
  rightPage.style.cssText = `
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    border-left: 2px solid #333;
  `;
  
  spreadContainer.appendChild(leftPage);
  spreadContainer.appendChild(rightPage);
  flipbookElement.appendChild(spreadContainer);
  
  return { leftPage, rightPage };
};

/**
 * Update pages for mobile (single page view)
 */
const updateMobilePages = (leftPage, pageNumber, currentPages, previousPage, nextPage) => {
  if (!leftPage) return;
  
  leftPage.innerHTML = '';
  const pageIndex = pageNumber - 1; // 0-based index
  
  // Create container for page and navigation
  const pageContainer = document.createElement('div');
  pageContainer.style.cssText = `
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  `;
  
  // Create page content area
  const pageContent = document.createElement('div');
  pageContent.style.cssText = `
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    height: 100%;
  `;
  
  if (pageIndex >= 0 && pageIndex < currentPages.length) {
    const img = document.createElement('img');
    img.src = currentPages[pageIndex];
    img.alt = `Page ${pageNumber}`;
    img.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    `;
    img.onerror = () => {};
    pageContent.appendChild(img);
  } else {
    pageContent.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">No page ${pageNumber}</div>`;
  }
  
  pageContainer.appendChild(pageContent);
  leftPage.appendChild(pageContainer);
};

/**
 * Update pages for tablet/desktop (two-page spread)
 */
const updateDesktopPages = (leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage) => {
  if (!leftPage) return;
  
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
    leftImg.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    `;
    leftImg.onerror = () => {};
    leftPage.appendChild(leftImg);
  } else {
    leftPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">No page ${leftPageIndex + 1}</div>`;
  }
  
  // Add right page image
  if (rightPage && rightPageIndex >= 0 && rightPageIndex < currentPages.length) {
    const rightImg = document.createElement('img');
    rightImg.src = currentPages[rightPageIndex];
    rightImg.alt = `Page ${rightPageIndex + 1}`;
    rightImg.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    `;
    rightImg.onload = () => {};
    rightImg.onerror = () => {
      rightPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">Page ${rightPageIndex + 1} - Image failed to load</div>`;
    };
    rightPage.appendChild(rightImg);
  } else if (rightPage) {
    rightPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">No page ${rightPageIndex + 1}</div>`;
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
 * Create flipbook based on device type
 */
const createFlipbook = (flipbookElement, deviceType, currentPages) => {
  if (deviceType === 'mobile') {
    return createMobileFlipbook(flipbookElement, currentPages);
  } else {
    return createDesktopFlipbook(flipbookElement, currentPages);
  }
};

/**
 * Update pages based on device type
 */
const updatePages = (deviceType, leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage) => {
  if (deviceType === 'mobile') {
    updateMobilePages(leftPage, pageNumber, currentPages, previousPage, nextPage);
  } else {
    updateDesktopPages(leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage);
  }
};

// Export utilities
window.ComicReaderFlipbook = {
  createFlipbook,
  updatePages
};

