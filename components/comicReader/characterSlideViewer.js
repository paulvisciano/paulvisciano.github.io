// ============================================================================
// Character Slide Viewer — 2 ImmersiveV4 readers side by side (desktop)
// or 1 ImmersiveV4 (mobile). Reuses ImmersiveV4 for identical UX.
// ============================================================================

(function() {
  const BREAKPOINT_DESKTOP = 1024;

  function characterPageToEpisodeData(page) {
    const { image, video, alt, name, role, bio, description } = page;
    const narrative = bio || description || '';

    const narrativeContent = React.createElement('div', {
      style: {
        width: '100%',
        height: '100%',
        padding: '24px 16px',
        boxSizing: 'border-box',
        background: '#1a1a1a',
        color: '#e8e8e8',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'left',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
      }
    }, [
      name && React.createElement('h2', {
        key: 'name',
        style: { margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 600 }
      }, name),
      role && React.createElement('p', {
        key: 'role',
        style: { margin: '0 0 16px', fontSize: '0.9rem', opacity: 0.85 }
      }, role),
      narrative && React.createElement('p', {
        key: 'bio',
        style: { margin: 0, fontSize: '1rem', lineHeight: 1.6 }
      }, narrative)
    ]);

    const pages = [];
    if (video) {
      pages.push({ type: 'video', src: video, poster: image });
    } else {
      pages.push(image);
    }
    if (narrative) {
      pages.push({ type: 'custom', children: narrativeContent, style: { justifyContent: 'flex-start' } });
    }

    return { pages, fullLink: '/characters/' };
  }

  window.ComicReaderCharacterSlideViewer = function CharacterSlideViewerContent({ episodeData, styles, navState = {} }) {
    const { onBackToCover, previousPage, currentPage = 1, onVideoPlayStateChange, onSlidesSwitchingChange, onTapToShowControls } = navState;
    const [isDesktop, setIsDesktop] = React.useState(
      () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINT_DESKTOP
    );

    React.useEffect(() => {
      const update = () => setIsDesktop(window.innerWidth >= BREAKPOINT_DESKTOP);
      window.addEventListener('resize', update);
      window.addEventListener('orientationchange', update);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('orientationchange', update);
      };
    }, []);

    const pages = (episodeData && episodeData.pages) || [];
    const isTwoUp = isDesktop && pages.length > 1;
    const pageIndex = Math.max(0, Math.min(currentPage - 1, pages.length - 1));

    const displayPages = isTwoUp
      ? [pages[pageIndex], pageIndex + 1 < pages.length ? pages[pageIndex + 1] : null].filter(Boolean)
      : [pages[pageIndex]].filter(Boolean);

    if (!episodeData || !pages.length) return null;

    const columns = displayPages.map((p, i) => {
      const charIndex = pageIndex + i;
      const columnKey = 'col-' + charIndex;
      const v4EpisodeData = characterPageToEpisodeData(p);
      const onFirstSlideBack = i === 0 && (typeof onBackToCover === 'function' || typeof previousPage === 'function')
        ? () => (currentPage <= 1 ? onBackToCover?.() : previousPage?.())
        : undefined;
      return React.createElement('div', {
        key: columnKey,
        className: 'comic-character-immersive-column',
        style: { flex: '1 1 0', minWidth: 0, height: '100%' }
      }, React.createElement(window.ComicReaderImmersiveV4, {
        key: 'immersive-' + columnKey,
        episodeData: v4EpisodeData,
        styles,
        navState: {
          onBackToCover: onFirstSlideBack,
          onVideoPlayStateChange,
          onSlidesSwitchingChange: onSlidesSwitchingChange || (() => {}),
          onTapToShowControls,
          noAutoplay: true,
          initialSlideIndex: 0,
          onSlideChange: undefined
        }
      }));
    });

    return React.createElement('div', {
      className: 'comic-character-slide-viewer',
      style: {
        width: '100%',
        height: '100%',
        background: '#000',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch'
      }
    }, columns);
  };
})();
