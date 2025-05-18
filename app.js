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

  // Determine current location based on today's date
  const today = new Date();
  React.useEffect(() => {
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