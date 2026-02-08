// ============================================================================
// Comic Reader 4.0 — Vertical fullscreen feed via Swiper.js (swipe up/down)
// https://swiperjs.com/demos#vertical
// ============================================================================

(function() {
  const isV4Episode = (episodeData) => {
    return episodeData && (episodeData.comicReaderVersion === 4 || episodeData.immersiveComic === true);
  };

  // Portrait = use portrait assets; desktop always uses landscape.
  const getUsePortraitAssets = (isPortrait, isNarrowScreen) => isNarrowScreen && isPortrait;

  const getVideoSrcForOrientation = (episodeData, usePortraitAssets) => {
    if (!episodeData) return '';
    if (usePortraitAssets && episodeData.videoPortraitUrl) return episodeData.videoPortraitUrl;
    if (episodeData.videoLandscapeUrl) return episodeData.videoLandscapeUrl;
    return episodeData.videoPortraitUrl || '';
  };

  const getPagesForOrientation = (episodeData, usePortraitAssets) => {
    if (!episodeData) return [];
    const landscape = (episodeData.pagesLandscape && episodeData.pagesLandscape.length) ? episodeData.pagesLandscape : (episodeData.pages || []);
    const portrait = (episodeData.pagesPortrait && episodeData.pagesPortrait.length) ? episodeData.pagesPortrait : (episodeData.pages || []);
    return usePortraitAssets ? portrait : landscape;
  };

  const AUTO_PLAY_DELAY_MS = 2000;

  window.ComicReaderImmersiveV4 = function ImmersiveV4Content({ episodeData, styles, navState = {} }) {
    const { onBackToCover } = navState;
    const swiperRef = React.useRef(null);
    const swiperInstanceRef = React.useRef(null);
    const activeSlideRef = React.useRef(0);
    const onBackToCoverRef = React.useRef(onBackToCover);
    const videoRef = React.useRef(null);
    const pendingRestoreRef = React.useRef(null);
    const autoPlayTimerRef = React.useRef(null);
    const [isPortrait, setIsPortrait] = React.useState(
      () => typeof window !== 'undefined' && window.matchMedia('(orientation: portrait)').matches
    );
    const [isNarrowScreen, setIsNarrowScreen] = React.useState(
      () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
    );
    const [viewportHeight, setViewportHeight] = React.useState(
      () => (typeof window !== 'undefined' ? window.innerHeight : 100)
    );
    React.useEffect(() => {
      const update = () => setViewportHeight(window.innerHeight);
      window.addEventListener('resize', update);
      window.addEventListener('orientationchange', update);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update);
      };
    }, []);
    const usePortraitAssets = getUsePortraitAssets(isPortrait, isNarrowScreen);
    const pages = getPagesForOrientation(episodeData, usePortraitAssets);
    const videoSrc = getVideoSrcForOrientation(episodeData, usePortraitAssets);
    const hasVideo = !!(episodeData && (episodeData.videoPortraitUrl || episodeData.videoLandscapeUrl));
    const videoSlideIndex = pages.length;

    React.useEffect(() => {
      const mqPortrait = window.matchMedia('(orientation: portrait)');
      const mqNarrow = window.matchMedia('(max-width: 1023px)');
      const onPortraitChange = () => {
        const el = videoRef.current;
        if (el && episodeData && (episodeData.videoPortraitUrl || episodeData.videoLandscapeUrl)) {
          pendingRestoreRef.current = { time: el.currentTime, play: !el.paused };
        }
        setIsPortrait(mqPortrait.matches);
      };
      const onNarrowChange = () => setIsNarrowScreen(mqNarrow.matches);
      mqPortrait.addEventListener('change', onPortraitChange);
      mqNarrow.addEventListener('change', onNarrowChange);
      return () => {
        mqPortrait.removeEventListener('change', onPortraitChange);
        mqNarrow.removeEventListener('change', onNarrowChange);
      };
    }, [episodeData]);

    onBackToCoverRef.current = onBackToCover;

    const handleVideoCanPlay = () => {
      const pending = pendingRestoreRef.current;
      const el = videoRef.current;
      if (el) el.volume = 0.2; // start at 20% volume
      if (!pending || !el) return;
      el.currentTime = pending.time;
      if (pending.play) el.play().catch(function() {});
      pendingRestoreRef.current = null;
    };

    // Initialize Swiper
    React.useEffect(() => {
      const container = swiperRef.current;
      if (!container || typeof window.Swiper === 'undefined') return;

      const totalSlides = pages.length + (hasVideo ? 1 : 0);
      const initialSlide = Math.min(activeSlideRef.current, Math.max(0, totalSlides - 1));

      const swiper = new window.Swiper(container, {
        direction: 'vertical',
        initialSlide,
        slidesPerView: 1,
        slidesPerGroup: 1,
        spaceBetween: 0,
        speed: 300,
        grabCursor: true,
        allowTouchMove: true,
        simulateTouch: true,
        touchRatio: 1,
        threshold: 5,
        keyboard: { enabled: true },
        mousewheel: {
          forceToAxis: true,
          sensitivity: 0.6,
          thresholdDelta: 30,
          thresholdTime: 200
        },
        touchReleaseOnEdges: true,
        preventInteractionOnTransition: true,
        focusableElements: 'input, select, option, textarea, button, label',
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        on: {
          slideChange(sw) {
            const videoEl = videoRef.current;
            if (!videoEl || !hasVideo) return;
            if (autoPlayTimerRef.current) {
              clearTimeout(autoPlayTimerRef.current);
              autoPlayTimerRef.current = null;
            }
            if (sw.activeIndex === videoSlideIndex) {
              autoPlayTimerRef.current = setTimeout(() => {
                videoEl.play().catch(function() {});
                autoPlayTimerRef.current = null;
              }, AUTO_PLAY_DELAY_MS);
            } else {
              videoEl.pause();
            }
          }
        }
      });

      swiperInstanceRef.current = swiper;

      return () => {
        activeSlideRef.current = swiper.activeIndex;
        swiper.destroy(true, true);
        swiperInstanceRef.current = null;
        if (autoPlayTimerRef.current) {
          clearTimeout(autoPlayTimerRef.current);
          autoPlayTimerRef.current = null;
        }
      };
    }, [pages.length, hasVideo, videoSlideIndex]);

    // Arrow keys: intercept ArrowUp on first slide for back-to-cover; Swiper handles rest
    React.useEffect(() => {
      const swiper = swiperInstanceRef.current;
      if (!swiper) return;
      const handleKeyDown = (e) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;
        if (swiper.activeIndex !== 0) return;
        const cb = onBackToCoverRef.current;
        if (typeof cb !== 'function') return;
        e.preventDefault();
        e.stopPropagation();
        cb();
      };
      window.addEventListener('keydown', handleKeyDown, true); // capture: run before Swiper
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, []);

    if (!episodeData) return null;

    const slideStyle = {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    const swiperSlides = [];

    pages.forEach((url, i) => {
      swiperSlides.push(React.createElement('div', {
        key: 'spread-' + i,
        className: 'swiper-slide',
        style: slideStyle
      }, React.createElement('img', {
        src: url,
        alt: `Spread ${i + 1}`,
        style: { width: '100%', height: '100%', display: 'block', objectFit: 'fill' }
      })));
    });

    if (hasVideo) {
      swiperSlides.push(React.createElement('div', {
        key: 'video-slide',
        className: 'swiper-slide',
        style: slideStyle
      }, React.createElement('video', {
        ref: videoRef,
        src: videoSrc,
        controls: true,
        playsInline: true,
        muted: false,
        onLoadedMetadata: function(e) { e.target.volume = 0.2; },
        onCanPlay: handleVideoCanPlay,
        style: { width: '100%', height: '100%', display: 'block', objectFit: 'fill', touchAction: 'pan-y' }
      })));
    }

    return React.createElement('div', {
      className: 'comic-immersive-v4',
      style: { width: '100%', height: '100%', background: '#000', touchAction: 'pan-y' }
    }, React.createElement('div', {
      ref: swiperRef,
      className: 'swiper comic-immersive-v4-swiper',
      style: { width: '100%', height: '100%', touchAction: 'pan-y' }
    }, React.createElement('div', {
      className: 'swiper-wrapper'
    }, swiperSlides), React.createElement('div', {
      className: 'swiper-pagination'
    })));
  };

  window.ComicReaderCore = window.ComicReaderCore || {};
  window.ComicReaderCore.isV4Episode = isV4Episode;
})();
