// Comic Reader Component
window.ComicReader = ({ content, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [bootPhase, setBootPhase] = React.useState('initializing'); // 'initializing' -> 'scanning' -> 'loading' -> 'complete'
  const [bootMessages, setBootMessages] = React.useState([]);
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
  const coverRef = React.useRef(null);
  const currentPageRef = React.useRef(1);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  
  // Function to update URL hash when page changes
  const updateUrlHash = (page) => {
    if (isInitializedRef.current && page > 1) {
      const newHash = `#page-${page}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', window.location.pathname + newHash);
      }
    } else if (isInitializedRef.current && page === 1) {
      // Remove hash for page 1
      if (window.location.hash) {
        window.history.pushState(null, '', window.location.pathname);
      }
    }
  };

  // Function to get initial page from URL hash
  const getInitialPageFromHash = () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#page-')) {
      const pageNum = parseInt(hash.substring(6));
      return isNaN(pageNum) ? 1 : Math.max(1, pageNum);
    }
    return 1;
  };

  // Get episode data from momentsInTime
  React.useEffect(() => {
    if (window.momentsInTime) {
      // Find the current comic episode by checking the URL path
      const currentPath = window.location.pathname;
      
      const currentMoment = window.momentsInTime.find(m => {
        if (!m.isComic) return false;
        const episodePath = m.fullLink.replace(/\/$/, ''); // Remove trailing slash
        return currentPath.includes(episodePath);
      });
      
      if (currentMoment) {
        setEpisodeData(currentMoment);
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
      }
    }
  }, []);
  
  const [pages, setPages] = React.useState([]);
  
  // Generate pages dynamically based on available files
  const getPages = () => {
    if (!episodeData) {
      // Fallback to Bangkok Episode 20
      return [
        '/moments/bangkok/2025-09-16/page-01.png',
        '/moments/bangkok/2025-09-16/page-02.png',
        '/moments/bangkok/2025-09-16/page-03.png',
        '/moments/bangkok/2025-09-16/page-04.png',
        '/moments/bangkok/2025-09-16/page-05.png',
        '/moments/bangkok/2025-09-16/page-06.png',
        '/moments/bangkok/2025-09-16/page-07.png'
      ];
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
  
  // Update pages when episode data changes
  React.useEffect(() => {
    const newPages = getPages();
    setPages(newPages);
    setTotalPages(newPages.length);
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
    console.log('Episode data useEffect triggered - episodeData:', !!episodeData);
    if (!episodeData) {
      console.log('No episode data yet, waiting...');
      return; // Wait for episode data to load
    }
    
    const initialPage = getInitialPage();
    console.log('Initial page from hash:', initialPage);
    
    if (initialPage === 'cover') {
      // Show cover page
      console.log('Showing cover page');
      setShowCover(true);
      setFlipbookReady(false);
      updatePageUrl('cover');
    } else if (initialPage >= 1) {
      // Show flipbook and go to specific page (including page 1)
      console.log('Showing flipbook, going to page:', initialPage);
      setShowCover(false);
      setFlipbookReady(true);
    } else if (initialPage === null) {
      // No hash in URL - show cover by default for comic episodes
      console.log('No hash in URL - showing cover by default');
      setShowCover(true);
      setFlipbookReady(false);
      updatePageUrl('cover');
    }
  }, [episodeData]);

  // Handle flipbook creation when flipbookReady becomes true
  React.useEffect(() => {
    console.log('Flipbook useEffect triggered - flipbookReady:', flipbookReady, 'flipbookRef.current:', !!flipbookRef.current);
    if (flipbookReady && flipbookRef.current) {
      const initialPage = getInitialPage();
      console.log('Creating flipbook for page:', initialPage);
      createFlipbook(initialPage);
      
      // Update URL to page 1 after flipbook is created
      setTimeout(() => {
        console.log('Updating URL to page 1 after flipbook creation');
        updatePageUrl(1);
      }, 500); // Give time for flipbook to initialize
    } else if (flipbookReady && !flipbookRef.current) {
      console.log('flipbookReady is true but flipbookRef.current is null - retrying in 200ms');
      setTimeout(() => {
        if (flipbookRef.current) {
          const initialPage = getInitialPage();
          console.log('Creating flipbook for page (retry):', initialPage);
          createFlipbook(initialPage);
          setTimeout(() => {
            console.log('Updating URL to page 1 after flipbook creation (retry)');
            updatePageUrl(1);
          }, 500);
        } else {
          console.error('flipbookRef still null after retry');
        }
      }, 200);
    }
  }, [flipbookReady, flipbookRef.current]);

  // Memory boot sequence
  React.useEffect(() => {
    if (pages && pages.length) {
      setTotalPages(pages.length);
    }
    
    const addBootMessage = (message, delay = 0) => {
      setTimeout(() => {
        setBootMessages(prev => [...prev, message]);
      }, delay);
    };

    // Phase 1: System Initialization
    addBootMessage('🧠 Initializing Paul\'s Memory System...', 100);
    const episodeTitle = episodeData ? episodeData.title : 'Bangkok Episode 20';
    const episodeDate = episodeData ? episodeData.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 16, 2025';
    const episodeNumber = episodeData ? episodeData.id.match(/episode-(\d+)/)?.[1] || '20' : '20';
    addBootMessage(`📡 Connecting to ${episodeData ? episodeData.location.name : 'Bangkok'} Memory Bank...`, 300);
    addBootMessage(`🔐 Authenticating Episode ${episodeNumber} Access...`, 500);
    
    setTimeout(() => {
      setBootPhase('scanning');
      addBootMessage(`🔍 Scanning for ${episodeData ? episodeData.location.name : 'Bangkok'} memories...`, 0);
      addBootMessage(`📅 Located: ${episodeDate}`, 200);
      addBootMessage(`🏃‍♂️ Found: ${episodeTitle}`, 400);
      addBootMessage('📖 Memory type: Comic Book Format', 600);
    }, 800);

    // Phase 2: Asset Loading
    setTimeout(() => {
      setBootPhase('loading');
      addBootMessage('⬇️  Loading memory fragments...', 0);
      
      // Preload cover image with boot messages
      const coverImg = new Image();
      coverImg.src = episodeData ? `${episodeData.fullLink.replace(/\/$/, '')}/cover.png` : '/moments/bangkok/2025-09-16/cover.png';
      
      addBootMessage('🎨 Loading cover artwork...', 200);
      
      coverImg.onload = () => {
        addBootMessage('✅ Cover loaded successfully', 100);
        addBootMessage('📚 Preparing page assets...', 300);
        
        // Simulate loading other assets
        setTimeout(() => {
          addBootMessage('🔧 Initializing Turn.js engine...', 0);
          addBootMessage('📄 Compiling 7 comic pages...', 200);
          addBootMessage('🎯 Optimizing for flip animations...', 400);
          
          setTimeout(() => {
            setBootPhase('complete');
            addBootMessage('🚀 Memory boot sequence complete!', 0);
            addBootMessage('💭 Paul\'s Bangkok adventure ready...', 200);
            addBootMessage('🔓 ACCESS GRANTED - Welcome to Episode 20', 400);
            
            setTimeout(() => {
              setIsVisible(true);
              setIsLoading(false);
            }, 800);
          }, 800);
        }, 500);
      };
      
      // Fallback in case image doesn't load
      setTimeout(() => {
        if (bootPhase !== 'complete') {
          addBootMessage('⚠️  Cover load timeout, using cached version', 0);
          setBootPhase('complete');
          addBootMessage('🚀 Memory boot sequence complete!', 200);
          setTimeout(() => {
            setIsVisible(true);
            setIsLoading(false);
          }, 600);
        }
      }, 3000);
      
    }, 1500);
  }, []);
  
  // Initialize flipbook and handle navigation
  React.useEffect(() => {
    // Check if URL has a specific page - if so, skip cover after zoom
    const initialPage = getInitialPage();
    if (initialPage > 1) {
      setTimeout(() => {
        setShowCover(false);
        setIsLoading(true);
        // Initialize flipbook directly
        setTimeout(() => {
              if (flipbookRef.current && window.$ && window.$.fn.turn) {
                createFlipbook(initialPage);
              } else {
                setError('The comic book pages are being a bit stubborn today... 🤔');
                setIsLoading(false);
              }
        }, 200);
      }, 1500); // Delay to allow fade-in to complete
    }
    
    // Handle browser back/forward navigation
    const handlePopState = (event) => {
      if (event.state && event.state.page && flipbookRef.current && window.$ && window.$.fn.turn) {
        const targetPage = event.state.page;
        window.$(flipbookRef.current).turn('page', targetPage);
        setCurrentPage(targetPage);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Cleanup Turn.js instance
      if (flipbookRef.current && window.$ && window.$.fn.turn) {
        try {
          window.$(flipbookRef.current).turn('destroy');
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Function to transition from cover to flipbook
  const openComicBook = () => {
    console.log('openComicBook called - transitioning to cover');
    setShowCover(false);
    setIsLoading(true);
    
    // Update URL to show we're on the cover immediately
    updatePageUrl('cover');
    
    // Set flipbook ready to trigger the flipbook creation
    setFlipbookReady(true);
  };

  // Function to update URL with current page
  const updatePageUrl = (pageNumber) => {
    console.log(`updatePageUrl called: page=${pageNumber}, isInitialized=${isInitializedRef.current}`);
    
    if (pageNumber === 'cover') {
      const newHash = '#cover';
      if (window.location.hash !== newHash) {
        console.log(`Updating URL hash to: ${newHash}`);
        window.history.pushState(null, '', window.location.pathname + newHash);
      }
    } else if (pageNumber === 1) {
      const newHash = '#page-1';
      if (window.location.hash !== newHash) {
        console.log(`Updating URL hash to: ${newHash}`);
        window.history.pushState(null, '', window.location.pathname + newHash);
      }
    } else if (isInitializedRef.current && pageNumber > 1) {
      const newHash = `#page-${pageNumber}`;
      if (window.location.hash !== newHash) {
        console.log(`Updating URL hash to: ${newHash}`);
        window.history.pushState(null, '', window.location.pathname + newHash);
      }
    } else {
      console.log(`Skipping URL update: isInitialized=${isInitializedRef.current}, page=${pageNumber}`);
    }
  };

  // Function to get initial page from URL hash
  const getInitialPage = () => {
    const hash = window.location.hash;
    if (hash === '#cover') {
      return 'cover';
    } else if (hash && hash.startsWith('#page-')) {
      const pageNum = parseInt(hash.substring(6));
      return isNaN(pageNum) ? 1 : Math.max(1, pageNum);
    }
    return null; // No hash - will trigger cover display
  };

  const createFlipbook = (startPage = 1) => {
    if (!flipbookRef.current) return;
    
    try {
      const flipbookElement = flipbookRef.current;
      
      // Clear existing content
      flipbookElement.innerHTML = '';
      
      console.log('Creating simple flipbook with', pages.length, 'pages, startPage:', startPage);
      
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
        right: 0;
        width: 50%;
        height: 100%;
        overflow: hidden;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      spreadContainer.appendChild(leftPage);
      spreadContainer.appendChild(rightPage);
      flipbookElement.appendChild(spreadContainer);
      
      // Set initial page state
      const initialPage = startPage === 'cover' ? 1 : (startPage || 1);
      setCurrentPage(initialPage);
      
      // Set initial pages
      updateSpreadPages(initialPage);
      
      // Add click handlers for navigation
      leftPage.addEventListener('click', () => previousPage());
      rightPage.addEventListener('click', () => nextPage());
      
      console.log('Simple flipbook created successfully with initial page:', initialPage);
      
      setIsLoading(false);
      setFlipbookReady(true);
      setIsInitialized(true);
      isInitializedRef.current = true;
      
    } catch (error) {
      console.error('Error creating simple flipbook:', error);
      setError('Paul\'s Bangkok adventure is taking a coffee break... ☕');
      setIsLoading(false);
    }
  };
  
  const updateSpreadPages = (pageNumber) => {
    if (!flipbookRef.current) return;
    
    const leftPage = flipbookRef.current.querySelector('.left-page');
    const rightPage = flipbookRef.current.querySelector('.right-page');
    
    if (!leftPage || !rightPage) return;
    
    console.log('updateSpreadPages called with pageNumber:', pageNumber, 'pages.length:', pages.length);
    
    // Calculate which pages to show (1-based page numbers)
    // For a two-page spread, if we're on page N, we show pages N and N+1
    const leftPageIndex = pageNumber - 1; // 0-based index for left page
    const rightPageIndex = pageNumber; // 0-based index for right page
    
    console.log('Calculated indices - leftPageIndex:', leftPageIndex, 'rightPageIndex:', rightPageIndex);
    console.log('Left page URL:', leftPageIndex >= 0 && leftPageIndex < pages.length ? pages[leftPageIndex] : 'OUT OF BOUNDS');
    console.log('Right page URL:', rightPageIndex >= 0 && rightPageIndex < pages.length ? pages[rightPageIndex] : 'OUT OF BOUNDS');
    
    // Clear existing content
    leftPage.innerHTML = '';
    rightPage.innerHTML = '';
    
    // Add left page image
    if (leftPageIndex >= 0 && leftPageIndex < pages.length) {
      const leftImg = document.createElement('img');
      leftImg.src = pages[leftPageIndex];
      leftImg.alt = `Page ${leftPageIndex + 1}`;
      leftImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      `;
      leftImg.onerror = () => console.warn(`Failed to load image: ${pages[leftPageIndex]}`);
      leftPage.appendChild(leftImg);
      console.log('Added left page image:', pages[leftPageIndex]);
    } else {
      console.log('Left page index out of bounds:', leftPageIndex);
    }
    
    // Add right page image
    if (rightPageIndex >= 0 && rightPageIndex < pages.length) {
      const rightImg = document.createElement('img');
      rightImg.src = pages[rightPageIndex];
      rightImg.alt = `Page ${rightPageIndex + 1}`;
      rightImg.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      `;
      rightImg.onload = () => {
        console.log('Right page image loaded successfully:', pages[rightPageIndex]);
      };
      rightImg.onerror = (error) => {
        console.error(`Failed to load right page image: ${pages[rightPageIndex]}`, error);
        // Add a placeholder to show something
        rightPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">Page ${rightPageIndex + 1} - Image failed to load</div>`;
      };
      rightPage.appendChild(rightImg);
      console.log('Added right page image:', pages[rightPageIndex]);
      console.log('Right page children after adding image:', rightPage.children.length);
    } else {
      console.log('Right page index out of bounds:', rightPageIndex, 'pages.length:', pages.length);
      // Add a placeholder for out of bounds
      rightPage.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 18px;">No page ${rightPageIndex + 1}</div>`;
    }
    
    console.log(`Updated spread: left page ${leftPageIndex + 1}, right page ${rightPageIndex + 1}`);
  };
  
  // Turn.js removed - using simple custom implementation

  const previousPage = () => {
    try {
      // Get the current page from ref to avoid stale closure
      const currentPageValue = currentPageRef.current;
      console.log('previousPage called - currentPage:', currentPageValue, 'totalPages:', totalPages);
      
      // For two-page spreads, we need to decrement by 2 to show the previous spread
      const prevSpreadPage = currentPageValue - 2;
      if (prevSpreadPage >= 1) {
        setCurrentPage(prevSpreadPage);
        currentPageRef.current = prevSpreadPage;
        updateSpreadPages(prevSpreadPage);
        updatePageUrl(prevSpreadPage);
        console.log('Navigated to previous spread:', prevSpreadPage);
      }
    } catch (error) {
      console.warn('Error navigating to previous page:', error);
    }
  };

  const nextPage = () => {
    try {
      // Get the current page from ref to avoid stale closure
      const currentPageValue = currentPageRef.current;
      console.log('nextPage called - currentPage:', currentPageValue, 'totalPages:', totalPages);
      
      // For two-page spreads, we need to increment by 2 to show the next spread
      const nextSpreadPage = currentPageValue + 2;
      if (nextSpreadPage <= totalPages) {
        setCurrentPage(nextSpreadPage);
        currentPageRef.current = nextSpreadPage;
        updateSpreadPages(nextSpreadPage);
        updatePageUrl(nextSpreadPage);
        console.log('Navigated to next spread:', nextSpreadPage);
      } else {
        console.log('Cannot go to next page - already at last spread');
      }
    } catch (error) {
      console.error('Error navigating to next page:', error);
    }
  };

  const handleClose = () => {
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
    position: 'relative',
    background: '#000',
    borderRadius: '15px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
    overflow: 'hidden',
    maxWidth: '90vw',
    maxHeight: '90vh'
  };

  const coverDisplayStyle = {
    width: '500px',
    height: '667px',
    margin: '0 auto',
    display: showCover ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isVisible ? 'pointer' : 'default',
    borderRadius: '15px',
    overflow: 'hidden',
    background: '#000',
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 1s ease-out',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
    willChange: 'opacity',
    pointerEvents: isVisible ? 'auto' : 'none'
  };

  const coverImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.2s ease',
    willChange: 'transform'
  };

  const flipbookStyle = {
    width: '1200px',
    height: '900px',
    margin: '0 auto',
    display: showCover || isLoading ? 'none' : 'flex',
    background: '#000',
    borderRadius: '10px',
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
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            fontSize: '14px',
            fontWeight: 'bold',
            opacity: 0.9
          }
        }, '🖱️ Click to open comic book')
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
        }, '🧠 PAUL\'S MEMORY SYSTEM v2.0'),
        
        React.createElement('div', {
          key: 'boot-phase',
          style: {
            fontFamily: 'monospace',
            textAlign: 'center',
            marginBottom: '15px',
            fontSize: '12px',
            opacity: 0.8,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }
        }, `Phase: ${bootPhase}`),
        
        React.createElement('div', {
          key: 'boot-terminal',
          style: {
            fontFamily: 'monospace',
            background: 'rgba(0, 20, 0, 0.8)',
            border: '1px solid #00ff00',
            borderRadius: '8px',
            padding: '15px',
            minHeight: '200px',
            maxHeight: '300px',
            overflowY: 'auto',
            color: '#00ff00',
            maxWidth: '500px',
            margin: '0 auto'
          }
        }, bootMessages.map((message, index) => 
          React.createElement('div', {
            key: index,
            className: index === bootMessages.length - 1 && bootPhase !== 'complete' ? 'terminal-cursor' : '',
            style: {
              marginBottom: '4px',
              animation: 'fadeIn 0.3s ease-in',
              opacity: 1
            }
          }, `> ${message}`)
        )),
        
        React.createElement('div', {
          key: 'boot-progress',
          style: {
            marginTop: '15px',
            background: 'rgba(255, 255, 255, 0.1)',
            height: '4px',
            borderRadius: '2px',
            overflow: 'hidden',
            maxWidth: '500px',
            margin: '15px auto 0'
          }
        }, React.createElement('div', {
          style: {
            background: '#00ff00',
            height: '100%',
            width: bootPhase === 'initializing' ? '25%' : 
                   bootPhase === 'scanning' ? '50%' : 
                   bootPhase === 'loading' ? '75%' : '100%',
            transition: 'width 0.5s ease-out',
            boxShadow: '0 0 10px #00ff00'
          }
        }))
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
      
      !error && !isLoading && flipbookReady && !showCover && React.createElement('div', {
        key: 'controls',
        style: controlsStyle,
        className: 'comic-controls'
      }, [
        React.createElement('button', {
          key: 'prev',
          style: {
            ...controlBtnStyle,
            opacity: currentPage === 1 ? 0.5 : 1,
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          },
          onClick: previousPage,
          disabled: currentPage === 1,
          title: 'Previous Page'
        }, '‹'),
        React.createElement('div', {
          key: 'indicator',
          style: pageIndicatorStyle
        }, `${currentPage} / ${totalPages}`),
        React.createElement('button', {
          key: 'next',
          style: {
            ...controlBtnStyle,
            opacity: currentPage === totalPages ? 0.5 : 1,
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          },
          onClick: nextPage,
          disabled: currentPage === totalPages,
          title: 'Next Page'
        }, '›')
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
    
    @media (max-width: 1100px) {
      .flipbook {
        width: 800px !important;
        height: 600px !important;
      }
      .flipbook .page {
        width: 400px !important;
        height: 600px !important;
      }
    }
    
    @media (max-width: 900px) {
      .flipbook {
        width: 600px !important;
        height: 450px !important;
      }
      .flipbook .page {
        width: 300px !important;
        height: 450px !important;
      }
    }
    
    @media (max-width: 700px) {
      .flipbook {
        width: 400px !important;
        height: 300px !important;
      }
      .flipbook .page {
        width: 200px !important;
        height: 300px !important;
      }
    }
  `;
  document.head.appendChild(style);
}
