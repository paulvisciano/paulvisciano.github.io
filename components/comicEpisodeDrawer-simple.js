// Simple Comic Episode Drawer Component - Debug Version
window.ComicEpisodeDrawer = ({ content, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [bootPhase, setBootPhase] = React.useState('initializing');
  const [bootMessages, setBootMessages] = React.useState([]);
  const [showCover, setShowCover] = React.useState(false);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [showFlipbook, setShowFlipbook] = React.useState(false);
  const [isOpeningFlipbook, setIsOpeningFlipbook] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(8);
  const [error, setError] = React.useState(null);
  
  const flipbookRef = React.useRef(null);
  
  // Comic pages
  const pages = [
    'cover.png',
    'ep-20-page-1.png',
    'ep-20-page-2.png',
    'ep-20-page-3.png',
    'ep-20-page-4.png',
    'ep-20-page-5.png',
    'ep-20-page-6.png',
    'ep-20-page-7.png'
  ];

  React.useEffect(() => {
    console.log('Simple comic drawer mounted');
    
    const addBootMessage = (message, delay = 0) => {
      setTimeout(() => {
        setBootMessages(prev => [...prev, message]);
      }, delay);
    };

    // Minimalist loading sequence
    addBootMessage('Connecting to memory...', 200);
    addBootMessage('Bangkok, September 16, 2025', 500);
    
    setTimeout(() => {
      setBootPhase('scanning');
      addBootMessage('Locating episode 20...', 0);
      addBootMessage('Urban Runner memory found', 300);
    }, 800);

    setTimeout(() => {
      setBootPhase('loading');
      addBootMessage('Loading comic pages...', 0);
      addBootMessage('Preparing flipbook...', 400);
      
      setTimeout(() => {
        addBootMessage('Ready', 0);
        
        setTimeout(() => {
          setBootPhase('complete');
          // Start transition sequence
          setIsTransitioning(true);
          
          // After transition starts, hide console and show cover
          setTimeout(() => {
            setIsLoading(false);
            setShowCover(true);
          }, 400); // Start cover fade sooner for longer overlap
        }, 400);
      }, 800);
    }, 1400);
  }, []);

  // Turn.js flipbook functions
  const createFlipbook = () => {
    if (!flipbookRef.current) return;
    
    try {
      const flipbookElement = flipbookRef.current;
      flipbookElement.innerHTML = '';
      
      console.log('Creating flipbook with', pages.length, 'pages');
      
      // Create pages
      for (let i = 0; i < pages.length; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page';
        pageDiv.style.backgroundColor = 'transparent';
        
        const img = document.createElement('img');
        img.src = `/moments/2025/episode-20/${pages[i]}`;
        img.alt = `Page ${i + 1}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.draggable = false;
        img.style.userSelect = 'none';
        img.style.webkitUserDrag = 'none';
        // Don't set pointer-events: none - Turn.js needs mouse events
        
        // Add error handling for images
        img.onerror = () => {
          console.error(`Failed to load image: ${pages[i]}`);
          pageDiv.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">Page ${i + 1}<br>Image not found</div>`;
        };
        
        pageDiv.appendChild(img);
        flipbookElement.appendChild(pageDiv);
      }
      
      // Initialize Turn.js
      setTimeout(() => {
        if (window.$ && window.$.fn.turn) {
          console.log('Initializing Turn.js...');
          window.$(flipbookElement).turn({
            width: 1200,
            height: 900,
            autoCenter: true,
            duration: 600,
            pages: pages.length,
            display: 'double',
            page: 2, // Start directly on page 2
            elevation: 50,
            gradients: true,
            acceleration: true,
            turnCorners: "bl,br,tl,tr",
            when: {
              turning: (event, page, view) => {
                setCurrentPage(page);
              },
              turned: (event, page, view) => {
                setCurrentPage(page);
              }
            }
          });
          
          // Set current page state immediately
          setCurrentPage(2);
          
          console.log('Turn.js flipbook initialized successfully');
        } else {
          console.error('Turn.js not available');
          setError('Turn.js library not loaded');
        }
      }, 200);
      
    } catch (error) {
      console.error('Error creating flipbook:', error);
      setError('Paul\'s Bangkok adventure is taking a coffee break... ☕');
    }
  };

  const openComicBook = () => {
    console.log('openComicBook called - starting transition');
    // Start transition
    setIsOpeningFlipbook(true);
    
    // After cover fades out, show flipbook
    setTimeout(() => {
      console.log('Transition timeout reached - switching to flipbook');
      setShowCover(false);
      setShowFlipbook(true);
      
      // Create flipbook after state update
      setTimeout(() => {
        console.log('About to call createFlipbook');
        createFlipbook();
      }, 100);
    }, 600); // Wait for cover fade-out
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showFlipbook) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (flipbookRef.current && window.$ && window.$.fn.turn) {
          window.$(flipbookRef.current).turn('previous');
        }
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (flipbookRef.current && window.$ && window.$.fn.turn) {
          window.$(flipbookRef.current).turn('next');
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
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(8px)'
  };

  const containerStyle = {
    background: 'rgba(0, 0, 0, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '24px',
    width: '420px',
    minHeight: '280px',
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
    opacity: isTransitioning ? 0 : 1,
    transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
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

  if (showFlipbook) {
    return React.createElement('div', { style: overlayStyle }, [
      React.createElement('div', { 
        key: 'flipbook-container', 
        style: {
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(8px)',
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
            opacity: showFlipbook ? 1 : 0,
            transform: showFlipbook ? 'scale(1)' : 'scale(0.95)',
            transition: 'opacity 0.8s ease-out, transform 0.8s ease-out'
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
        }, `Page ${currentPage} of ${totalPages} • Use ← → arrow keys or drag to flip pages`)
      ])
    ]);
  }

  if (showCover) {
    return React.createElement('div', { style: overlayStyle }, [
      React.createElement('div', { 
        key: 'cover-container', 
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
          key: 'cover',
          style: {
            width: '500px',
            height: '667px',
            margin: '0 auto',
            borderRadius: '15px',
            overflow: 'hidden',
            background: '#000',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
            cursor: 'pointer',
            position: 'relative',
            opacity: isOpeningFlipbook ? 0 : 1,
            transform: isOpeningFlipbook ? 'scale(0.9)' : 'scale(1)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out'
          },
          onClick: openComicBook
        }, [
          React.createElement('img', {
            key: 'cover-img',
            src: '/moments/2025/episode-20/cover.png',
            alt: 'Episode 20 Cover',
            style: {
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }
          }),
          React.createElement('div', {
            key: 'overlay-text',
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
              fontWeight: 'bold'
            }
          }, '🖱️ Click to open comic book')
        ])
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
    }
    
    .flipbook .page {
      background-color: transparent;
      background-size: 100% 100%;
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    
    .flipbook .page img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      user-select: none;
      -webkit-user-drag: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }
    
    .flipbook-container {
      perspective: 1000px;
    }
    
    /* Responsive flipbook sizes */
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