// ============================================================================
// Device-Specific Styles
// ============================================================================

/**
 * Get styles for a specific device type
 * @param {string} deviceType - 'mobile', 'tablet', or 'desktop'
 * @param {object} state - Component state (isVisible, showControls, showCover, isLoading, etc.)
 * @returns {object} Style objects for the device type
 */
const getDeviceStyles = (deviceType, state = {}) => {
  const { isVisible = false, showControls = false, showCover = true, isLoading = false } = state;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  
  // Shared overlay style (same for all devices)
  const comicOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(2px)'
  };

  // Container styles
  const comicContainerStyle = isMobile ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    width: '100vw',
    height: '100dvh',
    background: '#000',
    borderRadius: '0',
    boxShadow: 'none',
    border: 'none',
    overflow: 'hidden',
    maxWidth: '100vw',
    maxHeight: '100dvh',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column'
  } : {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    width: 'auto',
    height: 'auto',
    background: '#000',
    borderRadius: '15px',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
    border: '4px solid #d4c5a9',
    overflow: 'hidden',
    maxWidth: '90vw',
    maxHeight: '90vh',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column'
  };

  // Cover display styles
  const coverDisplayStyle = isMobile ? {
    width: '100vw',
    height: '100dvh',
    margin: '0 auto',
    display: 'block',
    cursor: isVisible ? 'pointer' : 'default',
    overflow: 'hidden',
    background: '#000',
    boxShadow: 'none',
    pointerEvents: isVisible ? 'auto' : 'none',
    position: 'relative',
    padding: 0
  } : {
    width: '500px',
    minHeight: '750px',
    margin: '0 auto',
    display: 'block',
    cursor: isVisible ? 'pointer' : 'default',
    overflow: 'hidden',
    background: '#000',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
    pointerEvents: isVisible ? 'auto' : 'none',
    position: 'relative',
    padding: 0
  };

  // Cover image styles
  const coverImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: isMobile ? 'contain' : 'cover',
    objectPosition: 'center',
    display: 'block',
    margin: 0,
    padding: 0,
    transition: 'transform 0.3s ease',
    verticalAlign: 'top'
  };

  // Flipbook styles
  const flipbookStyle = isMobile ? {
    width: '100vw',
    height: 'calc(100% - 60px)',
    margin: '0',
    display: showCover || isLoading ? 'none' : 'flex',
    background: '#000',
    borderRadius: '0',
    overflow: 'hidden',
    position: 'relative'
  } : {
    width: '1000px',
    height: '750px',
    margin: '0 auto',
    display: showCover || isLoading ? 'none' : 'flex',
    background: '#000',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative'
  };

  // Close button styles
  const closeButtonStyle = isMobile ? {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'rgba(255, 71, 87, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10002,
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  } : {
    position: 'absolute',
    top: '5px',
    right: '5px',
    background: 'rgba(255, 71, 87, 0.9)',
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
    zIndex: 10002,
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  };

  // Fullscreen button styles
  const fullscreenButtonStyle = isMobile ? {
    position: 'fixed',
    top: '20px',
    right: '80px',
    background: 'rgba(52, 152, 219, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'none', // Hidden on mobile
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10002,
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    opacity: showControls ? 1 : 0,
    pointerEvents: showControls ? 'auto' : 'none'
  } : {
    position: 'absolute',
    top: '5px',
    right: '50px',
    background: 'rgba(52, 152, 219, 0.9)',
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
    zIndex: 10002,
    transition: 'all 0.3s ease',
    fontWeight: 'bold',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    opacity: showControls ? 1 : 0,
    pointerEvents: showControls ? 'auto' : 'none'
  };

  // Desktop controls (only shown on desktop/tablet)
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

  // Loading styles
  const loadingStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: isMobile ? '16px' : '18px',
    padding: isMobile ? '40px 20px' : '60px',
    width: '100%',
    height: '100%',
    minHeight: isMobile ? '300px' : '400px'
  };

  const loadingSpinnerStyle = {
    width: isMobile ? '30px' : '40px',
    height: isMobile ? '30px' : '40px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: isMobile ? '10px' : '15px'
  };

  // Cover overlay (click to open) styles
  const coverOverlayStyle = isMobile ? {
    position: 'absolute',
    bottom: `max(40px, env(safe-area-inset-bottom))`,
    left: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '15px',
    fontSize: '14px',
    fontWeight: 'bold',
    opacity: 0.9,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    animation: isVisible ? 'textPulse 2s ease-in-out infinite' : 'none',
    willChange: 'transform, opacity'
  } : {
    position: 'absolute',
    bottom: '20px',
    left: '20px',
    right: '20px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    opacity: 0.9,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    animation: isVisible ? 'textPulse 2s ease-in-out infinite' : 'none',
    willChange: 'transform, opacity'
  };

  // Mobile navigation styles (only for mobile)
  const mobileNavStyle = {
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
  };

  return {
    comicOverlayStyle,
    comicContainerStyle,
    coverDisplayStyle,
    coverImageStyle,
    flipbookStyle,
    closeButtonStyle,
    fullscreenButtonStyle,
    controlsStyle,
    controlBtnStyle,
    pageIndicatorStyle,
    loadingStyle,
    loadingSpinnerStyle,
    coverOverlayStyle,
    mobileNavStyle
  };
};

// Export for use in other files
window.ComicReaderStyles = {
  getDeviceStyles
};

