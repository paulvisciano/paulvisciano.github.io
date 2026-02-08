// ============================================================================
// Device-Specific Styles
// ============================================================================

/**
 * Style configuration table - all values defined here to prevent drift
 * See STYLE_SPEC.md for complete documentation
 */
const STYLE_CONFIG = {
  container: {
    mobile: {
      portrait: {
        cover: {
          width: '300px',
          height: '450px',
          borderRadius: '15px',
          border: '4px solid #d4c5a9',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
        },
        open: {
          width: '100vw',
          height: '100dvh'
        },
        position: 'relative',
      },
      landscape: {
        cover: {
          width: '200px',
          height: '300px'
        },
        open: {
          width: '400px',
          height: '300px'
        },
        position: 'relative',
       
        borderRadius: '15px',
        border: '4px solid #d4c5a9',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
        justifyContent: undefined
      }
    },
    tablet: {
      portrait: {
        cover: {
          width: '400px',
          height: '600px'
        },
        open: {
          width: '100vw',
          height: '100dvh'
        },
        position: 'relative',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        borderRadius: '15px',
        border: '4px solid #d4c5a9',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
        justifyContent: 'center'
      },
      landscape: {
        cover: {
          width: '400px',
          height: '600px'
        },
        open: {
          width: '800px',
          height: '600px'
        },
        position: 'relative',
        top: 'auto',
        left: 'auto',
        right: 'auto',
        borderRadius: '15px',
        border: '4px solid #d4c5a9',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
        justifyContent: undefined
      }
    },
    desktop: {
      // Desktop is always landscape
      cover: {
        width: '380px',
        height: '560px'
      },
      open: {
        width: '800px',
        height: '600px'
      },
      position: 'relative',
      top: 'auto',
      left: 'auto',
      right: 'auto',
      borderRadius: '15px',
      border: '4px solid #d4c5a9',
      boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
      justifyContent: undefined
    }
  },
  flipbook: {
    mobile: {
      portrait: {
        width: '100vw',
        height: 'calc(100% - 60px)',
        margin: '0',
        borderRadius: '0'
      },
      landscape: {
        width: '100%',
        height: '100%',
        margin: '0',
        borderRadius: '0'
      }
    },
    tablet: {
      portrait: {
        width: '500px',
        height: '750px',
        margin: '0 auto',
        borderRadius: '10px'
      },
      landscape: {
        width: '1000px',
        height: '750px',
        margin: '0 auto',
        borderRadius: '10px'
      }
    },
    desktop: {
      // Desktop is always landscape
      // Note: width and height are overridden to 100% in getFlipbookStyle
      width: '100%',
      height: '100%',
      margin: '0',
      borderRadius: '10px'
    }
  },
  coverImage: {
    mobile: {
      objectFit: 'contain'
    },
    tablet: {
      portrait: {
        objectFit: 'contain'
      },
      landscape: {
        objectFit: 'cover'
      }
    },
    desktop: {
      // Desktop is always landscape
      objectFit: 'cover'
    }
  }
};

/**
 * Get container style based on device, orientation, showCover state, fullscreen, and optional wide cover (v4)
 */
const getContainerStyle = (deviceType, orientation, showCover, isFullscreen = false, isV4Cover = false) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isPortrait = orientation === 'portrait';
  
  let config;
  let dynamicProps = {};
  
  if (isMobile && isPortrait) {
    config = STYLE_CONFIG.container.mobile.portrait;
    const coverOrOpen = showCover ? 'cover' : 'open';
    dynamicProps = { ...STYLE_CONFIG.container.mobile.portrait[coverOrOpen] };
    // For mobile portrait, use relative position for cover (so overlay can center it), fixed for open
    if (!showCover) {
      dynamicProps.position = 'fixed';
      dynamicProps.top = '0';
      dynamicProps.left = '0';
      dynamicProps.right = '0';
    }
  } else if (isMobile && !isPortrait) {
    config = STYLE_CONFIG.container.mobile.landscape;
    const coverOrOpen = showCover ? 'cover' : 'open';
    dynamicProps = { ...STYLE_CONFIG.container.mobile.landscape[coverOrOpen] };
  } else if (isTablet && isPortrait) {
    config = STYLE_CONFIG.container.tablet.portrait;
    const coverOrOpen = showCover ? 'cover' : 'open';
    dynamicProps = { ...STYLE_CONFIG.container.tablet.portrait[coverOrOpen] };
  } else if (isTablet && !isPortrait) {
    config = STYLE_CONFIG.container.tablet.landscape;
    const coverOrOpen = showCover ? 'cover' : 'open';
    dynamicProps = { ...STYLE_CONFIG.container.tablet.landscape[coverOrOpen] };
  } else if (isDesktop) {
    // Desktop is always landscape
    config = STYLE_CONFIG.container.desktop;
    const coverOrOpen = showCover ? 'cover' : 'open';
    dynamicProps = { ...STYLE_CONFIG.container.desktop[coverOrOpen] };
  } else {
    // Fallback (shouldn't reach here)
    config = STYLE_CONFIG.container.desktop;
  }
  
  // V4 cover stays portrait like other comics; landscape/wide layout starts when comic is opened (immersiveV4)
  
  // Remove width/height from base config only if dynamicProps provides them
  const baseConfig = (dynamicProps.width || dynamicProps.height)
    ? (() => {
        const { width: _w, height: _h, ...rest } = config;
        return rest;
      })()
    : config;
  
  // Override dimensions when in fullscreen AND comic is open (not showing cover)
  // V4 open: desktop 1000x700; mobile/tablet fill viewport
  // Otherwise desktop: 1000x750, other: 85% x 90%
  const fullscreenProps = (!showCover && isV4Cover) ? (
    isDesktop ? { width: '1000px', height: '700px' } : {
      width: '100%',
      height: '100%',
      maxWidth: 'none',
      maxHeight: 'none'
    }
  ) : (isFullscreen && !showCover) ? (
    isDesktop ? {
      width: '1000px',
      height: '750px'
    } : {
      width: '85%',
      height: '90%'
    }
  ) : {};
  
  return {
    ...baseConfig,
    ...dynamicProps,
    ...fullscreenProps,
    background: '#000',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: config.justifyContent ? 'center' : undefined,
    touchAction: (isTablet && !isPortrait) ? 'pan-x pan-y pinch-zoom' : 'auto',
    pointerEvents: 'auto',
    ...(config.justifyContent && { justifyContent: config.justifyContent })
  };
};

/**
 * Get flipbook style based on device and orientation
 */
const getFlipbookStyle = (deviceType, orientation, showCover, isLoading) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isPortrait = orientation === 'portrait';
  
  let config;
  
  if (isMobile && isPortrait) {
    config = STYLE_CONFIG.flipbook.mobile.portrait;
  } else if (isMobile && !isPortrait) {
    config = STYLE_CONFIG.flipbook.mobile.landscape;
  } else if (isTablet && isPortrait) {
    config = STYLE_CONFIG.flipbook.tablet.portrait;
  } else if (isTablet && !isPortrait) {
    config = STYLE_CONFIG.flipbook.tablet.landscape;
  } else if (isDesktop) {
    // Desktop is always landscape
    config = STYLE_CONFIG.flipbook.desktop;
  } else {
    // Fallback (shouldn't reach here)
    config = STYLE_CONFIG.flipbook.desktop;
  }
  
  return {
    ...config,
    width: '100%',
    height: '100%',
    display: showCover || isLoading ? 'none' : 'flex',
    background: '#000',
    overflow: 'hidden',
    position: 'relative'
  };
};

/**
 * Get cover image style based on device and orientation
 */
const getCoverImageStyle = (deviceType, orientation) => {
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isPortrait = orientation === 'portrait';
  
  let objectFit;
  
  if (isMobile) {
    objectFit = STYLE_CONFIG.coverImage.mobile.objectFit;
  } else if (isTablet) {
    objectFit = isPortrait 
      ? STYLE_CONFIG.coverImage.tablet.portrait.objectFit
      : STYLE_CONFIG.coverImage.tablet.landscape.objectFit;
  } else {
    // Desktop is always landscape
    objectFit = STYLE_CONFIG.coverImage.desktop.objectFit;
  }
  
  return {
    width: '100%',
    height: '100%',
    objectFit,
    objectPosition: 'center',
    display: 'block',
    margin: 0,
    padding: 0,
    transition: 'transform 0.3s ease',
    verticalAlign: 'top'
  };
};

/**
 * Get styles for a specific device type and orientation
 * @param {string} deviceType - 'mobile', 'tablet', or 'desktop'
 * @param {object} state - Component state (isVisible, showControls, showCover, isLoading, orientation, etc.)
 * @returns {object} Style objects for the device type
 */
const getDeviceStyles = (deviceType, state = {}) => {
  const { isVisible = false, showControls = false, showCover = true, isLoading = false, orientation = 'landscape', isFullscreen = false, isV4Cover = false } = state;
  const isMobile = deviceType === 'mobile';
  const isTablet = deviceType === 'tablet';
  const isDesktop = deviceType === 'desktop';
  const isPortrait = orientation === 'portrait';
  
  // Shared overlay style (same for all devices)
  // When showing cover, reduce height to leave space for footer timeline (~150px)
  // When v4 comic is open on mobile/tablet, stretch container to edges; on desktop center the 1000x700 box
  const footerHeight = 150;
  const v4Open = !showCover && isV4Cover;
  const v4FillViewport = v4Open && !isDesktop; // mobile/tablet: container fills; desktop: fixed 1000x700
  const comicOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: showCover ? `calc(100% - ${footerHeight}px)` : '100%',
    background: showCover ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: v4FillViewport ? 'stretch' : 'center',
    justifyContent: v4FillViewport ? 'stretch' : 'center',
    paddingTop: showCover ? (isMobile ? '20px' : '40px') : '0',
    paddingBottom: showCover ? '20px' : '0',
    zIndex: 10000,
    backdropFilter: 'blur(2px)',
    touchAction: 'none',
    pointerEvents: 'auto'
  };

  // Container styles - when v4 open, container fills viewport for edge-to-edge content
  const comicContainerStyle = getContainerStyle(deviceType, orientation, showCover, isFullscreen, isV4Cover);

  // Cover display styles - based on device type and orientation
  // No width/height - inherits from parent container
  const coverDisplayStyle = isMobile ? {
    margin: '0 auto',
    display: 'block',
    cursor: isVisible ? 'pointer' : 'default',
    overflow: 'visible',
    background: '#000',
    boxShadow: 'none',
    pointerEvents: isVisible ? 'auto' : 'none',
    position: 'relative',
    padding: 0
  } : {
    margin: '0 auto',
    display: 'block',
    cursor: isVisible ? 'pointer' : 'default',
    overflow: 'visible',
    background: '#000',
    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.9)',
    pointerEvents: isVisible ? 'auto' : 'none',
    position: 'relative',
    padding: 0
  };

  // Cover image styles - using structured config
  const coverImageStyle = getCoverImageStyle(deviceType, orientation);

  // Flipbook styles - using structured config
  const flipbookStyle = getFlipbookStyle(deviceType, orientation, showCover, isLoading, isFullscreen);

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
    opacity: 1, // Always visible on desktop since it's outside the comic book
    pointerEvents: 'auto' // Always clickable on desktop
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
    position: 'relative',
    marginTop: '20px',
    width: 'auto',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    opacity: 0.9,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    animation: isVisible ? 'textPulse 2s ease-in-out infinite' : 'none',
    willChange: 'transform, opacity'
  } : {
    position: 'absolute',
    top: 'calc(50vh + 320px)',
    width: '400px',
    background: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
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

  // Flipbook-specific styles
  const spreadContainerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    transition: 'transform 0.3s ease'
  };

  const mobileLeftPageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const desktopLeftPageStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const desktopRightPageStyle = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '50%',
    height: '100%',
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeft: '2px solid #333'
  };

  const mobilePageContainerStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  };

  const mobilePageContentStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    height: '100%'
  };

  const mobilePageImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: 'block'
  };

  const desktopPageImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block'
  };

  const errorMessageStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'white',
    fontSize: '18px'
  };

  // Cover loading overlay styles
  const coverLoadingOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: isMobile ? '16px' : '18px',
    zIndex: 1,
    background: '#000'
  };

  const loadingTextStyle = {
    fontFamily: 'monospace',
    textAlign: 'center',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 'bold'
  };

  const coverImageWithOpacityStyle = (isVisible) => ({
    ...coverImageStyle,
    opacity: isVisible ? 1 : 0,
    transition: 'opacity 0.3s ease'
  });

  // Error styles
  const errorContainerStyle = {
    ...loadingStyle,
    color: '#ff4757',
    flexDirection: 'column'
  };

  const errorIconStyle = {
    fontSize: '24px',
    marginBottom: '10px'
  };

  const retryButtonStyle = {
    marginTop: '15px',
    padding: '8px 16px',
    background: '#ff4757',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  };

  // Desktop control button styles
  const desktopControlButtonStyle = {
    ...controlBtnStyle,
    opacity: 1,
    cursor: 'pointer'
  };

  const desktopControlButtonDisabledStyle = (isDisabled) => ({
    ...controlBtnStyle,
    opacity: isDisabled ? 0.5 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer'
  });

  // Mobile navigation button styles
  const mobileNavButtonBaseStyle = {
    border: 'none',
    borderRadius: '20px',
    width: '56px',
    height: '56px',
    fontSize: '20px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    pointerEvents: 'auto',
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  };

  const mobileNavButtonPrevStyle = {
    ...mobileNavButtonBaseStyle,
    background: 'rgba(255, 255, 255, 0.95)',
    color: '#1d1d1f',
    marginLeft: '20px'
  };

  const mobileNavButtonNextStyle = (isDisabled) => ({
    ...mobileNavButtonBaseStyle,
    background: isDisabled ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.95)',
    color: isDisabled ? '#8e8e93' : '#1d1d1f',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    marginRight: '20px',
    boxShadow: isDisabled ? '0 1px 8px rgba(0, 0, 0, 0.06)' : '0 2px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.08)'
  });

  const mobileNavIndicatorStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '15px',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '10px 20px',
    borderRadius: '22px',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '0.5px solid rgba(255, 255, 255, 0.15)',
    letterSpacing: '0.5px'
  };

  // Cover navigation button styles (for episode navigation on cover)
  // Positioned relative to overlay, centered vertically
  const coverNavButtonBaseStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: isMobile ? '48px' : '56px',
    height: isMobile ? '48px' : '56px',
    fontSize: isMobile ? '24px' : '28px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10003, // Higher than container to stay on top
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#333',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  };

  const coverNavButtonPrevStyle = {
    ...coverNavButtonBaseStyle,
    left: isMobile ? '10px' : '20px'
  };

  const coverNavButtonNextStyle = {
    ...coverNavButtonBaseStyle,
    right: isMobile ? '10px' : '20px'
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
    mobileNavStyle,
    // Flipbook-specific styles
    spreadContainerStyle,
    mobileLeftPageStyle,
    desktopLeftPageStyle,
    desktopRightPageStyle,
    mobilePageContainerStyle,
    mobilePageContentStyle,
    mobilePageImageStyle,
    desktopPageImageStyle,
    errorMessageStyle,
    // Additional component styles
    coverLoadingOverlayStyle,
    loadingTextStyle,
    coverImageWithOpacityStyle,
    errorContainerStyle,
    errorIconStyle,
    retryButtonStyle,
    desktopControlButtonStyle,
    desktopControlButtonDisabledStyle,
    mobileNavButtonPrevStyle,
    mobileNavButtonNextStyle,
    mobileNavIndicatorStyle,
    coverNavButtonPrevStyle,
    coverNavButtonNextStyle
  };
};

// Export for use in other files
window.ComicReaderStyles = {
  getDeviceStyles
};
