window.App = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [selectedYear, setSelectedYear] = React.useState("All");
  const [zoomCallback, setZoomCallback] = React.useState(null);

  // Unified logic for selecting a moment (used for clicks, initial load, and popstate)
  const handleMomentSelection = (moment) => {
    if (moment) {
      setSelectedId(moment.id);
      if (zoomCallback) {
        zoomCallback(moment);
      }
      // Normalize and update the URL only if it doesn't already match
      const intendedPath = `/moment/${moment.id}`;
      const currentPath = window.location.pathname;
      if (currentPath !== intendedPath) {
        window.history.pushState({ momentId: moment.id }, '', intendedPath);
      }
    }
  };

  // Check URL on initial load to set selectedId
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

    const match = path.match(/^\/moment\/(.+)/);
    if (match) {
      const momentId = match[1];
      const moment = window.momentsInTime.find(m => m.id === momentId);
      if (moment) {
        handleMomentSelection(moment); // Use the unified logic
      } else {
        // If moment ID is invalid, redirect to root (will trigger current location logic)
        window.history.replaceState({}, '', '/');
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
        handleMomentSelection(moment); // Use the unified logic
      } else {
        setSelectedId(null); // Reset if no momentId in URL
        // Redirect to root to trigger current location logic
        window.history.replaceState({}, '', '/');
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

  // Determine current location based on today's date and update URL
  const today = new Date();
  React.useEffect(() => {
    // Skip if URL already has a moment ID (direct access takes precedence)
    const path = window.location.pathname;
    if (path.match(/^\/moment\/(.+)/)) {
      return; // URL already set by initial load logic
    }

    const currentMoment = window.momentsInTime.find(moment => {
      const startDate = new Date(moment.date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + moment.stayDuration);
      return today >= startDate && today <= endDate;
    });

    if (currentMoment) {
      handleMomentSelection(currentMoment); // Use the unified logic
    }
  }, [zoomCallback]);

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
    })
  );
};