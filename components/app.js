window.App = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [selectedYear, setSelectedYear] = React.useState("All");
  const [zoomCallback, setZoomCallback] = React.useState(null);

  // Handle timeline click
  const handleTimelineClick = (post) => {
    if (zoomCallback) {
      zoomCallback(post);
    }
  };

  // Check URL on initial load to set selectedId
  React.useEffect(() => {
    const path = window.location.pathname; // e.g., "/post/san-diego-2025-05-20"
    const match = path.match(/^\/post\/(.+)/);
    
    if (match) {
      const postId = match[1];
    
      const post = window.blogPosts.find(p => p.id === postId);
    
      if (post) {
        setSelectedId(postId);
        if (zoomCallback) {
          zoomCallback(post);
        }
      }
    }
  }, [zoomCallback]);

  // Listen for popstate events (back/forward navigation)
  React.useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state || {};
      const postId = state.postId;
      if (postId) {
        const post = window.blogPosts.find(p => p.id === postId);
        if (post) {
          setSelectedId(postId);
          if (zoomCallback) {
            zoomCallback(post);
          }
        }
      } else {
        setSelectedId(null); // Reset if no postId in URL
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
      setSelectedId(currentPost.id);
      if (zoomCallback) {
        zoomCallback(currentPost);
      }
      // Update the URL to reflect the current location
      window.history.pushState({ postId: currentPost.id }, '', `/post/${currentPost.id}`);
    }
  }, [zoomCallback]);

  return React.createElement(
    'div',
    { style: { position: 'relative' } },
    React.createElement(window.GlobeComponent, {
      handleTimelineClick,
      selectedId,
      setSelectedId,
      selectedTag,
      setSelectedTag,
      selectedYear,
      setSelectedYear,
      setZoomCallback
    }),
    React.createElement(window.Footer, {
      handleTimelineClick,
      selectedId,
      setSelectedId,
      selectedTag,
      selectedYear
    })
  );
};