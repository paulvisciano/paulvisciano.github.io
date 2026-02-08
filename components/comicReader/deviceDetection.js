// ============================================================================
// Device Detection Utility
// ============================================================================

/**
 * Detects device type and returns 'mobile', 'tablet', or 'desktop'
 * - Mobile: Phones and small screens (excludes tablets)
 * - Tablet: iPad and Android tablets (shows 2-page spreads like desktop)
 * - Desktop: Everything else
 */
const detectDeviceType = () => {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent;
  
  // Check for iPad specifically
  const isiPad = /iPad/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  // Check for Android tablets (not phones)
  const isAndroidTablet = /Android/i.test(userAgent) && !/Mobile/i.test(userAgent) && navigator.maxTouchPoints > 1;
  
  // Check for phones
  const isPhoneUA = /iPhone|iPod|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isMobileWidth = width <= 768 && !isiPad;
  
  if (isiPad || isAndroidTablet) {
    return 'tablet';
  } else if (isPhoneUA || isMobileWidth) {
    return 'mobile';
  } else {
    return 'desktop';
  }
};

/**
 * Detects if device is in portrait or landscape orientation
 */
const detectOrientation = () => {
  return window.innerWidth < window.innerHeight ? 'portrait' : 'landscape';
};

/**
 * Hook to get and track device type with resize handling
 */
const useDeviceType = () => {
  const [deviceType, setDeviceType] = React.useState(detectDeviceType);
  
  React.useEffect(() => {
    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return deviceType;
};

/**
 * Hook to get and track orientation with change detection.
 * On orientationchange we update immediately and again after delays so layout
 * has time to settle (browsers often report new orientation before dimensions update).
 */
const useOrientation = () => {
  const [orientation, setOrientation] = React.useState(detectOrientation);
  
  React.useEffect(() => {
    const update = () => setOrientation(detectOrientation());
    
    const handleResize = () => {
      update();
    };
    
    let orientationTimeouts = [];
    const handleOrientationChange = () => {
      update();
      // Re-check after layout has settled (iOS/some browsers delay dimension updates)
      orientationTimeouts.push(setTimeout(update, 100));
      orientationTimeouts.push(setTimeout(update, 400));
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      orientationTimeouts.forEach(t => clearTimeout(t));
    };
  }, []);
  
  return orientation;
};

// Export for use in other files
window.ComicReaderDeviceDetection = {
  detectDeviceType,
  useDeviceType,
  detectOrientation,
  useOrientation
};

