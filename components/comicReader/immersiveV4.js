// ============================================================================
// Comic Reader 4.0 — Vertical fullscreen feed (swipe up/down between slides)
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
    const scrollRef = React.useRef(null);
    const videoRef = React.useRef(null);
    const videoSlideRef = React.useRef(null);
    const pendingRestoreRef = React.useRef(null);
    const touchStartRef = React.useRef({ y: 0, scrollTop: 0 });
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

    React.useEffect(() => {
      const mqPortrait = window.matchMedia('(orientation: portrait)');
      const mqNarrow = window.matchMedia('(max-width: 1023px)');
      const onPortraitChange = (e) => {
        const el = videoRef.current;
        if (el && episodeData && (episodeData.videoPortraitUrl || episodeData.videoLandscapeUrl)) {
          pendingRestoreRef.current = { time: el.currentTime, play: !el.paused };
        }
        setIsPortrait(e.matches);
      };
      const onNarrowChange = (e) => setIsNarrowScreen(e.matches);
      mqPortrait.addEventListener('change', onPortraitChange);
      mqNarrow.addEventListener('change', onNarrowChange);
      return () => {
        mqPortrait.removeEventListener('change', onPortraitChange);
        mqNarrow.removeEventListener('change', onNarrowChange);
      };
    }, [episodeData]);

    const handleVideoCanPlay = () => {
      const pending = pendingRestoreRef.current;
      const el = videoRef.current;
      if (el) el.volume = 0.2; // start at 20% volume
      if (!pending || !el) return;
      el.currentTime = pending.time;
      if (pending.play) el.play().catch(function() {});
      pendingRestoreRef.current = null;
    };

    // Auto-play video when video slide is in view for AUTO_PLAY_DELAY_MS; pause when scrolled away
    React.useEffect(() => {
      if (!hasVideo) return;
      const scrollEl = scrollRef.current;
      const videoEl = videoRef.current;
      const slideEl = videoSlideRef.current;
      if (!scrollEl || !videoEl || !slideEl) return;
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          if (autoPlayTimerRef.current) {
            clearTimeout(autoPlayTimerRef.current);
            autoPlayTimerRef.current = null;
          }
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            autoPlayTimerRef.current = setTimeout(() => {
              videoEl.play().catch(function() {});
              autoPlayTimerRef.current = null;
            }, AUTO_PLAY_DELAY_MS);
          } else {
            videoEl.pause();
          }
        },
        { threshold: [0.5], root: scrollEl }
      );
      io.observe(slideEl);
      return () => {
        io.disconnect();
        if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
      };
    }, [hasVideo]);

    // Arrow keys: scroll feed up/down by one viewport; at top + up = back to cover
    React.useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      const handleKeyDown = (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const vh = viewportHeight;
        const current = el.scrollTop;
        const threshold = vh * 0.3;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          el.scrollTo({ top: current + vh, behavior: 'smooth' });
        } else {
          if (current < threshold && typeof onBackToCover === 'function') {
            onBackToCover();
          } else {
            el.scrollTo({ top: Math.max(0, current - vh), behavior: 'smooth' });
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onBackToCover, viewportHeight]);

    // Touch: swipe down from top to go back to cover
    const handleTouchStart = (e) => {
      const el = scrollRef.current;
      if (!el) return;
      touchStartRef.current = { y: e.touches[0].clientY, scrollTop: el.scrollTop };
    };
    const handleTouchEnd = (e) => {
      const el = scrollRef.current;
      if (!el || typeof onBackToCover !== 'function') return;
      const start = touchStartRef.current;
      const endY = e.changedTouches[0].clientY;
      const deltaY = endY - start.y;
      const pullDownThreshold = 80;
      if (start.scrollTop <= 10 && deltaY > pullDownThreshold) {
        onBackToCover();
      }
    };

    if (!episodeData) return null;

    const slideHeightPx = viewportHeight + 'px';
    const slideStyle = {
      width: '100%',
      height: slideHeightPx,
      minHeight: slideHeightPx,
      flexShrink: 0,
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      overflow: 'hidden',
      background: '#000'
    };

    const scrollContainerStyle = {
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollSnapType: 'y mandatory',
      scrollBehavior: 'smooth',
      WebkitOverflowScrolling: 'touch',
      background: '#000'
    };

    const children = [];

    pages.forEach((url, i) => {
      children.push(React.createElement('div', {
        key: 'spread-' + i,
        className: 'comic-immersive-v4-slide',
        style: slideStyle
      }, React.createElement('img', {
        src: url,
        alt: `Spread ${i + 1}`,
        style: { width: '100%', height: '100%', display: 'block', objectFit: 'fill' }
      })));
    });

    if (hasVideo) {
      children.push(React.createElement('div', {
        key: 'video-slide',
        ref: videoSlideRef,
        className: 'comic-immersive-v4-slide',
        style: slideStyle
      }, React.createElement('video', {
        ref: videoRef,
        src: videoSrc,
        controls: true,
        playsInline: true,
        muted: false,
        onLoadedMetadata: function(e) { e.target.volume = 0.2; },
        onCanPlay: handleVideoCanPlay,
        style: { width: '100%', height: '100%', display: 'block', objectFit: 'fill' }
      })));
    }

    return React.createElement('div', {
      className: 'comic-immersive-v4',
      style: { width: '100%', height: '100%', background: '#000' }
    }, React.createElement('div', {
      ref: scrollRef,
      className: 'comic-immersive-v4-feed',
      style: scrollContainerStyle,
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd
    }, children));
  };

  window.ComicReaderCore = window.ComicReaderCore || {};
  window.ComicReaderCore.isV4Episode = isV4Episode;
})();
