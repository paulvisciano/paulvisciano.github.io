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

// Export for use in other files
window.ComicReaderDeviceDetection = {
  detectDeviceType,
  useDeviceType
};

