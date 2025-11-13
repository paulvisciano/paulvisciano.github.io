// ============================================================================
// Device-Specific Render Functions
// ============================================================================

/**
 * Render header buttons (close and fullscreen) - shared across all devices
 */
const renderHeaderButtons = (styles, { handleClose, toggleFullscreen, isFullscreen }) => {
  return [
    React.createElement('button', {
      key: 'close',
      style: styles.closeButtonStyle || {},
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
    
    React.createElement('button', {
      key: 'fullscreen',
      style: styles.fullscreenButtonStyle || {},
      onClick: toggleFullscreen,
      title: isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)',
      onMouseEnter: (e) => {
        e.target.style.background = 'rgba(52, 152, 219, 1)';
        e.target.style.transform = 'scale(1.1)';
      },
      onMouseLeave: (e) => {
        e.target.style.background = 'rgba(52, 152, 219, 0.9)';
        e.target.style.transform = 'scale(1)';
      }
    }, isFullscreen ? '⊗' : '⛶')
  ];
};

/**
 * Render cover display - device-specific text but similar structure
 */
const renderCover = (deviceType, styles, { 
  episodeData, 
  isVisible, 
  openComicBook, 
  coverRef 
}) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  // Handle touch events on tablet to open immediately on first tap
  const handleTouchStart = isTablet && isVisible ? (e) => {
    e.preventDefault();
    e.stopPropagation();
    openComicBook();
  } : undefined;
  
  return React.createElement('div', {
    key: 'cover',
    ref: coverRef,
    style: styles.coverDisplayStyle || {},
    className: 'comic-cover-display',
    onClick: isVisible ? openComicBook : undefined,
    onTouchStart: handleTouchStart,
    onMouseEnter: isVisible ? (e) => {
      const img = e.target.querySelector('img');
      if (img) img.style.transform = 'scale(1.02)';
    } : undefined,
    onMouseLeave: isVisible ? (e) => {
      const img = e.target.querySelector('img');
      if (img) img.style.transform = 'scale(1)';
    } : undefined
  }, [
    !isVisible && React.createElement('div', {
      key: 'loading-overlay',
      style: styles.coverLoadingOverlayStyle || {}
    }, [
      React.createElement('div', {
        key: 'spinner',
        style: styles.loadingSpinnerStyle || {}
      }),
      React.createElement('div', {
        key: 'loading-text',
        style: styles.loadingTextStyle || {}
      }, isMobile ? 'Loading...' : 'Loading comic book...')
    ]),
    React.createElement('img', {
      key: 'cover-img',
      src: episodeData ? `${episodeData.fullLink.replace(/\/$/, '')}/cover.png` : '/moments/bangkok/2025-09-16/cover.png',
      alt: episodeData ? `${episodeData.title} Cover` : 'Episode 20 Cover',
      style: styles.coverImageWithOpacityStyle ? styles.coverImageWithOpacityStyle(isVisible) : (styles.coverImageStyle || {})
    })
  ]);
};

/**
 * Render loading state
 */
const renderLoading = (deviceType, styles) => {
  const isMobile = deviceType === 'mobile';
  
  return React.createElement('div', {
    key: 'loading',
    style: styles.loadingStyle || {}
  }, [
    React.createElement('div', {
      key: 'spinner',
      style: styles.loadingSpinnerStyle || {}
    }),
    React.createElement('div', {
      key: 'boot-header',
      style: {
        ...(styles.loadingTextStyle || {}),
        marginBottom: '20px'
      }
    }, isMobile ? 'Loading...' : 'Loading comic...')
  ]);
};

/**
 * Render error state
 */
const renderError = (styles, { error, createFlipbook, setError, setIsLoading }) => {
  return React.createElement('div', {
    key: 'error',
    style: styles.errorContainerStyle || {}
  }, [
    React.createElement('div', {
      key: 'error-icon',
      style: styles.errorIconStyle || {}
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
      style: styles.retryButtonStyle || {}
    }, 'Give Paul Another Shot 🚀')
  ]);
};

/**
 * Render flipbook container
 */
const renderFlipbook = (styles, { flipbookRef }) => {
  return React.createElement('div', {
    key: 'flipbook',
    ref: flipbookRef,
    style: styles.flipbookStyle || {},
    className: 'flipbook'
  });
};

/**
 * Render desktop controls (top navigation)
 */
const renderDesktopControls = (styles, { 
  currentPage, 
  totalPages, 
  previousPage, 
  nextPage, 
  getNextEpisode 
}) => {
  return React.createElement('div', {
    key: 'controls',
    style: styles.controlsStyle || {},
    className: 'comic-controls'
  }, [
    React.createElement('button', {
      key: 'prev',
      style: styles.desktopControlButtonStyle || {},
      onClick: previousPage,
      title: currentPage === 1 ? 'Back to Cover' : 'Previous Page'
    }, '‹'),
    React.createElement('div', {
      key: 'indicator',
      style: styles.pageIndicatorStyle || {}
    }, `${currentPage} / ${totalPages}`),
    React.createElement('button', {
      key: 'next',
      style: styles.desktopControlButtonDisabledStyle 
        ? styles.desktopControlButtonDisabledStyle(currentPage === totalPages && !getNextEpisode())
        : {},
      onClick: nextPage,
      disabled: currentPage === totalPages && !getNextEpisode(),
      title: currentPage === totalPages && getNextEpisode() ? 'Next Episode' : 'Next Page'
    }, currentPage === totalPages && getNextEpisode() ? '⏭' : '›')
  ]);
};

/**
 * Render mobile navigation (bottom navigation)
 */
const renderMobileNavigation = (styles, { 
  currentPage, 
  totalPages, 
  previousPage, 
  nextPage, 
  getNextEpisode 
}) => {
  return React.createElement('div', {
    key: 'mobile-nav',
    style: styles.mobileNavStyle || {},
    className: 'mobile-comic-nav'
  }, [
    React.createElement('button', {
      key: 'mobile-prev',
      style: styles.mobileNavButtonPrevStyle || {},
      onClick: previousPage,
      title: currentPage === 1 ? 'Back to Cover' : 'Previous Page'
    }, '◀'),
    React.createElement('div', {
      key: 'mobile-indicator',
      style: styles.mobileNavIndicatorStyle || {}
    }, `${currentPage} / ${totalPages}`),
    React.createElement('button', {
      key: 'mobile-next',
      style: styles.mobileNavButtonNextStyle 
        ? styles.mobileNavButtonNextStyle(currentPage === totalPages && !getNextEpisode())
        : {},
      onClick: nextPage,
      title: currentPage === totalPages && getNextEpisode() ? 'Next Episode' : 'Next Page'
    }, currentPage === totalPages && getNextEpisode() ? '⏭' : '▶')
  ]);
};

/**
 * Render container with device-specific handlers
 */
const renderContainer = (deviceType, styles, { 
  setShowControls, 
  onTouchStart, 
  onTouchMove, 
  onTouchEnd, 
  children 
}) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  
  return React.createElement('div', {
    key: 'container',
    style: styles.comicContainerStyle || {},
    className: 'comic-episode-container',
    onMouseEnter: () => setShowControls(true),
    onMouseLeave: () => setShowControls(false),
    onTouchStart: (isMobile || isTablet) ? onTouchStart : undefined,
    onTouchMove: (isMobile || isTablet) ? onTouchMove : undefined,
    onTouchEnd: (isMobile || isTablet) ? onTouchEnd : undefined
  }, children);
};

// Export render functions
window.ComicReaderRender = {
  renderHeaderButtons,
  renderCover,
  renderLoading,
  renderError,
  renderFlipbook,
  renderDesktopControls,
  renderMobileNavigation,
  renderContainer
};

