// Simple Comic Episode Drawer Component - Debug Version
window.ComicEpisodeDrawerSimple = ({ content, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [bootPhase, setBootPhase] = React.useState('initializing');
  const [bootMessages, setBootMessages] = React.useState([]);
  const [showCover, setShowCover] = React.useState(false);
  const [showFlipbook, setShowFlipbook] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(8);
  const [error, setError] = React.useState(null);
  const [isPortrait, setIsPortrait] = React.useState(window.innerHeight > window.innerWidth);
  const [episodeData, setEpisodeData] = React.useState(null);
  
  const flipbookRef = React.useRef(null);
  
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
        '', // Blank first page for proper double-page alignment
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
    const pagesArray = [''];
    
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
    } else {
      // Fallback to Bangkok Episode 20
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
    if (!episodeData) return; // Wait for episode data to be loaded
    
    const addBootMessage = (message, delay = 0) => {
      setTimeout(() => {
        setBootMessages(prev => [...prev, message]);
      }, delay);
    };

    // Minimalist loading sequence
    addBootMessage('Connecting to memory...', 200);
    const episodeTitle = episodeData ? episodeData.title : 'Bangkok Episode 20';
    const episodeDate = episodeData ? episodeData.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'September 16, 2025';
    addBootMessage(`${episodeTitle}, ${episodeDate}`, 500);
    
    setTimeout(() => {
      setBootPhase('scanning');
      const episodeNumber = episodeData ? episodeData.id.match(/episode-(\d+)/)?.[1] || '20' : '20';
      addBootMessage(`Locating episode ${episodeNumber}...`, 0);
      addBootMessage(`${episodeTitle} memory found`, 300);
    }, 800);

    setTimeout(() => {
      setBootPhase('loading');
      addBootMessage('Loading comic pages...', 0);
      addBootMessage('Preparing flipbook...', 400);
      
      setTimeout(() => {
        addBootMessage('Ready', 0);
        
        setTimeout(() => {
          setBootPhase('complete');
          
          // Show cover first
          setTimeout(() => {
            setIsLoading(false);
            setShowCover(true);
          }, 400);
        }, 400);
      }, 800);
    }, 1400);
  }, [episodeData]);

  // Turn.js flipbook functions
  const createFlipbook = () => {
    if (!flipbookRef.current) return;
    
    try {
      const flipbookElement = flipbookRef.current;
      flipbookElement.innerHTML = '';
      
      console.log('Creating flipbook with', pages.length, 'pages');
      
      // Create pages with explicit Turn.js page attributes
      for (let i = 0; i < pages.length; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.setAttribute('data-page', i + 1); // Turn.js page numbering starts at 1
        pageDiv.style.backgroundColor = 'transparent';
        pageDiv.style.width = '100%';
        pageDiv.style.height = '100%';
        pageDiv.style.position = 'relative';
        pageDiv.style.overflow = 'hidden';
        
        
        if (pages[i] === '') {
          // Blank first page for proper double-page alignment - no visible content
          pageDiv.innerHTML = `<div style="width: 100%; height: 100%; background: transparent;"></div>`;
        } else {
          const img = document.createElement('img');
          img.src = pages[i];
          img.alt = `Page ${i + 1}`;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          img.draggable = false;
          img.style.userSelect = 'none';
          img.style.webkitUserDrag = 'none';
          
          // Add error handling for images
          img.onerror = () => {
            console.error(`Failed to load image: ${pages[i]}`);
            pageDiv.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">Page ${i + 1}<br>Image not found: ${pages[i]}</div>`;
          };
          
          img.onload = () => {
            console.log(`Successfully loaded: ${pages[i]}`);
          };
          
          pageDiv.appendChild(img);
        }
        
        flipbookElement.appendChild(pageDiv);
      }
      
      // Initialize Turn.js
      setTimeout(() => {
        // Verify element exists and is in DOM
        if (!flipbookElement || !flipbookElement.parentNode) {
          console.error('Flipbook element not in DOM');
          setError('Flipbook element not properly mounted');
          return;
        }
        
        // Verify jQuery and Turn.js are available
        if (!window.$ || !window.$.fn.turn) {
          console.error('jQuery or Turn.js not available');
          setError('Required libraries not loaded');
          return;
        }
        
        // Verify pages exist
        if (flipbookElement.children.length === 0) {
          console.error('No pages found in flipbook element');
          setError('No pages created');
          return;
        }
        
        console.log('Initializing Turn.js with', flipbookElement.children.length, 'pages...');
        
        // Ensure jQuery can find the element
        const $flipbook = window.$(flipbookElement);
        if ($flipbook.length === 0) {
          console.error('jQuery cannot find flipbook element');
          setError('Element not accessible by jQuery');
          return;
        }
        
        try {
          // Determine initial display mode based on device and orientation
          const isMobile = window.innerWidth < 768;
          const initialDisplay = (isMobile && isPortrait) ? 'single' : 'double';
          const initialPage = (isMobile && isPortrait) ? 1 : 2; // Start on page 1 in mobile portrait
          
          console.log(`Initializing Turn.js with display: ${initialDisplay}, mobile: ${isMobile}, portrait: ${isPortrait}`);
          console.log(`Screen size: ${window.innerWidth}x${window.innerHeight}`);
          
          // Mobile dimensions to match cover size for smooth transition
          const flipbookWidth = isMobile ? 
            (isPortrait ? Math.min(window.innerWidth * 0.8, 400) : Math.min(window.innerWidth * 0.95, 800)) : 
            780;
          const flipbookHeight = isMobile ? 
            (isPortrait ? Math.min(window.innerHeight * 0.7, 600) : Math.min(window.innerHeight * 0.8, 600)) : 
            560;
            
          console.log(`Calculated flipbook dimensions: ${flipbookWidth}x${flipbookHeight}`);
          
          $flipbook.turn({
            width: flipbookWidth,
            height: flipbookHeight,
            autoCenter: true,
            duration: 600, // Slower for visible animation
            pages: pages.length,
            display: initialDisplay,
            page: initialPage,
            elevation: 50, // Restore elevation for 3D effect
            gradients: true, // Enable gradients for realistic shadows
            acceleration: true, // Enable acceleration for smooth animation
            turnCorners: "bl,br,tl,tr",
            inclination: 75, // Angle of the page flip
            when: {
              turning: (event, page, view) => {
                console.log(`Turn.js turning to page ${page}, view: ${view}`);
                setCurrentPage(page);
                
                // Re-force dimensions during page turns on mobile
                if (isMobile && flipbookRef.current) {
                  const allPages = flipbookRef.current.querySelectorAll('div');
                  allPages.forEach((pageEl) => {
                    pageEl.style.setProperty('width', flipbookWidth + 'px', 'important');
                    pageEl.style.setProperty('height', flipbookHeight + 'px', 'important');
                  });
                }
                
                // Hide page 6 during problematic transitions
                const $flipbook = window.$(flipbookRef.current);
                if ((page === 4 && view.includes('4')) || (page === 2 && view.includes('2'))) {
                  // Hide page 6 specifically during 1-2 <-> 3-4 transitions
                  $flipbook.find('[data-page="6"]').css('visibility', 'hidden');
                  
                  // Restore after transition
                  setTimeout(() => {
                    $flipbook.find('[data-page="6"]').css('visibility', 'visible');
                  }, 650); // Slightly longer than animation duration
                }
              },
              turned: (event, page, view) => {
                console.log(`Turn.js turned to page ${page}, view: ${view}`);
                setCurrentPage(page);
                
                // Handle mobile single page mode navigation
                if (isMobile && isPortrait) {
                  const $flipbook = window.$(flipbookRef.current);
                  
                  // Ensure we're in single mode
                  $flipbook.turn('display', 'single');
                  
                  // Force correct page display
                  if (page === 1) {
                    // On blank page, show just blank
                    console.log('On blank page 1');
                  } else {
                    // On content pages, ensure correct single page is shown
                    console.log(`Showing single page ${page}`);
                  }
                }
                
                // Re-force dimensions after page turn completes on mobile
                if (isMobile && flipbookRef.current) {
                  setTimeout(() => {
                    const allPages = flipbookRef.current.querySelectorAll('div');
                    allPages.forEach((pageEl) => {
                      pageEl.style.setProperty('width', flipbookWidth + 'px', 'important');
                      pageEl.style.setProperty('height', flipbookHeight + 'px', 'important');
                    });
                    console.log(`Re-forced all page dimensions to ${flipbookWidth}x${flipbookHeight} after page turn`);
                  }, 50);
                }
                
                // Ensure all pages are visible after transition completes
                const $flipbook = window.$(flipbookRef.current);
                $flipbook.find('.page').css('visibility', 'visible');
              },
              start: (event, pageObject, corner) => {
                console.log(`Turn.js start event, page: ${pageObject.page}, corner: ${corner}`);
              },
              end: (event, pageObject, turned) => {
                console.log(`Turn.js end event, page: ${pageObject.page}, turned: ${turned}`);
              }
            }
          });
          
          // Set current page state based on initial display mode
          setCurrentPage(initialPage);
          
          // Force size update for mobile after initialization
          if (isMobile) {
            setTimeout(() => {
              $flipbook.turn('size', flipbookWidth, flipbookHeight);
              console.log(`Forced size update to ${flipbookWidth}x${flipbookHeight}`);
              
              // Also force CSS dimensions
              if (flipbookRef.current) {
                flipbookRef.current.style.width = flipbookWidth + 'px';
                flipbookRef.current.style.height = flipbookHeight + 'px';
                flipbookRef.current.style.minWidth = flipbookWidth + 'px';
                flipbookRef.current.style.minHeight = flipbookHeight + 'px';
                flipbookRef.current.style.maxWidth = flipbookWidth + 'px';
                flipbookRef.current.style.maxHeight = flipbookHeight + 'px';
                flipbookRef.current.style.setProperty('width', flipbookWidth + 'px', 'important');
                flipbookRef.current.style.setProperty('height', flipbookHeight + 'px', 'important');
                
                // Force all child elements to match container size
                const allPages = flipbookRef.current.querySelectorAll('div');
                allPages.forEach((pageEl, index) => {
                  pageEl.style.width = flipbookWidth + 'px';
                  pageEl.style.height = flipbookHeight + 'px';
                  pageEl.style.maxWidth = flipbookWidth + 'px';
                  pageEl.style.maxHeight = flipbookHeight + 'px';
                  console.log(`Forced page ${index} to ${flipbookWidth}x${flipbookHeight}`);
                });
                
                console.log(`Forced CSS dimensions to ${flipbookWidth}x${flipbookHeight}`);
                console.log(`Actual element size after force:`, flipbookRef.current.offsetWidth, 'x', flipbookRef.current.offsetHeight);
              }
            }, 100);
          }
          
          // Make flipbook visible after Turn.js is fully initialized
          setTimeout(() => {
            if (flipbookRef.current) {
              console.log('Making flipbook visible');
              flipbookRef.current.style.visibility = 'visible';
              flipbookRef.current.style.opacity = '1';
              flipbookRef.current.style.transform = 'scale(1)';
            } else {
              console.error('flipbookRef.current is null when trying to make visible');
            }
          }, 300); // Longer delay to ensure Turn.js is completely ready
          
          console.log('Turn.js flipbook initialized successfully');
          
        } catch (turnError) {
          console.error('Turn.js initialization failed:', turnError);
          setError('Turn.js failed to initialize: ' + turnError.message);
        }
      }, 200);
      
    } catch (error) {
      console.error('Error creating flipbook:', error);
      setError('Paul\'s Bangkok adventure is taking a coffee break... ☕');
    }
  };

  const openComicBook = () => {
    setShowCover(false);
    setShowFlipbook(true);
    
    // Create flipbook after state update
    setTimeout(() => {
      createFlipbook();
    }, 100);
  };

  // Orientation change handler
  React.useEffect(() => {
    const handleOrientationChange = () => {
      const newIsPortrait = window.innerHeight > window.innerWidth;
      setIsPortrait(newIsPortrait);
      
      // Update Turn.js display mode and size based on orientation
      if (showFlipbook && flipbookRef.current && window.$ && window.$.fn.turn) {
        const $flipbook = window.$(flipbookRef.current);
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          // Calculate new dimensions to match cover size
          const newWidth = newIsPortrait ? 
            Math.min(window.innerWidth * 0.8, 400) : 
            Math.min(window.innerWidth * 0.95, 800);
          const newHeight = newIsPortrait ? 
            Math.min(window.innerHeight * 0.7, 600) : 
            Math.min(window.innerHeight * 0.8, 600);
          
          // Update Turn.js size and display mode
          $flipbook.turn('size', newWidth, newHeight);
          
          // Force CSS dimensions as well
          if (flipbookRef.current) {
            flipbookRef.current.style.width = newWidth + 'px';
            flipbookRef.current.style.height = newHeight + 'px';
          }
          
          if (newIsPortrait) {
            $flipbook.turn('display', 'single');
            console.log(`Switched to single page mode (portrait) - ${newWidth}x${newHeight}`);
          } else {
            $flipbook.turn('display', 'double');
            console.log(`Switched to double page mode (landscape) - ${newWidth}x${newHeight}`);
          }
        }
      }
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, [showFlipbook]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showFlipbook) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (flipbookRef.current && window.$ && window.$.fn.turn) {
          const $flipbook = window.$(flipbookRef.current);
          const currentPage = $flipbook.turn('page');
          console.log(`Arrow left: current page ${currentPage}`);
          
          // Handle mobile single mode navigation
          if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
            if (currentPage > 1) {
              $flipbook.turn('page', currentPage - 1);
            }
          } else {
            $flipbook.turn('previous');
          }
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (flipbookRef.current && window.$ && window.$.fn.turn) {
          const $flipbook = window.$(flipbookRef.current);
          const currentPage = $flipbook.turn('page');
          const totalPages = $flipbook.turn('pages');
          console.log(`Arrow right: current page ${currentPage}, total ${totalPages}`);
          
          // Handle mobile single mode navigation
          if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
            if (currentPage < totalPages) {
              $flipbook.turn('page', currentPage + 1);
            }
          } else {
            $flipbook.turn('next');
          }
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showFlipbook, onClose]);

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'transparent', // Make main overlay transparent
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  };

  const containerStyle = {
    background: 'rgba(0, 0, 0, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: window.innerWidth < 768 ? '16px' : '24px', // Less padding on mobile
    width: window.innerWidth < 768 ? '300px' : '420px', // Smaller on mobile
    minHeight: window.innerWidth < 768 ? '220px' : '280px', // Shorter on mobile
    textAlign: 'center',
    fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, monospace',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    position: 'relative'
  };

  const buttonStyle = {
    background: '#ff4757',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    margin: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontFamily: 'monospace'
  };

  // Console with crossfade transition
  const consoleStyle = {
    ...containerStyle,
    opacity: 1,
    transform: 'scale(1)',
    transition: 'opacity 1.2s ease-out, transform 1.2s ease-out'
  };

  if (error) {
    return React.createElement('div', { style: overlayStyle }, [
      React.createElement('div', { key: 'container', style: containerStyle }, [
        React.createElement('h2', { key: 'title' }, '🧠 PAUL\'S MEMORY SYSTEM - ERROR'),
        React.createElement('p', { key: 'message' }, error),
        React.createElement('button', {
          key: 'close',
          style: buttonStyle,
          onClick: onClose
        }, 'Close')
      ])
    ]);
  }

  if (isLoading) {
    return React.createElement('div', { style: overlayStyle }, [
      React.createElement('div', { 
        key: 'console', 
        style: consoleStyle
      }, [
        React.createElement('h2', { 
          key: 'title',
          style: {
            margin: '0 0 8px 0',
            fontSize: '16px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }
        }, 'Loading Memory'),
        React.createElement('p', { 
          key: 'status',
          style: {
            margin: '0 0 16px 0',
            fontSize: '12px',
            opacity: 0.6,
            letterSpacing: '1px'
          }
        }, `${bootPhase}...`),
        React.createElement('div', { 
          key: 'messages', 
          style: { 
            marginTop: '12px',
            textAlign: 'left',
            height: '140px',
            overflowY: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            fontSize: '11px'
          } 
        }, bootMessages.map((message, index) => 
          React.createElement('div', { 
            key: index,
            style: { 
              marginBottom: '4px',
              opacity: 0.8,
              fontSize: '11px',
              fontFamily: 'SF Mono, Monaco, monospace',
              letterSpacing: '0.3px'
            }
          }, message)
        )),
        React.createElement('div', {
          key: 'progress',
          style: {
            marginTop: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            height: '2px',
            borderRadius: '1px',
            overflow: 'hidden'
          }
        }, React.createElement('div', {
          style: {
            background: '#ffffff',
            height: '100%',
            width: bootPhase === 'initializing' ? '33%' : 
                   bootPhase === 'scanning' ? '66%' : '100%',
            transition: 'width 0.6s ease-out',
            opacity: 0.8
          }
        }))
      ])
    ]);
  }

  if (showCover) {
    return React.createElement('div', { style: overlayStyle }, [
        React.createElement('div', { 
        key: 'cover-container', 
        style: {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: window.innerWidth < 768 ? 'flex-start' : 'center', // Higher on mobile
          justifyContent: 'center',
          paddingTop: window.innerWidth < 768 ? '80px' : '20px', // Only top padding on mobile
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '10px',
          boxSizing: 'border-box'
        }
      }, [
        React.createElement('button', {
          key: 'close',
          style: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 10001
          },
          onClick: onClose
        }, '×'),
        
        React.createElement('img', {
          key: 'cover',
          src: episodeData ? `${episodeData.fullLink.replace(/\/$/, '')}/cover.png` : '/moments/bangkok/2025-09-16/cover.png',
          alt: episodeData ? `${episodeData.title} Cover` : 'Episode 20 Cover',
          style: {
            width: window.innerWidth < 768 ? '80vw' : '400px', // Slightly smaller width
            height: window.innerWidth < 768 ? '70vh' : '600px', // Less tall to prevent cropping
            maxWidth: window.innerWidth < 768 ? '400px' : '400px', // Reasonable max width
            objectFit: 'fill', // Fill to show full cover without cropping
            cursor: 'pointer',
            borderRadius: '8px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
          },
          onClick: openComicBook
        })
      ])
    ]);
  }

  if (showFlipbook) {
    return React.createElement('div', { style: overlayStyle }, [
      React.createElement('div', { 
        key: 'flipbook-container', 
        style: {
          background: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }
      }, [
        React.createElement('button', {
          key: 'close',
          style: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#ff4757',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 10001
          },
          onClick: onClose
        }, '×'),
        
        React.createElement('div', {
          key: 'flipbook',
          ref: flipbookRef,
          style: {
            margin: '0 auto',
            opacity: 0, // Start invisible, will be made visible by Turn.js init
            transform: 'scale(0.95)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out',
            visibility: 'hidden' // Keep hidden until Turn.js is ready
          },
          className: 'flipbook'
        }),
        
        React.createElement('div', {
          key: 'controls',
          style: {
            marginTop: '20px',
            textAlign: 'center',
            color: '#ffffff',
            fontSize: '14px',
            opacity: 0.7
          }
        }, 'Use ← → arrow keys or drag to flip pages')
      ])
    ]);
  }


  // Fallback
  return React.createElement('div', { style: overlayStyle }, [
    React.createElement('div', { key: 'container', style: containerStyle }, [
      React.createElement('h2', { key: 'title' }, '🧠 LOADING...'),
      React.createElement('p', { key: 'message' }, 'Initializing...'),
      React.createElement('button', {
        key: 'close',
        style: buttonStyle,
        onClick: onClose
      }, 'Close')
    ])
  ]);
};

// Add Turn.js CSS styles
if (!document.querySelector('#comic-flipbook-styles')) {
  const style = document.createElement('style');
  style.id = 'comic-flipbook-styles';
  style.textContent = `
    .flipbook {
      margin: 0 auto;
      font-size: 0 !important;
      line-height: 0 !important;
    }
    
    
    .flipbook .hard {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .flipbook .odd {
      margin-right: 0 !important;
      float: left !important;
    }
    
    .flipbook .even {
      margin-left: 0 !important;
      float: right !important;
    }
    
    .flipbook > div {
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      display: inline-block !important;
      vertical-align: top !important;
    }
    
    .flipbook .page {
      background-color: transparent !important;
      background: transparent !important;
      background-size: 100% 100%;
      box-shadow: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      position: relative !important;
      display: inline-block !important;
      vertical-align: top !important;
      overflow: hidden !important;
      width: 100% !important;
      height: 100% !important;
    }
    
    .flipbook .page:nth-child(even) {
      margin-left: 0 !important;
      left: 0 !important;
    }
    
    .flipbook .page:nth-child(odd) {
      margin-right: 0 !important;
      right: 0 !important;
    }
    
    /* Force pages to touch - aggressive approach */
    .flipbook .page.p1 { 
      right: 0 !important; 
      margin-right: -2px !important;
    }
    .flipbook .page.p2 { 
      left: 0 !important; 
      margin-left: -2px !important;
    }
    .flipbook .page.p3 { 
      right: 0 !important; 
      margin-right: -2px !important;
    }
    .flipbook .page.p4 { 
      left: 0 !important; 
      margin-left: -2px !important;
    }
    .flipbook .page.p5 { 
      right: 0 !important; 
      margin-right: -2px !important;
    }
    .flipbook .page.p6 { 
      left: 0 !important; 
      margin-left: -2px !important;
    }
    .flipbook .page.p7 { 
      right: 0 !important; 
      margin-right: -2px !important;
    }
    .flipbook .page.p8 { 
      left: 0 !important; 
      margin-left: -2px !important;
    }
    
    /* Additional gap elimination */
    .flipbook .page:first-child {
      margin-right: -2px !important;
    }
    
    .flipbook .page:last-child {
      margin-left: -2px !important;
    }
    
    .flipbook .page img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
    }
    
    /* Prevent flash of wrong pages during transitions */
    .flipbook .page {
      overflow: hidden;
    }
    
    /* Ensure pages render in correct z-order */
    .flipbook .page:nth-child(1) { z-index: 1; }
    .flipbook .page:nth-child(2) { z-index: 2; }
    .flipbook .page:nth-child(3) { z-index: 3; }
    .flipbook .page:nth-child(4) { z-index: 4; }
    .flipbook .page:nth-child(5) { z-index: 5; }
    .flipbook .page:nth-child(6) { z-index: 6; }
    .flipbook .page:nth-child(7) { z-index: 7; }
    .flipbook .page:nth-child(8) { z-index: 8; }
    
    
    .flipbook-container {
      perspective: 1000px;
    }
    
    /* Mobile responsive flipbook sizes - match cover dimensions */
    @media (max-width: 768px) {
      /* Portrait mode - single page, match cover dimensions */
      @media (orientation: portrait) {
        .flipbook {
          width: 80vw !important;
          height: 70vh !important;
          max-width: 80vw !important;
          max-height: 70vh !important;
          min-width: 80vw !important;
          min-height: 70vh !important;
        }
        .flipbook .page {
          width: 100% !important;
          height: 100% !important;
          max-width: none !important;
          max-height: none !important;
          min-width: 100% !important;
          min-height: 100% !important;
        }
        .flipbook .page img {
          width: 100% !important;
          height: 100% !important;
          object-fit: fill !important;
        }
      }
      
      /* Landscape mode - double page, wider */
      @media (orientation: landscape) {
        .flipbook {
          width: 95vw !important;
          height: 85vh !important;
          max-width: 800px !important;
          max-height: 600px !important;
        }
        .flipbook .page {
          width: 47vw !important;
          height: 85vh !important;
          max-width: 400px !important;
          max-height: 600px !important;
        }
      }
    }
    
    @media (max-width: 1300px) {
      .flipbook {
        width: 1000px !important;
        height: 750px !important;
      }
      .flipbook .page {
        width: 500px !important;
        height: 750px !important;
      }
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
    
    @media (max-width: 650px) {
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