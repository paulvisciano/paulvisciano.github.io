window.App = () => {
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [zoomCallback, setZoomCallback] = React.useState(null);

  const handleTimelineClick = (post) => {
    if (!post || !post.id) return;
    setSelectedId(post.id);
    // Scroll timeline item into view
    const timelineItem = document.querySelector(`.timeline-entry[data-id="${post.id}"]`);
    if (timelineItem) {
      document.querySelectorAll('.timeline-entry.selected').forEach(item => 
        item.classList.remove('selected')
      );
      timelineItem.classList.add('selected');
      timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Trigger zoom in Globe
    if (zoomCallback) {
      zoomCallback(post);
    }
  };

  return React.createElement(
    'div',
    { className: 'app-container' },
    React.createElement(window.GlobeComponent, { 
      handleTimelineClick, 
      selectedId, 
      setSelectedId,
      selectedTag,
      setSelectedTag,
      setZoomCallback
    }),
    React.createElement(window.Footer, { 
      handleTimelineClick, 
      selectedId, 
      setSelectedId,
      selectedTag
    })
  );
};