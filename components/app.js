window.App = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [selectedYear, setSelectedYear] = React.useState("All");
  const [zoomCallback, setZoomCallback] = React.useState(null);
  const [overlayMessage, setOverlayMessage] = React.useState(null); // Initialize as null

  // Function to update overlay message
  const updateOverlayMessage = (message, isComicClickable = false, momentId = null) => {
    setOverlayMessage(message);
    const overlayMessageEl = document.getElementById('overlay-message');
    const overlay = document.getElementById('overlay');
    
    if (overlayMessageEl) {
      overlayMessageEl.textContent = message;
      
      // Make clickable for comic episodes
      if (isComicClickable && momentId) {
        overlayMessageEl.style.cursor = 'pointer';
        overlayMessageEl.style.textDecoration = 'underline';
        overlayMessageEl.title = 'Click to open comic book';
        
        // Remove existing handlers
        overlayMessageEl.onclick = null;
        
        // Add click handler
        overlayMessageEl.onclick = () => {
          console.log('Overlay clicked for comic episode:', momentId);
          if (window.handleOpenBlogPost) {
            window.handleOpenBlogPost(momentId);
          }
        };
        
        if (overlay) {
          overlay.style.pointerEvents = 'auto';
        }
      } else {
        // Reset to non-clickable
        overlayMessageEl.style.cursor = 'default';
        overlayMessageEl.style.textDecoration = 'none';
        overlayMessageEl.title = '';
        overlayMessageEl.onclick = null;
        
        if (overlay) {
          overlay.style.pointerEvents = 'none';
        }
      }
    }
  };

  // Function to determine if a post is a comic episode
  const isComicEpisode = (moment) => {
    return moment && moment.isComic === true;
  };

  // Unified logic for selecting a moment (used for clicks, initial load, and popstate)
  const handleMomentSelection = (moment) => {
    if (moment) {
      setSelectedId(moment.id);
      
      // For comic episodes, skip the overlay entirely and go straight to comic
      if (isComicEpisode(moment)) {
        console.log('Comic episode detected - bypassing overlay, opening comic directly');
        // Hide the overlay immediately for comics
        updateOverlayMessage(null);
        const overlay = document.getElementById('overlay');
        if (overlay) {
          overlay.classList.add('hidden');
        }
        console.log('Comic episode detected, attempting to open comic for:', moment.id);
        
        // Function to try opening the comic
        const tryOpenComic = (attempts = 0) => {
          if (window.handleOpenBlogPost) {
            console.log('Opening comic via handleOpenBlogPost');
            window.handleOpenBlogPost(moment.id);
            // Clear the overlay message when comic opens
            setTimeout(() => {
              updateOverlayMessage(null);
              const overlay = document.getElementById('overlay');
              if (overlay) {
                overlay.classList.add('hidden');
              }
            }, 500);
          } else if (attempts < 10) {
            // Retry if handleOpenBlogPost isn't ready yet
            console.log(`handleOpenBlogPost not ready, retrying... (attempt ${attempts + 1})`);
            setTimeout(() => tryOpenComic(attempts + 1), 200);
          } else {
            console.error('Failed to open comic: handleOpenBlogPost never became available');
            updateOverlayMessage('Unable to load comic book - please try refreshing');
          }
        };
        
        // Wait a bit for the zoom to start, then try opening the comic
        setTimeout(tryOpenComic, 100);
      } else {
        // For non-comic episodes, show the normal overlay message
        updateOverlayMessage(`${moment.title}...`, false, null);
      }
      
      if (zoomCallback) {
        zoomCallback(moment); // Trigger zoom to the moment's location
      }
      // Normalize and update the URL only if it doesn't already match
      const intendedPath = `/moments/${moment.id}`;
      const currentPath = window.location.pathname;
      if (currentPath !== intendedPath) {
        window.history.pushState({ momentId: moment.id }, '', intendedPath);
      }
    } else {
      updateOverlayMessage('Looking for Paul'); // Default message
    }
  };

  // Find the most recent moment for the location button
  const findCurrentMoment = () => {
    const today = new Date();
    // Find the most recent moment where end date is before or on today
    const sortedMoments = [...window.momentsInTime].sort((a, b) => b.date - a.date);
    return sortedMoments.find(moment => {
      const startDate = new Date(moment.date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + moment.stayDuration);
      return endDate <= today || startDate <= today;
    }) || sortedMoments[0]; // Fallback to the most recent moment
  };

  // Handle location button click
  const handleLocationButtonClick = () => {
    const currentMoment = findCurrentMoment();
    if (currentMoment) {
      handleMomentSelection(currentMoment); // Zoom and select the moment
    }
  };

  // Smooth transition function for episode navigation
  const smoothEpisodeTransition = (nextEpisodeId) => {
    // Find the next episode moment
    const nextMoment = window.momentsInTime.find(m => m.id === nextEpisodeId);
    if (!nextMoment) {
      console.error('Next episode not found:', nextEpisodeId);
      return;
    }
    
    // Check if drawer is currently open
    const isDrawerOpen = window.isBlogDrawerOpen || document.querySelector('.blog-post-drawer');
    
    if (isDrawerOpen) {
      // Smooth transition: keep drawer open, just change content
      const currentContent = document.querySelector('.blog-post-drawer-content') || 
                            document.querySelector('.interactive-episode-body');
      if (currentContent) {
        currentContent.classList.add('transitioning');
      }
      
      // Add loading indicator
      const drawer = document.querySelector('.blog-post-drawer');
      if (drawer) {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'episode-loading-overlay';
        loadingOverlay.innerHTML = `
          <div class="episode-loading-content">
            <div class="episode-loading-spinner"></div>
            <div class="episode-loading-text">Loading ${nextMoment.title}...</div>
          </div>
        `;
        drawer.appendChild(loadingOverlay);
        
        // Scroll to top
        drawer.scrollTop = 0;
      }
      
      // Start the transition sequence
      setTimeout(() => {
        // Just call handleOpenBlogPost directly - it will handle moment selection internally
        if (window.handleOpenBlogPost) {
          window.handleOpenBlogPost(nextMoment.id);
        } else {
          console.error('handleOpenBlogPost not available');
        }
      }, 800); // Longer delay to show loading indicator
    } else {
      // Drawer is closed, use normal flow
      handleMomentSelection(nextMoment);
      setTimeout(() => {
        if (window.handleOpenBlogPost) {
          window.handleOpenBlogPost(nextMoment.id);
        }
      }, 100);
    }
  };

  // Expose the smooth transition function globally
  window.smoothEpisodeTransition = smoothEpisodeTransition;
  
  // Urban Runner navigation function
  window.addUrbanRunnerNavigation = (episodeId) => {
    if (window.EpisodeNavigation) {
      const navContainer = document.getElementById('episode-navigation-container');
      
      if (navContainer) {
        // Add breadcrumb navigation
        const breadcrumb = window.EpisodeNavigation.generateBreadcrumb(episodeId);
        const episodeNav = window.EpisodeNavigation.generateEpisodeNav(episodeId);
        
        navContainer.innerHTML = `
          <div style="margin-bottom: 1rem;">
            ${breadcrumb}
          </div>
          <div>
            ${episodeNav}
          </div>
        `;
      }
    } else {
      // Retry if navigation component isn't loaded yet
      setTimeout(() => window.addUrbanRunnerNavigation(episodeId), 100);
    }
  };

  // Check URL on initial load to set selectedId and zoom to location
  React.useEffect(() => {
    // Check for a 'path' query parameter (GitHub Pages 404 redirect)
    const params = new URLSearchParams(window.location.search);
    const pathFromQuery = params.get('path');
    let path = window.location.pathname;

    // If there's a 'path' query parameter, use it as the initial path
    if (pathFromQuery) {
      path = pathFromQuery;
      // Clean up the URL to remove the query parameter and set the correct path
      window.history.replaceState({}, '', path);
    }

    const match = path.match(/^\/moments\/(.+)/);
    if (match) {
      const momentId = match[1];
      const moment = window.momentsInTime.find(m => m.id === momentId);
      if (moment) {
        updateOverlayMessage(`Exploring ${moment.title}`); // Set moment-specific message upfront
        handleMomentSelection(moment); // Use the unified logic to select and zoom
      } else {
        // If moment ID is invalid, redirect to root
        window.history.replaceState({}, '', '/');
        updateOverlayMessage('Looking for Paul');
      }
    } else {
      // Check for current moment based on today's date
      const today = new Date();
      const currentMoment = window.momentsInTime.find(moment => {
        const startDate = new Date(moment.date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + moment.stayDuration);
        return today >= startDate && today <= endDate;
      });

      if (currentMoment) {
        updateOverlayMessage(`Exploring ${currentMoment.title}`); // Set moment-specific message upfront
        handleMomentSelection(currentMoment); // Use the unified logic to select and zoom
      } else {
        updateOverlayMessage('Looking for Paul'); // Default message
      }
    }
  }, [zoomCallback]);

  // Listen for popstate events (back/forward navigation)
  React.useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state || {};
      const momentId = state.momentId;
      const moment = momentId ? window.momentsInTime.find(m => m.id === momentId) : null;
      if (moment) {
        handleMomentSelection(moment); // Use the unified logic to select and zoom
      } else {
        setSelectedId(null); // Reset if no momentId in URL
        // Redirect to root to trigger current location logic
        window.history.replaceState({}, '', '/');
        updateOverlayMessage('Looking for Paul');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [zoomCallback]);

  // Manage overlay display
  React.useEffect(() => {
    let isMounted = true;
    const overlay = document.getElementById('overlay');
    overlay.style.display = 'flex';
    overlay.style.opacity = '1';
    const timer = setTimeout(() => {
      if (isMounted) {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.style.display = 'none';
        }, 1000); // Fade-out duration
      }
    }, 3000); // Show for 3 seconds
    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, []);

  return React.createElement(
    'div',
    { style: { position: 'relative' } },
    React.createElement(window.GlobeComponent, {
      handleTimelineClick: handleMomentSelection, // Pass the unified function
      selectedId,
      setSelectedId,
      selectedTag,
      setSelectedTag,
      selectedYear,
      setSelectedYear,
      setZoomCallback
    }),
    React.createElement(window.Footer, {
      handleTimelineClick: handleMomentSelection, // Pass the unified function
      selectedId,
      setSelectedId,
      selectedTag,
      selectedYear
    }),
    React.createElement(
      'button',
      {
        className: 'location-button',
        onClick: handleLocationButtonClick,
        title: 'Zoom to current location'
      },
      React.createElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          width: '24px',
          height: '24px'
        },
        React.createElement('path', {
          d: 'M12 2a6 6 0 0 1 6 6c0 5-6 10-6 10s-6-5-6-10a6 6 0 0 1 6-6z',
          strokeWidth: '2'
        }),
        React.createElement('circle', { cx: '12', cy: '8', r: '2', fill: 'currentColor' })
      )
    )
  );
};