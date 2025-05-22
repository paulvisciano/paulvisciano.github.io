window.App = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [selectedYear, setSelectedYear] = React.useState("All");
  const [zoomCallback, setZoomCallback] = React.useState(null);

  // Unified logic for selecting a post (used for clicks, initial load, and popstate)
  const handlePostSelection = (post) => {
    if (post) {
      setSelectedId(post.id);
      if (zoomCallback) {
        zoomCallback(post);
      }
      // Normalize and update the URL only if it doesn't already match
      const intendedPath = `/post/${post.id}`;
      const currentPath = window.location.pathname;
      if (currentPath !== intendedPath) {
        window.history.pushState({ postId: post.id }, '', intendedPath);
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

    const match = path.match(/^\/post\/(.+)/);
    if (match) {
      const postId = match[1];
      const post = window.blogPosts.find(p => p.id === postId);
      if (post) {
        handlePostSelection(post); // Use the unified logic
      } else {
        // If post ID is invalid, redirect to root (will trigger current location logic)
        window.history.replaceState({}, '', '/');
      }
    }
  }, [zoomCallback]);

  // Listen for popstate events (back/forward navigation)
  React.useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state || {};
      const postId = state.postId;
      const post = postId ? window.blogPosts.find(p => p.id === postId) : null;
      if (post) {
        handlePostSelection(post); // Use the unified logic
      } else {
        setSelectedId(null); // Reset if no postId in URL
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
    // Skip if URL already has a post ID (direct access takes precedence)
    const path = window.location.pathname;
    if (path.match(/^\/post\/(.+)/)) {
      return; // URL already set by initial load logic
    }

    const currentPost = window.blogPosts.find(post => {
      const startDate = new Date(post.date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + post.stayDuration);
      return today >= startDate && today <= endDate;
    });

    if (currentPost) {
      handlePostSelection(currentPost); // Use the unified logic
    }
  }, [zoomCallback]);

  return React.createElement(
    'div',
    { style: { position: 'relative' } },
    React.createElement(window.GlobeComponent, {
      handleTimelineClick: handlePostSelection, // Pass the unified function
      selectedId,
      setSelectedId,
      selectedTag,
      setSelectedTag,
      selectedYear,
      setSelectedYear,
      setZoomCallback
    }),
    React.createElement(window.Footer, {
      handleTimelineClick: handlePostSelection, // Pass the unified function
      selectedId,
      setSelectedId,
      selectedTag,
      selectedYear
    })
  );
};