// Comic Reader Component

// Global state manager to prevent flipbook state from being wiped
window.ComicReaderState = window.ComicReaderState || {
  flipbookCreated: false,
  episodeData: null,
  currentPage: 1,
  totalPages: 0,
  flipbookReady: false,
  isVisible: false,
  isLoading: true
};

// Function to update global state
const updateGlobalState = (updates) => {
  Object.assign(window.ComicReaderState, updates);
};

// Function to get global state
const getGlobalState = () => window.ComicReaderState;

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
  const isInitializedRef = React.useRef(false);
  const flipbookRef = React.useRef(null);
  const flipbookCreatedRef = React.useRef(false);
  const coverRef = React.useRef(null);
  const currentPageRef = React.useRef(1);
  
  // Check if mobile device - use state to make it reactive
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  
  // Update mobile state on window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  
  

  // Get episode data from momentsInTime - use global state if available
  React.useEffect(() => {
    const globalState = getGlobalState();
    
    // If we already have episode data in global state, use it
    if (globalState.episodeData && !episodeData) {
      setEpisodeData(globalState.episodeData);
      return;
    }
    
    if (window.momentsInTime && !episodeData) {
      // Find the current comic episode by checking the URL path
      const currentPath = window.location.pathname;
      
      const currentMoment = window.momentsInTime.find(m => {
        if (!m.isComic) return false;
        const episodePath = m.fullLink.replace(/\/$/, ''); // Remove trailing slash
        return currentPath.includes(episodePath);
      });
      
      if (currentMoment) {
        setEpisodeData(currentMoment);
        updateGlobalState({ episodeData: currentMoment });
      } else {
        // Set a fallback episode data for Bangkok Episode 20
        const fallbackEpisode = {
          id: 'urban-runner-episode-20-2025-09-16',
          title: 'Urban Runner Episode 20: Comic Book Edition',
          fullLink: '/moments/bangkok/2025-09-16/',
          location: { name: 'Bangkok, Thailand' },
          date: new Date('2025-09-16T00:00:00Z')
        };
        setEpisodeData(fallbackEpisode);
        updateGlobalState({ episodeData: fallbackEpisode });
      }
    }
  }, [episodeData]);

  // Prevent episode data from being reset once it's set
  React.useEffect(() => {
    // Episode data is set and should not be reset
  }, [episodeData]);
  
  const [pages, setPages] = React.useState([]);
  
  // Generate pages dynamically based on available files
  const getPages = () => {
    if (!episodeData) {
      return [];
    }
    
    // Extract base path from fullLink
    const basePath = episodeData.fullLink.replace(/\/$/, '');
    const pagesArray = []; // Don't include cover - it's handled separately
    
    // For new episodes, we'll need to add a pageCount property to the episode data
    // For now, use a reasonable default and let the browser handle 404s gracefully
    const maxPages = episodeData.pageCount || 15; // Default to 15, can be overridden per episode
    
    for (let i = 1; i <= maxPages; i++) {
      pagesArray.push(`${basePath}/page-${i.toString().padStart(2, '0')}.png`);
    }
    
    return pagesArray;
  };

  // Function to find the next episode in the series
  const getNextEpisode = () => {
    if (!episodeData || !window.momentsInTime) {
      return null;
    }

    const currentEpisodeId = episodeData.id;
    const currentDate = episodeData.date;
    
    // Find episodes that are comics and come after the current episode
    const futureComics = window.momentsInTime
      .filter(moment => 
        moment.isComic && 
        moment.date > currentDate &&
        moment.id !== currentEpisodeId
      )
      .sort((a, b) => a.date - b.date);

    // Return the next comic episode, if any
    return futureComics.length > 0 ? futureComics[0] : null;
  };
  
  // Update pages when episode data changes
  React.useEffect(() => {
    const newPages = getPages();
    setPages(newPages);
    setTotalPages(newPages.length);
    updateGlobalState({ totalPages: newPages.length });
  }, [episodeData]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

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
        case 'Escape':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle initial page loading after component is mounted
  React.useEffect(() => {
    if (!episodeData) {
      return; // Wait for episode data to load
    }
    
    // Always show cover page first for comic episodes
    setShowCover(true);
    setFlipbookReady(false);
  }, [episodeData]);

  // Handle flipbook creation when flipbookReady becomes true
  React.useEffect(() => {
    // Don't create flipbook if no episode data
    if (!episodeData) {
      return;
    }
    
    // Check global state to prevent multiple creations
    const globalState = getGlobalState();
    if (globalState.flipbookCreated) {
      return;
    }
    
    // Only create flipbook once when we have all required data
    if (flipbookReady && flipbookRef.current && episodeData && !flipbookCreatedRef.current) {
      createFlipbook(1); // Always start at page 1
      flipbookCreatedRef.current = true; // Mark as created
      updateGlobalState({ flipbookCreated: true }); // Update global state
      
      // Set loading to false since flipbook is created
      setTimeout(() => {
        setIsLoading(false);
        setIsVisible(true);
        updateGlobalState({ isLoading: false, isVisible: true });
      }, 500); // Give time for flipbook to initialize
    }
  }, [flipbookReady, episodeData]);

  // Simple loading sequence
  React.useEffect(() => {
    if (pages && pages.length) {
      setTotalPages(pages.length);
    }
    
    // Simple loading without the memory system screen
    setTimeout(() => {
      // Only set loading to false if flipbook hasn't been created yet
      if (!flipbookCreatedRef.current) {
        setIsVisible(true);
        setIsLoading(false);
        updateGlobalState({ isVisible: true, isLoading: false });
      }
    }, 500);
  }, [episodeData]); // Add episodeData as dependency so it runs when episode changes
  

  // Function to transition from cover to flipbook
  const openComicBook = () => {
    setShowCover(false);
    setIsLoading(true);
    
    // Set flipbook ready to trigger the flipbook creation
    setFlipbookReady(true);
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
    if (!flipbookRef.current) {
      return;
    }
    
    if (!episodeData) {
      return;
    }
    
    try {
      const flipbookElement = flipbookRef.current;
      
      // Clear existing content
      flipbookElement.innerHTML = '';
      
      // Get current pages directly instead of using state
      const currentPages = getPages();
      
      // Don't create flipbook if no pages available
      if (currentPages.length === 0) {
        return;
      }
      
      // Create a simple two-page spread container
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
        width: ${isMobile ? '100%' : '50%'};
        height: ${isMobile ? 'calc(100vh - 60px)' : '100%'};
        overflow: hidden;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      // Create right page (only show on desktop)
      const rightPage = document.createElement('div');
      rightPage.className = 'simple-flipbook-page right-page';
      rightPage.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        width: 50%;
        height: 100%;
        overflow: hidden;
        background: #000;
        display: ${isMobile ? 'none' : 'flex'};
        align-items: center;
        justify-content: center;
      `;
      
      spreadContainer.appendChild(leftPage);
      spreadContainer.appendChild(rightPage);
      flipbookElement.appendChild(spreadContainer);
      
      // Set initial page state - use the actual startPage from URL
      const initialPage = startPage === 'cover' ? 1 : (startPage || 1);
      setCurrentPage(initialPage);
      currentPageRef.current = initialPage;
      updateGlobalState({ currentPage: initialPage });
      
      // Set initial pages
      updateSpreadPages(initialPage);
      
      // Add click handlers for navigation (desktop only)
      if (!isMobile) {
        leftPage.addEventListener('click', () => previousPage());
        rightPage.addEventListener('click', () => nextPage());
      }
      
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
    if (!flipbookRef.current) return;
    
    const leftPage = flipbookRef.current.querySelector('.left-page');
    const rightPage = flipbookRef.current.querySelector('.right-page');
    
    if (!leftPage) return;
    
    // Get current pages directly instead of using state
    const currentPages = getPages();
    
    // Clear existing content
    leftPage.innerHTML = '';
    if (rightPage) rightPage.innerHTML = '';
    
    if (isMobile) {
      // Mobile: show only one page at a time with bottom navigation
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
        height: 100%; /* Use full height of parent container */
      `;
      
      if (pageIndex >= 0 && pageIndex < currentPages.length) {
        const img = document.createElement('img');
        img.src = currentPages[pageIndex];
        img.alt = `Page ${pageNumber}`;
        img.style.cssText = `
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        `;
        img.onerror = () => {};
        pageContent.appendChild(img);
      } else {
        pageContent.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">No page ${pageNumber}</div>`;
      }
      
      // Mobile navigation is now handled at the overlay level
      pageContainer.appendChild(pageContent);
      leftPage.appendChild(pageContainer);
    } else {
      // Desktop: show two-page spread
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
        rightImg.onerror = (error) => {
          rightPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">Page ${rightPageIndex + 1} - Image failed to load</div>`;
        };
        rightPage.appendChild(rightImg);
      } else if (rightPage) {
        rightPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">No page ${rightPageIndex + 1}</div>`;
      }
    }
    
    // Re-add click handlers after updating content
    if (!isMobile) {
      // Desktop: left page goes back, right page goes forward
      leftPage.addEventListener('click', () => previousPage());
      if (rightPage) rightPage.addEventListener('click', () => nextPage());
    }
    // Mobile navigation is handled by the bottom navigation buttons
  };
  
  // Turn.js removed - using simple custom implementation

  const previousPage = () => {
    try {
      // Get the current page from ref to avoid stale closure
      const currentPageValue = currentPageRef.current;
      
      if (isMobile) {
        // Mobile: go to previous single page
        const prevPage = currentPageValue - 1;
        if (prevPage >= 1) {
          setCurrentPage(prevPage);
          currentPageRef.current = prevPage;
          updateGlobalState({ currentPage: prevPage });
          updateSpreadPages(prevPage);
        } else if (currentPageValue === 1) {
          // If on first page, go back to cover
          goBackToCover();
        }
      } else {
        // Desktop: For two-page spreads, we need to decrement by 2 to show the previous spread
        const prevSpreadPage = currentPageValue - 2;
        if (prevSpreadPage >= 1) {
          setCurrentPage(prevSpreadPage);
          currentPageRef.current = prevSpreadPage;
          updateGlobalState({ currentPage: prevSpreadPage });
          updateSpreadPages(prevSpreadPage);
        } else if (currentPageValue === 1) {
          // If on first page, go back to cover
          goBackToCover();
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

  const nextPage = () => {
    try {
      // Get the current page from ref to avoid stale closure
      const currentPageValue = currentPageRef.current;
      
      if (isMobile) {
        // Mobile: go to next single page
        const nextPage = currentPageValue + 1;
        if (nextPage <= totalPages) {
          setCurrentPage(nextPage);
          currentPageRef.current = nextPage;
          updateGlobalState({ currentPage: nextPage });
          updateSpreadPages(nextPage);
        } else {
          // Reached end of current episode, try to load next episode
          loadNextEpisode();
        }
      } else {
        // Desktop: For two-page spreads, we need to increment by 2 to show the next spread
        const nextSpreadPage = currentPageValue + 2;
        if (nextSpreadPage <= totalPages) {
          setCurrentPage(nextSpreadPage);
          currentPageRef.current = nextSpreadPage;
          updateGlobalState({ currentPage: nextSpreadPage });
          updateSpreadPages(nextSpreadPage);
        } else {
          // Reached end of current episode, try to load next episode
          loadNextEpisode();
        }
      }
    } catch (error) {
      // Silent error handling
    }
  };

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
      
      // Update URL to new episode
      window.history.pushState({}, '', nextEpisode.fullLink);
      
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
    
    // Show overlay again when closing comic
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const comicOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.4)', // Better balance
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(2px)' // Lighter blur
  };

  const comicContainerStyle = {
    position: 'absolute',
    top: 0,
    background: '#000',
    borderRadius: isMobile ? '0' : '15px',
    boxShadow: isMobile ? 'none' : '0 25px 80px rgba(0, 0, 0, 0.9)',
    overflow: 'hidden',
    maxWidth: isMobile ? '100vw' : '90vw',
    maxHeight: isMobile ? '100vh' : '90vh'
  };

  const coverDisplayStyle = {
    width: isMobile ? '100vw' : '500px',
    height: isMobile ? '100vh' : '667px',
    margin: '0 auto',
    display: showCover ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isVisible ? 'pointer' : 'default',
    borderRadius: isMobile ? '0' : '15px',
    overflow: 'hidden',
    background: '#000',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1s ease-out',
    boxShadow: isMobile ? 'none' : '0 25px 80px rgba(0, 0, 0, 0.9)',
    willChange: 'opacity',
    pointerEvents: isVisible ? 'auto' : 'none'
  };

  const coverImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: isMobile ? 'contain' : 'cover',
    transition: 'transform 0.2s ease',
    willChange: 'transform'
  };

  const flipbookStyle = {
    width: isMobile ? '100vw' : '1200px',
    height: isMobile ? 'calc(100vh - 60px)' : '900px',
    margin: isMobile ? '0' : '0 auto',
    display: showCover || isLoading ? 'none' : 'flex',
    background: '#000',
    borderRadius: isMobile ? '0' : '10px',
    overflow: 'hidden',
    position: 'relative'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10001,
    transition: 'all 0.3s ease',
    fontWeight: 'bold'
  };

  const controlsStyle = {
    position: 'absolute',
    bottom: '-60px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  };

  const controlBtnStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '25px',
    width: '50px',
    height: '50px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    transition: 'all 0.3s ease',
    color: '#333'
  };

  const pageIndicatorStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#333',
    fontWeight: 'bold'
  };

  const loadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    padding: '60px'
  };

  const coverLoadingStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    padding: '60px',
    background: 'rgba(0, 0, 0, 0.02)', // Almost completely transparent
    borderRadius: '15px',
    backdropFilter: 'none', // Remove blur completely
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textShadow: '0 0 15px rgba(0, 0, 0, 1), 0 0 25px rgba(0, 0, 0, 0.8)' // Stronger text shadow for visibility
  };

  const loadingSpinnerStyle = {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '15px'
  };

  return React.createElement('div', {
    style: comicOverlayStyle,
    onClick: handleOverlayClick,
    className: 'comic-episode-overlay'
  }, [
    React.createElement('div', {
      key: 'container',
      style: comicContainerStyle,
      className: 'comic-episode-container'
    }, [
      React.createElement('button', {
        key: 'close',
        style: closeButtonStyle,
        onClick: handleClose,
        title: 'Close Comic',
        onMouseEnter: (e) => {
          e.target.style.background = '#ff3742';
          e.target.style.transform = 'scale(1.1)';
        },
        onMouseLeave: (e) => {
          e.target.style.background = '#ff4757';
          e.target.style.transform = 'scale(1)';
        }
      }, '×'),
      
      showCover && !error && !isVisible && React.createElement('div', {
        key: 'loading-cover',
        style: coverLoadingStyle
      }, [
        React.createElement('div', {
          key: 'spinner',
          style: loadingSpinnerStyle
        }),
        React.createElement('div', {
          key: 'loading-text',
          style: {
            fontFamily: 'monospace',
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }, 'Loading comic book...')
      ]),

      showCover && !error && isVisible && React.createElement('div', {
        key: 'cover',
        ref: coverRef,
        style: coverDisplayStyle,
        className: 'comic-cover-display',
        onClick: openComicBook,
        onMouseEnter: (e) => {
          const img = e.target.querySelector('img');
          if (img) img.style.transform = 'scale(1.02)';
        },
        onMouseLeave: (e) => {
          const img = e.target.querySelector('img');
          if (img) img.style.transform = 'scale(1)';
        }
      }, [
        React.createElement('img', {
          key: 'cover-img',
          src: episodeData ? `${episodeData.fullLink.replace(/\/$/, '')}/cover.png` : '/moments/bangkok/2025-09-16/cover.png',
          alt: episodeData ? `${episodeData.title} Cover` : 'Episode 20 Cover',
          style: coverImageStyle
        }),
        React.createElement('div', {
          key: 'cover-overlay',
          style: {
            position: 'absolute',
            bottom: isMobile ? '40px' : '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: isMobile ? '15px 30px' : '10px 20px',
            borderRadius: isMobile ? '15px' : '25px',
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: 'bold',
            opacity: 0.9,
            textAlign: 'center',
            minWidth: isMobile ? '200px' : 'auto'
          }
        }, isMobile ? '📖 Tap to start reading' : '🖱️ Click to open comic book')
      ]),

      isLoading && !showCover && React.createElement('div', {
        key: 'loading',
        style: loadingStyle
      }, [
        React.createElement('div', {
          key: 'spinner',
          style: loadingSpinnerStyle
        }),
        React.createElement('div', {
          key: 'boot-header',
          style: {
            fontFamily: 'monospace',
            textAlign: 'center',
            marginBottom: '20px',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        }, 'Loading comic...'),
        
      ]),
      
      error && React.createElement('div', {
        key: 'error',
        style: {
          ...loadingStyle,
          color: '#ff4757',
          flexDirection: 'column'
        }
      }, [
        React.createElement('div', {
          key: 'error-icon',
          style: { fontSize: '24px', marginBottom: '10px' }
        }, '⚠️'),
        React.createElement('div', { key: 'error-msg' }, error),
        React.createElement('button', {
          key: 'retry',
          onClick: () => {
            setError(null);
            setIsLoading(true);
            // Retry initialization
            setTimeout(() => {
              createFlipbook(1);
            }, 100);
          },
          style: {
            marginTop: '15px',
            padding: '8px 16px',
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }
        }, 'Give Paul Another Shot 🚀')
      ]),
      
      !error && !showCover && React.createElement('div', {
        key: 'flipbook',
        ref: flipbookRef,
        style: flipbookStyle,
        className: 'flipbook'
      }),
      
      // Desktop controls (hidden on mobile)
      !error && !isLoading && flipbookReady && !showCover && !isMobile && React.createElement('div', {
        key: 'controls',
        style: controlsStyle,
        className: 'comic-controls'
      }, [
        React.createElement('button', {
          key: 'prev',
          style: {
            ...controlBtnStyle,
            opacity: 1,
            cursor: 'pointer'
          },
          onClick: previousPage,
          title: currentPage === 1 ? 'Back to Cover' : 'Previous Page'
        }, '‹'),
        React.createElement('div', {
          key: 'indicator',
          style: pageIndicatorStyle
        }, `${currentPage} / ${totalPages}`),
        React.createElement('button', {
          key: 'next',
          style: {
            ...controlBtnStyle,
            opacity: (currentPage === totalPages && !getNextEpisode()) ? 0.5 : 1,
            cursor: (currentPage === totalPages && !getNextEpisode()) ? 'not-allowed' : 'pointer'
          },
          onClick: nextPage,
          disabled: currentPage === totalPages && !getNextEpisode(),
          title: currentPage === totalPages && getNextEpisode() ? 'Next Episode' : 'Next Page'
        }, currentPage === totalPages && getNextEpisode() ? '⏭' : '›')
      ]),
      
      // Mobile navigation (only on mobile)
      !error && !isLoading && flipbookReady && !showCover && isMobile && React.createElement('div', {
        key: 'mobile-nav',
        style: {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          zIndex: 10001,
          width: '100vw',
          marginBottom: '10px'
        },
        className: 'mobile-comic-nav'
      }, [
        React.createElement('button', {
          key: 'mobile-prev',
          style: {
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1,
            pointerEvents: 'auto',
            marginLeft: '10px'
          },
          onClick: previousPage,
          title: currentPage === 1 ? 'Back to Cover' : 'Previous Page'
        }, '←'),
        React.createElement('div', {
          key: 'mobile-indicator',
          style: {
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }
        }, `${currentPage} / ${totalPages}`),
        React.createElement('button', {
          key: 'mobile-next',
          style: {
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1,
            pointerEvents: 'auto',
            marginRight: '25px'
          },
          onClick: nextPage,
          title: currentPage === totalPages && getNextEpisode() ? 'Next Episode' : 'Next Page'
        }, currentPage === totalPages && getNextEpisode() ? '⏭' : '→')
      ])
    ])
  ]);
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

