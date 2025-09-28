// Comic Episode Drawer Component
window.ComicEpisodeDrawer = ({ content, onClose }) => {
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
  const flipbookRef = React.useRef(null);
  const coverRef = React.useRef(null);
  
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
  
  // Generate pages based on episode data
  const getPages = () => {
    if (!episodeData) {
      // Fallback to Bangkok Episode 20
      return [
        '/moments/bangkok/2025-09-16/cover.png', // Cover
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
    const pagesArray = [`${basePath}/cover.png`]; // Cover first
    
    // Generate pages based on episode type
    if (episodeData.id.includes('istanbul')) {
      // Istanbul Episode 2 - 13 pages
      for (let i = 1; i <= 13; i++) {
        pagesArray.push(`${basePath}/page-${i.toString().padStart(2, '0')}.png`);
      }
    } else if (episodeData.id.includes('bangkok')) {
      // Bangkok Episode 20 - 7 pages
      for (let i = 1; i <= 7; i++) {
        pagesArray.push(`${basePath}/page-${i.toString().padStart(2, '0')}.png`);
      }
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
    setShowCover(false);
    setIsLoading(true);
    
    // Update URL to include page 1 (first content page)
    updatePageUrl(1);
    
    // Initialize flipbook after cover transition and go to page 1
    setTimeout(() => {
      if (flipbookRef.current && window.$ && window.$.fn.turn) {
        createFlipbook(1); // Start on page 1 (first content page)
      } else {
        setError('The story pages need a moment to catch up with Paul\'s adventures... ⏳');
        setIsLoading(false);
      }
    }, 300);
  };

  // Function to update URL with current page
  const updatePageUrl = (pageNumber) => {
    const episodeId = content.postId || content.id;
    const newPath = `/moments/${episodeId}/page/${pageNumber}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ 
        momentId: episodeId, 
        page: pageNumber 
      }, '', newPath);
    }
  };

  // Function to get initial page from URL
  const getInitialPage = () => {
    const pathParts = window.location.pathname.split('/');
    const pageIndex = pathParts.indexOf('page');
    if (pageIndex !== -1 && pathParts[pageIndex + 1]) {
      const pageNum = parseInt(pathParts[pageIndex + 1]);
      return pageNum >= 1 && pageNum <= pages.length ? pageNum : 1;
    }
    return 1;
  };

  const createFlipbook = (startPage = 1) => {
    if (!flipbookRef.current) return;
    
    try {
      const flipbookElement = flipbookRef.current;
      
      // Clear existing content
      flipbookElement.innerHTML = '';
      
      // Create pages synchronously
      for (let i = 0; i < pages.length; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = i === 0 || i === pages.length - 1 ? 'hard' : 'page';
        
        const img = document.createElement('img');
        img.src = pages[i];
        img.alt = `Page ${i + 1}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        
        // Prevent native image dragging but allow mouse events to pass through
        img.draggable = false;
        img.ondragstart = (e) => {
          e.preventDefault();
          return false;
        };
        // Don't prevent mousedown - let it bubble to Turn.js
        img.style.pointerEvents = 'none';
        
        // Add error handling but don't wait for load
        img.onerror = (error) => {
          console.warn(`Failed to load image: ${pages[i]}`, error);
        };
        
        pageDiv.appendChild(img);
        flipbookElement.appendChild(pageDiv);
      }
      
      // Initialize Turn.js after a small delay
      setTimeout(() => {
        initializeTurnJs(flipbookElement, startPage);
      }, 100);
      
    } catch (error) {
      console.error('Error creating flipbook:', error);
      setError('Paul\'s Bangkok adventure is taking a coffee break... ☕');
      setIsLoading(false);
    }
  };
  
  const initializeTurnJs = (flipbookElement, startPage = 1) => {
    try {
      if (window.$ && window.$.fn.turn) {
          window.$(flipbookElement).turn({
            width: 1000,
            height: 750,
            autoCenter: true,
            duration: 600,
            pages: pages.length,
            elevation: 50,
            gradients: true,
            acceleration: true,
            turnCorners: "bl,br,tl,tr",
            display: "double",
            when: {
              turning: (event, page, view) => {
                setCurrentPage(page);
                updatePageUrl(page);
              },
              turned: (event, page, view) => {
                setCurrentPage(page);
                updatePageUrl(page);
              },
              start: (event, pageObject, corner) => {
              },
              end: (event, pageObject, corner) => {
              }
            }
          });
        
        // Enable mouse and touch events for page dragging
        window.$(flipbookElement).bind('start', function(event, pageObject, corner) {
          // Ensure dragging is enabled
          window.$(this).css('cursor', 'grabbing');
        });
        
        window.$(flipbookElement).bind('end', function(event, pageObject, corner) {
          window.$(this).css('cursor', 'grab');
        });
        
        // Only prevent image dragging, let Turn.js handle mouse events
        window.$(flipbookElement).on('dragstart', 'img', function(e) {
          e.preventDefault();
          return false;
        });
        
        window.$(flipbookElement).on('selectstart', function(e) {
          e.preventDefault();
          return false;
        });
        
        // Add click handlers for page navigation as fallback
        window.$(flipbookElement).bind('click', function(event) {
          const flipbook = window.$(flipbookElement);
          const page = flipbook.turn('page');
          const totalPages = flipbook.turn('pages');
          const clickX = event.pageX - window.$(this).offset().left;
          const bookWidth = window.$(this).width();
          
          // Click on right half = next page, left half = previous page
          if (clickX > bookWidth / 2 && page < totalPages) {
            flipbook.turn('next');
          } else if (clickX <= bookWidth / 2 && page > 1) {
            flipbook.turn('previous');
          }
        });
        
        // Set initial page from URL or start page
        const targetPage = Math.max(startPage, getInitialPage());
        if (targetPage > 1) {
          setTimeout(() => {
            window.$(flipbookElement).turn('page', targetPage);
            setCurrentPage(targetPage);
          }, 100);
        }
        
        setIsLoading(false);
        setFlipbookReady(true);
      } else {
        throw new Error('Turn.js not available');
      }
    } catch (turnError) {
      console.error('Error initializing Turn.js:', turnError);
      setError('Hmm, Paul\'s story seems to be stuck in the loading screen... 📖');
      setIsLoading(false);
    }
  };

  const previousPage = () => {
    try {
      if (flipbookRef.current && window.$ && window.$.fn.turn) {
        // Get the actual current page from Turn.js
        const turnCurrentPage = window.$(flipbookRef.current).turn('page');
        if (turnCurrentPage > 1) {
          window.$(flipbookRef.current).turn('previous');
        }
      }
    } catch (error) {
      console.warn('Error navigating to previous page:', error);
    }
  };

  const nextPage = () => {
    try {
      if (flipbookRef.current && window.$ && window.$.fn.turn) {
        // Get the actual current page from Turn.js
        const turnCurrentPage = window.$(flipbookRef.current).turn('page');
        if (turnCurrentPage < totalPages) {
          window.$(flipbookRef.current).turn('next');
        }
      }
    } catch (error) {
      console.warn('Error navigating to next page:', error);
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
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(8px)'
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
    width: '1000px',
    height: '750px',
    margin: '0 auto',
    display: showCover || isLoading ? 'none' : 'block'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '-15px',
    right: '-15px',
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
      
      showCover && !error && React.createElement('div', {
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
