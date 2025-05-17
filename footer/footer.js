window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag }) => {
  // Group posts by year for year markers
  const years = [...new Set(window.blogPosts.map(post => post.date.getFullYear()))].sort();
  const postsByYear = years.reduce((acc, year) => {
    acc[year] = window.blogPosts.filter(post => post.date.getFullYear() === year);
    return acc;
  }, {});

  // Calculate approximate positions for year markers
  let entryCount = 0;
  const yearPositions = years.reduce((acc, year) => {
    acc[year] = entryCount * 180 + 16; // Start of year
    entryCount += postsByYear[year].length;
    return acc;
  }, {});

  return React.createElement(
    'footer',
    null,
    React.createElement(
      'div',
      { className: 'timeline-container' },
      React.createElement(
        'div',
        { className: 'timeline-line' },
        years.map(year => 
          React.createElement(
            'div',
            {
              key: `year-${year}`,
              className: 'timeline-year',
              style: { marginLeft: `${yearPositions[year] - (entryCount > 0 ? 90 : 16)}px` }
            },
            year
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'timeline' },
        window.blogPosts
          .filter(post => selectedTag === "All" || post.tags.includes(selectedTag))
          .map((post) => {
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
                }
              },
              React.createElement('div', { 
                className: 'timeline-dot',
                style: { width: `${10}px`, height: `${10}px` }
              }),
              React.createElement(
                'div',
                { className: 'timeline-card' },
                React.createElement('div', { className: 'timeline-highlight' }, post.timelineHighlight),
                React.createElement('div', { className: 'timeline-date' }, abbrevMonth)
              )
            );
          })
      )
    )
  );
};