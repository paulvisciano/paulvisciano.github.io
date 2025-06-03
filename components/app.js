window.App = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [selectedYear, setSelectedYear] = React.useState("All");
  const [zoomCallback, setZoomCallback] = React.useState(null);
  const [overlayMessage, setOverlayMessage] = React.useState(null); // Initialize as null

  // Function to update overlay message
  const updateOverlayMessage = (message) => {
    setOverlayMessage(message);
    const overlayMessageEl = document.getElementById('overlay-message');
    if (overlayMessageEl) {
      overlayMessageEl.textContent = message;
    }
  };

  // Unified logic for selecting a moment (used for clicks, initial load, and popstate)
  const handleMomentSelection = (moment) => {
    if (moment) {
      setSelectedId(moment.id);
      updateOverlayMessage(`${moment.title}...`); // Set moment-specific message
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
    const sortedMoments = window.momentsInTime.sort((a, b) => b.date - a.date);
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