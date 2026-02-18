// ============================================================================
// ImmersiveColumn — Shared vertical fullscreen Swiper (used by immersiveV4 + character viewer)
// Accepts slides: { type: 'image'|'video'|'custom', src?, children? }
// ============================================================================

(function() {
  const VideoSlide = ({ slide, index, videoRefsByIndex, onToggle, onPlayStateChange }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);

    const handleRef = (el) => {
      if (el) {
        videoRefsByIndex.current[index] = el;
        if (el.readyState >= 2) setIsLoaded(true);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStateChange?.(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPlayStateChange?.(false);
    };

    return React.createElement('div', {
      style: { width: '100%', height: '100%', position: 'relative', cursor: 'pointer' },
      onClick: (e) => onToggle(index, e)
    }, [
      React.createElement('video', {
        key: 'video',
        ref: handleRef,
        src: slide.src,
        poster: slide.poster || undefined,
        playsInline: true,
        preload: 'metadata',
        loop: false,
        onLoadedData: () => setIsLoaded(true),
        onCanPlay: () => setIsLoaded(true),
        onPlay: handlePlay,
        onPause: handlePause,
        style: { width: '100%', height: '100%', display: 'block', objectFit: 'fill', touchAction: 'pan-y' }
      }),
      isLoaded && React.createElement('div', {
        key: 'play-btn',
        style: {
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid rgba(255,255,255,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'opacity 0.2s'
        }
      }, React.createElement('span', {
        style: {
          color: '#fff',
          fontSize: 28,
          marginLeft: isPlaying ? 0 : 4
        }
      }, isPlaying ? '\u23F8' : '\u25B6'))
    ]);
  };

  const SWIPER_CONFIG = {
    direction: 'vertical',
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
    pagination: { el: '.swiper-pagination', clickable: true }
  };

  const slideStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  };

  window.ComicReaderImmersiveColumn = function ImmersiveColumn({ slides, initialSlideIndex = 0, onBackToCover, onSlideChange, contentKey, onVideoPlayStateChange, onTapToShowControls }) {
    const slidesSignature = slides.map(s => s.src || (s.children ? 'custom' : '')).join('|');
    const swiperRef = React.useRef(null);
    const swiperInstanceRef = React.useRef(null);
    const videoRefsByIndex = React.useRef({});
    const onBackToCoverRef = React.useRef(onBackToCover);
    onBackToCoverRef.current = onBackToCover;

    const toggleVideoAt = (index, e) => {
      e.stopPropagation();
      const el = videoRefsByIndex.current[index];
      if (!el) return;
      const wasPlaying = !el.paused;
      if (el.paused) {
        el.play().catch(function() {});
      } else {
        el.pause();
        if (wasPlaying && typeof onTapToShowControls === 'function') onTapToShowControls();
      }
    };

    const handleVideoPlayStateChange = (playing) => {
      if (typeof onVideoPlayStateChange === 'function') onVideoPlayStateChange(playing);
    };

    const swiperSlides = slides.map((slide, i) => {
      const isVideo = slide.type === 'video';
      const content = slide.type === 'image'
        ? React.createElement('img', {
            src: slide.src,
            alt: slide.alt || '',
            style: { width: '100%', height: '100%', display: 'block', objectFit: 'fill' }
          })
        : slide.type === 'video'
          ? React.createElement(VideoSlide, {
              key: 'video-slide-' + i,
              slide,
              index: i,
              videoRefsByIndex,
              onToggle: toggleVideoAt,
              onPlayStateChange: handleVideoPlayStateChange
            })
          : slide.children;

      return React.createElement('div', {
        key: 'slide-' + i,
        className: 'swiper-slide',
        style: { ...slideStyle, ...(slide.style || {}) },
        onClick: isVideo ? (e) => toggleVideoAt(i, e) : undefined
      }, content);
    });

    React.useEffect(() => {
      const container = swiperRef.current;
      if (!container || typeof window.Swiper === 'undefined' || !slides.length) return;

      const initialSlide = Math.min(initialSlideIndex, Math.max(0, slides.length - 1));
      const swiper = new window.Swiper(container, {
        ...SWIPER_CONFIG,
        initialSlide,
        pagination: slides.length > 1 ? SWIPER_CONFIG.pagination : false,
        on: {
          slideChange(sw) {
            onSlideChange?.(sw.activeIndex);
            Object.values(videoRefsByIndex.current).forEach((el) => { if (el) el.pause(); });
            if (typeof onVideoPlayStateChange === 'function') onVideoPlayStateChange(false);
          }
        }
      });

      swiperInstanceRef.current = swiper;

      return () => {
        swiper.destroy(true, true);
        swiperInstanceRef.current = null;
        videoRefsByIndex.current = {};
      };
    }, [slides.length, initialSlideIndex, contentKey, slidesSignature]);

    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowLeft') return;
        const swiper = swiperInstanceRef.current;
        if (!swiper || swiper.activeIndex !== 0) return;
        const cb = onBackToCoverRef.current;
        if (typeof cb !== 'function') return;
        e.preventDefault();
        e.stopPropagation();
        cb();
      };
      window.addEventListener('keydown', handleKeyDown, true);
      return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, []);

    if (!slides.length) return null;

    return React.createElement('div', {
      className: 'comic-immersive-column',
      style: { width: '100%', height: '100%', background: '#000', touchAction: 'pan-y' }
    }, React.createElement('div', {
      ref: swiperRef,
      className: 'swiper comic-immersive-v4-swiper',
      style: { width: '100%', height: '100%', touchAction: 'pan-y' }
    }, React.createElement('div', { className: 'swiper-wrapper' }, swiperSlides), slides.length > 1
      ? React.createElement('div', { className: 'swiper-pagination' })
      : null));
  };
})();
