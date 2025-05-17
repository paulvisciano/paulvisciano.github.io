window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag }) => {
  // Filter posts by selectedTag
  const filteredPosts = window.blogPosts.filter(post => selectedTag === "All" || post.tags.includes(selectedTag));
  
  // Get unique years from filtered posts
  const years = [...new Set(filteredPosts.map(post => post.date.getFullYear()))].sort();

  // Create a flat list of timeline items (year cards and post cards)
  const timelineItems = [];
  years.forEach(year => {
    // Add year card
    timelineItems.push({
      type: 'year',
      year,
      id: `year-${year}`
    });
    // Add posts for this year
    filteredPosts
      .filter(post => post.date.getFullYear() === year)
      .forEach(post => {
        timelineItems.push({
          type: 'post',
          post,
          id: post.id
        });
      });
  });

  // Auto-scroll to start when tag changes
  React.useEffect(() => {
    const timelineContainer = document.querySelector('.timeline-container');
    if (timelineContainer) {
      timelineContainer.scrollLeft = 0; // Scroll to the start
    }
  }, [selectedTag]);

  return React.createElement(
    'footer',
    null,
    React.createElement(
      'div',
      { className: 'timeline-container' },
      React.createElement(
        'div',
        { className: 'timeline-line' },
        null
      ),
      React.createElement(
        'div',
        { className: 'timeline' },
        timelineItems.map((item, index) => {
          if (item.type === 'year') {
            return React.createElement(
              'div',
              {
                key: item.id,
                className: 'timeline-entry timeline-year-entry',
                style: { '--index': index }
              },
              React.createElement('div', { 
                className: 'timeline-dot timeline-year-dot',
                style: { width: '12px', height: '12px' }
              }),
              React.createElement(
                'div',
                { className: 'timeline-card timeline-year-card' },
                React.createElement('div', { className: 'timeline-year-text' }, item.year)
              )
            );
          } else {
            const { post } = item;
            const dotSize = Math.min(8 + post.stayDuration * 0.5, 16);
            const abbrevMonth = post.date.toLocaleDateString('en-US', { month: 'short' });
            return React.createElement(
              'div',
              {
                key: post.id,
                className: `timeline-entry ${selectedId === post.id ? 'selected' : ''}`,
                'data-id': post.id,
                onClick: () => {
                  setSelectedId(post.id);
                  handleTimelineClick(post);
                },
                style: { '--index': index }
              },
              React.createElement('div', { 
                className: 'timeline-dot',
                style: { width: `${dotSize}px`, height: `${dotSize}px` }
              }),
              React.createElement(
                'div',
                { className: 'timeline-card' },
                React.createElement('div', { className: 'timeline-highlight' }, post.timelineHighlight),
                React.createElement('div', { className: 'timeline-date' }, abbrevMonth)
              )
            );
          }
        })
      )
    )
  );
};