// Comic Reader Component
// Note: Core logic and utilities are loaded from separate files:
// - components/comicReader/core.js (shared utilities, global state)
// - components/comicReader/deviceDetection.js (device detection)
// - components/comicReader/styles.js (device-specific styles)
// - components/comicReader/flipbook.js (device-specific flipbook creation)
// - components/comicReader/navigation.js (device-specific navigation)
// - components/comicReader/render.js (device-specific render functions)

// Get utilities from loaded modules
const { updateGlobalState, getGlobalState, getPages: coreGetPages, getNextEpisode: coreGetNextEpisode, findCurrentEpisode } = window.ComicReaderCore || {};
const { createFlipbook: createFlipbookUtil, updatePages: updatePagesUtil } = window.ComicReaderFlipbook || {};
const { getNextPageNumber, getPreviousPageNumber, shouldGoBackToCover, createSwipeHandlers } = window.ComicReaderNavigation || {};
const { 
  renderHeaderButtons, 
  renderCover, 
  renderLoading, 
  renderError, 
  renderFlipbook, 
  renderDesktopControls, 
  renderMobileNavigation, 
  renderContainer 
} = window.ComicReaderRender || {};

window.ComicReader = ({ content, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(0);
  const [showCover, setShowCover] = React.useState(true);
  const [flipbookReady, setFlipbookReady] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [episodeData, setEpisodeData] = React.useState(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showControls, setShowControls] = React.useState(false);
  const isInitializedRef = React.useRef(false);
  const flipbookRef = React.useRef(null);
  const flipbookCreatedRef = React.useRef(false);
  const coverRef = React.useRef(null);
  const currentPageRef = React.useRef(1);
  const overlayRef = React.useRef(null);
  
  // Use device detection hook
  const deviceType = window.ComicReaderDeviceDetection?.useDeviceType 
    ? window.ComicReaderDeviceDetection.useDeviceType() 
    : 'desktop'; // Fallback to desktop if not loaded
  
  // Use orientation detection hook
  const orientation = window.ComicReaderDeviceDetection?.useOrientation 
    ? window.ComicReaderDeviceDetection.useOrientation() 
    : 'landscape'; // Fallback to landscape if not loaded
  
  // Derived device flags for convenience
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  
  // Determine view mode based on orientation (portrait = single page, landscape = two-page)
  const useSinglePage = orientation === 'portrait';
  
  // Keep ref in sync with state
  React.useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Touch/swipe gesture handling for mobile and tablets
  // Will be created after nextPage/previousPage are defined
  
  

  // Get episode data from momentsInTime - use global state if available
  React.useEffect(() => {
    const globalState = getGlobalState();
    
    // If we already have episode data in global state, use it
    if (globalState.episodeData && !episodeData) {
      setEpisodeData(globalState.episodeData);
      return;
    }
    
    if (window.momentsInTime && !episodeData && findCurrentEpisode) {
      const currentMoment = findCurrentEpisode();
      if (currentMoment) {
        setEpisodeData(currentMoment);
        updateGlobalState({ episodeData: currentMoment });
      }
    }
  }, [episodeData]);

  // Prevent episode data from being reset once it's set
  React.useEffect(() => {
    // Episode data is set and should not be reset
  }, [episodeData]);
  
  const [pages, setPages] = React.useState([]);
  
  // Update pages when episode data changes
  React.useEffect(() => {
    if (!coreGetPages || !episodeData) return;
    const newPages = coreGetPages(episodeData);
    setPages(newPages);
    setTotalPages(newPages.length);
    updateGlobalState({ totalPages: newPages.length });
  }, [episodeData]);
  
  // Helper to get pages (for use in functions)
  const getPages = () => {
    if (!coreGetPages || !episodeData) return [];
    return coreGetPages(episodeData);
  };
  
  // Helper to get next episode
  const getNextEpisode = () => {
    if (!coreGetNextEpisode || !episodeData) return null;
    return coreGetNextEpisode(episodeData);
  };

  // Fullscreen toggle function
  const toggleFullscreen = () => {
    if (!overlayRef.current) return;
    
    if (!document.fullscreenElement) {
      overlayRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Listen for fullscreen changes (when user presses Esc)
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  React.useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e) => {
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          previousPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault(); // Prevent space bar scrolling
          nextPage();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          e.preventDefault();
          // If in fullscreen, exit fullscreen first (browser will handle it)
          // If not in fullscreen, close the comic
          if (!isFullscreen) {
            handleClose();
          }
          // Note: if in fullscreen, browser's Esc handler will exit fullscreen
          // and our fullscreenchange listener will update the state
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFullscreen]);

  // Handle initial page loading after component is mounted
  React.useEffect(() => {
    if (!episodeData) {
      return; // Wait for episode data to load
    }
    
    // Always show cover page first for comic episodes
    setShowCover(true);
    setFlipbookReady(false);
  }, [episodeData]);

  // Handle flipbook creation when flipbookReady becomes true or orientation changes
  React.useEffect(() => {
    // Don't create flipbook if no episode data
    if (!episodeData) {
      return;
    }
    
    // Recreate flipbook when orientation changes (if already created)
    if (flipbookCreatedRef.current && flipbookRef.current && !showCover) {
      const currentPageValue = currentPageRef.current;
      createFlipbook(currentPageValue);
      updateSpreadPages(currentPageValue);
      return;
    }
    
    // Check global state to prevent multiple creations
    const globalState = getGlobalState();
    if (globalState.flipbookCreated && !showCover) {
      return;
    }
    
    // Only create flipbook once when we have all required data
    if (flipbookReady && flipbookRef.current && episodeData && !flipbookCreatedRef.current) {
      createFlipbook(1); // Always start at page 1
      flipbookCreatedRef.current = true; // Mark as created
      updateGlobalState({ flipbookCreated: true }); // Update global state
      
      // Set loading to false since flipbook is created - balanced timing
      const flipbookDelay = useSinglePage ? 400 : 500;
      setTimeout(() => {
        setIsLoading(false);
        setIsVisible(true);
        updateGlobalState({ isLoading: false, isVisible: true });
      }, flipbookDelay);
    }
  }, [flipbookReady, episodeData, orientation, showCover]);

  // Optimized loading sequence for mobile
  React.useEffect(() => {
    if (!episodeData) return;
    
    // Show visible state immediately on mobile to prevent flash
    if (isMobile) {
      setIsVisible(true);
      updateGlobalState({ isVisible: true });
    }
    
    const loadingDelay = isMobile ? 300 : 500;
    
    setTimeout(() => {
      // Only set loading to false if flipbook hasn't been created yet
      if (!flipbookCreatedRef.current) {
        if (!isMobile) {
          setIsVisible(true);
          updateGlobalState({ isVisible: true });
        }
        setIsLoading(false);
        updateGlobalState({ isLoading: false });
      }
    }, loadingDelay);
  }, [episodeData, isMobile]); // Add isMobile dependency
  

  // Function to transition from cover to flipbook
  const openComicBook = () => {
    setShowCover(false);
    setIsLoading(true);
    
    // Show loading immediately, then create flipbook
    setTimeout(() => {
      // Set flipbook ready to trigger the flipbook creation
      setFlipbookReady(true);
    }, 50); // Minimal delay to ensure loading state is visible
  };

  // Function to go back to cover from first page
  const goBackToCover = () => {
    setShowCover(true);
    setFlipbookReady(false);
    setIsLoading(false);
    setCurrentPage(1);
    currentPageRef.current = 1;
    flipbookCreatedRef.current = false; // Reset flipbook creation flag
    updateGlobalState({ 
      showCover: true, 
      flipbookReady: false, 
      isLoading: false, 
      currentPage: 1,
      flipbookCreated: false // Reset global flipbook creation flag
    });
  };



  const createFlipbook = (startPage = 1) => {
    if (!flipbookRef.current || !episodeData || !createFlipbookUtil) {
      return;
    }
    
    try {
      const flipbookElement = flipbookRef.current;
      flipbookElement.innerHTML = '';
      
      const currentPages = getPages();
      if (currentPages.length === 0) {
        return;
      }
      
      // Get styles when called - required, no fallback
      if (!window.ComicReaderStyles?.getDeviceStyles) {
        console.error('ComicReader: styles not loaded');
        return;
      }
      const currentStyles = window.ComicReaderStyles.getDeviceStyles(deviceType, { isVisible, showControls, showCover, isLoading, orientation });
      
      // Use utility to create flipbook structure
      const { leftPage, rightPage } = createFlipbookUtil(flipbookElement, deviceType, orientation, currentPages, currentStyles);
      
      // Store page references for updates
      flipbookRef.current._leftPage = leftPage;
      flipbookRef.current._rightPage = rightPage;
      
      // Set initial page state
      const initialPage = startPage === 'cover' ? 1 : (startPage || 1);
      setCurrentPage(initialPage);
      currentPageRef.current = initialPage;
      updateGlobalState({ currentPage: initialPage });
      
      // Set initial pages
      updateSpreadPages(initialPage);
      
      setIsLoading(false);
      setFlipbookReady(true);
      setIsInitialized(true);
      isInitializedRef.current = true;
      updateGlobalState({ 
        isLoading: false, 
        flipbookReady: true, 
        isInitialized: true 
      });
      
    } catch (error) {
      setError('Paul\'s Bangkok adventure is taking a coffee break... ☕');
      setIsLoading(false);
    }
  };
  
  const updateSpreadPages = (pageNumber) => {
    if (!flipbookRef.current || !updatePagesUtil) return;
    
    const leftPage = flipbookRef.current._leftPage || flipbookRef.current.querySelector('.left-page');
    const rightPage = flipbookRef.current._rightPage || flipbookRef.current.querySelector('.right-page');
    
    if (!leftPage) return;
    
    const currentPages = getPages();
    
    // Get styles when called - required, no fallback
    if (!window.ComicReaderStyles?.getDeviceStyles) {
      console.error('ComicReader: styles not loaded');
      return;
    }
    const currentStyles = window.ComicReaderStyles.getDeviceStyles(deviceType, { isVisible, showControls, showCover, isLoading });
    
    // Use utility to update pages
    updatePagesUtil(deviceType, orientation, leftPage, rightPage, pageNumber, currentPages, previousPage, nextPage, currentStyles);
  };
  
  // Turn.js removed - using simple custom implementation

  const previousPage = () => {
    try {
      const currentPageValue = currentPageRef.current;
      
      if (!getPreviousPageNumber || !shouldGoBackToCover) {
        // Fallback if utilities not loaded
        const prevPage = useSinglePage ? currentPageValue - 1 : currentPageValue - 2;
        if (prevPage >= 1) {
          setCurrentPage(prevPage);
          currentPageRef.current = prevPage;
          updateGlobalState({ currentPage: prevPage });
          updateSpreadPages(prevPage);
        } else if (shouldGoBackToCover?.(currentPageValue, orientation) || currentPageValue === 1) {
          goBackToCover();
        }
        return;
      }
      
      if (shouldGoBackToCover(currentPageValue, orientation)) {
        goBackToCover();
        return;
      }
      
      const prevPage = getPreviousPageNumber(currentPageValue, orientation);
      if (prevPage >= 1) {
        setCurrentPage(prevPage);
        currentPageRef.current = prevPage;
        updateGlobalState({ currentPage: prevPage });
        updateSpreadPages(prevPage);
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const nextPage = () => {
    try {
      const currentPageValue = currentPageRef.current;
      const currentPages = getPages();
      const actualTotalPages = currentPages.length;
      
      if (!getNextPageNumber) {
        // Fallback if utilities not loaded
        const nextPageNum = useSinglePage ? currentPageValue + 1 : currentPageValue + 2;
        if (nextPageNum <= actualTotalPages) {
          setCurrentPage(nextPageNum);
          currentPageRef.current = nextPageNum;
          updateGlobalState({ currentPage: nextPageNum });
          updateSpreadPages(nextPageNum);
        } else {
          loadNextEpisode();
        }
        return;
      }
      
      const nextPageNum = getNextPageNumber(currentPageValue, orientation);
      if (nextPageNum <= actualTotalPages) {
        setCurrentPage(nextPageNum);
        currentPageRef.current = nextPageNum;
        updateGlobalState({ currentPage: nextPageNum });
        updateSpreadPages(nextPageNum);
      } else {
        loadNextEpisode();
      }
    } catch (error) {
      // Silent error handling
    }
  };

  // Create swipe handlers now that nextPage/previousPage are defined
  const swipeHandlers = (isMobile || isTablet) && createSwipeHandlers 
    ? createSwipeHandlers(nextPage, previousPage)
    : null;
  
  // Fallback touch handlers if utility not loaded
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  
  const onTouchStart = swipeHandlers?.onTouchStart || ((e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  });
  
  const onTouchMove = swipeHandlers?.onTouchMove || ((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  });
  
  const onTouchEnd = swipeHandlers?.onTouchEnd || (() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextPage();
    } else if (distance < -minSwipeDistance) {
      previousPage();
    }
  });

  // Function to load the next episode in the series
  const loadNextEpisode = () => {
    const nextEpisode = getNextEpisode();
    if (nextEpisode) {
      // Reset state for new episode
      setCurrentPage(1);
      currentPageRef.current = 1;
      setShowCover(true);
      setIsVisible(false);
      setFlipbookReady(false);
      flipbookCreatedRef.current = false;
      
      // Update episode data - this will trigger the loading sequence
      setEpisodeData(nextEpisode);
      updateGlobalState({
        episodeData: nextEpisode,
        currentPage: 1,
        flipbookCreated: false,
        flipbookReady: false,
        isVisible: false,
        isLoading: true
      });
      
      // Update URL and timeline selection for new episode
      window.history.pushState({ momentId: nextEpisode.id }, '', nextEpisode.fullLink);
      
      // Update timeline selection and trigger globe transition
      if (window.handleTimelineClick) {
        window.handleTimelineClick(nextEpisode);
      }
      
      // Trigger the loading sequence by setting loading to true
      // The existing useEffect will handle the rest
      setIsLoading(true);
    }
  };

  const handleClose = () => {
    // Reset global state when closing
    updateGlobalState({
      flipbookCreated: false,
      episodeData: null,
      currentPage: 1,
      totalPages: 0,
      flipbookReady: false,
      isVisible: false,
      isLoading: true
    });
    
    // Force timeline re-render to ensure highlight is visible
    if (episodeData && window.setSelectedId) {
      // Temporarily clear and reset the selection to force a re-render
      const currentEpisodeId = episodeData.id;
      window.setSelectedId(null);
      setTimeout(() => {
        window.setSelectedId(currentEpisodeId);
      }, 10);
    }
    
    // Show overlay again when closing comic
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    // Don't close if in fullscreen mode - only Escape should exit
    if (e.target === e.currentTarget && !isFullscreen) {
      handleClose();
    }
  };

  // Get device-specific styles
  const styles = window.ComicReaderStyles?.getDeviceStyles 
    ? window.ComicReaderStyles.getDeviceStyles(deviceType, { isVisible, showControls, showCover, isLoading, orientation })
    : {}; // Fallback empty object if styles not loaded

  // All styles are now loaded from styles.js via getDeviceStyles()
  // Access via: styles.coverDisplayStyle, styles.coverImageStyle, etc.

  // Build container children using render functions
  const containerChildren = [];
  
  // Header buttons (shared across all devices)
  if (renderHeaderButtons) {
    containerChildren.push(...renderHeaderButtons(styles, {
      handleClose,
      toggleFullscreen,
      isFullscreen
    }));
  }
  
  // Cover display
  if (showCover && !error && renderCover) {
    containerChildren.push(renderCover(deviceType, styles, {
      episodeData,
      isVisible,
      openComicBook,
      coverRef
    }));
  }
  
  // Loading state
  if (isLoading && !showCover && renderLoading) {
    containerChildren.push(renderLoading(deviceType, styles));
  }
  
  // Error state
  if (error && renderError) {
    containerChildren.push(renderError(styles, {
      error,
      createFlipbook,
      setError,
      setIsLoading
    }));
  }
  
  // Flipbook container
  if (!error && !showCover && renderFlipbook) {
    containerChildren.push(renderFlipbook(styles, { flipbookRef }));
  }
  
  // Desktop controls (landscape mode - two-page spread)
  if (!error && !isLoading && flipbookReady && !showCover && !useSinglePage && renderDesktopControls) {
    containerChildren.push(renderDesktopControls(styles, {
      currentPage,
      totalPages,
      previousPage,
      nextPage,
      getNextEpisode
    }));
  }
  
  // Mobile navigation (portrait mode - single page)
  if (!error && !isLoading && flipbookReady && !showCover && useSinglePage && renderMobileNavigation) {
    containerChildren.push(renderMobileNavigation(styles, {
      currentPage,
      totalPages,
      previousPage,
      nextPage,
      getNextEpisode
    }));
  }
  
  // Cover overlay button (inside container for mobile)
  if (isMobile && showCover && isVisible && styles.coverOverlayStyle) {
    containerChildren.push(React.createElement('div', {
      key: 'cover-overlay',
      style: styles.coverOverlayStyle || {}
    }, '📖 Tap to start reading'));
  }
  
  // Render container with device-specific handlers
  const containerElement = renderContainer 
    ? renderContainer(deviceType, styles, {
        setShowControls,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        children: containerChildren
      })
    : React.createElement('div', {
        key: 'container',
        style: styles.comicContainerStyle || {},
        className: 'comic-episode-container'
      }, containerChildren);
  
  // Cover overlay (sibling of comic-episode-container for non-mobile)
  const overlayChildren = [containerElement];
  if (!isMobile && showCover && isVisible && styles.coverOverlayStyle) {
    overlayChildren.push(React.createElement('div', {
      key: 'cover-overlay',
      style: styles.coverOverlayStyle || {}
    }, '🖱️ Click to open comic book'));
  }
  
  // Prevent touch events from reaching elements underneath (like the globe)
  const handleOverlayTouchStart = (e) => {
    e.stopPropagation();
  };
  
  const handleOverlayTouchMove = (e) => {
    e.stopPropagation();
  };
  
  const handleOverlayTouchEnd = (e) => {
    e.stopPropagation();
  };

  return React.createElement('div', {
    ref: overlayRef,
    style: styles.comicOverlayStyle || {},
    onClick: handleOverlayClick,
    onTouchStart: handleOverlayTouchStart,
    onTouchMove: handleOverlayTouchMove,
    onTouchEnd: handleOverlayTouchEnd,
    className: 'comic-episode-overlay'
  }, overlayChildren);
};

// Add CSS for the spinner animation and Turn.js styling
if (!document.querySelector('#comic-episode-styles')) {
  const style = document.createElement('style');
  style.id = 'comic-episode-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes textPulse {
      0%, 100% { 
        transform: scale(1);
        opacity: 0.9;
      }
      50% { 
        transform: scale(1.05);
        opacity: 1;
      }
    }
    
    .comic-episode-overlay {
      animation: fadeIn 0.2s ease-out;
    }
    
    .comic-episode-container {
      animation: scaleIn 0.3s ease-out;
    }
    
    /* Optimized cover display */
    .comic-cover-display {
      will-change: transform, opacity;
      transform: translateZ(0);
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    .comic-cover-display:hover img {
      transform: scale(1.01);
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { 
        opacity: 0;
        transform: scale(0.9);
      }
      to { 
        opacity: 1;
        transform: scale(1);
      }
    }
    
    /* Turn.js specific styles */
    .flipbook {
      background: #000;
      border-radius: 10px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      cursor: grab;
      touch-action: manipulation;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    .flipbook:active {
      cursor: grabbing;
    }
    
    .flipbook * {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    .flipbook .page {
      width: 500px;
      height: 750px;
      background: white;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
    }
    
    .flipbook .page img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-user-select: none;
      draggable: false;
    }
    
    /* Enhanced corner interaction areas */
    .flipbook .page:before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
      height: 80px;
      background: linear-gradient(-45deg, transparent 0%, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%, transparent 100%);
      pointer-events: none;
      z-index: 1;
      transition: opacity 0.3s ease;
      opacity: 0;
    }
    
    .flipbook .page:hover:before {
      opacity: 1;
    }
    
    .flipbook .hard {
      background: #333;
      color: white;
      border: solid 1px #666;
    }
    
    .flipbook .even {
      background: linear-gradient(to left, #fff 0%, #f9f9f9 100%);
    }
    
    .flipbook .odd {
      background: linear-gradient(to right, #fff 0%, #f9f9f9 100%);
    }
    
    /* Turn.js page corner styles */
    .flipbook .page:hover {
      cursor: grab;
    }
    
    .flipbook .turn-page {
      cursor: grabbing !important;
    }
    
    /* Visual feedback for click areas */
    .flipbook .page:after {
      content: '';
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 12px solid rgba(255, 165, 0, 0.7);
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
      z-index: 2;
    }
    
    .flipbook .page:hover:after {
      opacity: 1;
    }
    
    /* Left page indicator */
    .flipbook .even:after {
      right: auto;
      left: 10px;
      border-left: none;
      border-right: 12px solid rgba(255, 165, 0, 0.7);
    }
    
    /* Corner drag areas */
    .flipbook .page:before {
      z-index: 3;
    }
    
    /* Allow Turn.js to handle all interactions */
    .flipbook .page {
      position: relative;
    }
    
    /* Make page corners more draggable */
    .flipbook .page:hover:before {
      background: linear-gradient(-45deg, transparent 0%, transparent 30%, rgba(255,165,0,0.2) 50%, transparent 70%, transparent 100%);
    }
    
    /* Turn.js generated elements */
    .flipbook .turn-page {
      cursor: grabbing !important;
    }
    
    .flipbook .turn-page-wrapper {
      cursor: grabbing !important;
    }
    
  `;
  document.head.appendChild(style);
}

