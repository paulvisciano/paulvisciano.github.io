window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag }) => {
  // Group posts by year
  const years = [...new Set(window.blogPosts.map(post => post.date.getFullYear()))].sort();
  const postsByYear = years.reduce((acc, year) => {
    acc[year] = window.blogPosts.filter(post => post.date.getFullYear() === year);
    return acc;
  }, {});

  // UseEffect to dynamically set timeline-line width
  React.useEffect(() => {
    const timeline = document.querySelector('.timeline');
    const timelineLine = document.querySelector('.timeline-line');
    if (timeline && timelineLine) {
      // Calculate total width based on timeline entries and year entries
      const entries = document.querySelectorAll('.timeline-entry, .timeline-year-entry');
      const totalWidth = Array.from(entries).reduce((acc, entry) => {
        return acc + entry.offsetWidth + 32; // Include margin-right (32px)
      }, 0) + 32; // Extra padding
      timelineLine.style.width = `${totalWidth}px`;
    }
  }, [selectedTag]); // Re-run when selectedTag changes

  return React.createElement(
    'footer',
    null,
    React.createElement(
      'div',
      { className: 'timeline-container' },
      React.createElement(
        'div',
        { className: 'timeline-line' }
      ),
      React.createElement(
        'div',
        { className: 'timeline' },
        years.map((year, index) => {
          const yearPosts = postsByYear[year];
          return [
            React.createElement(
              'div',
              {
                key: `year-${year}`,
                className: 'timeline-year-entry',
                style: { '--index': index } // For fade-in animation
              },
              React.createElement('div', { className: 'timeline-dot' }),
              React.createElement(
                'div',
                { className: 'timeline-year-card' },
                React.createElement('div', { className: 'timeline-year-text' }, year)
              )
            ),
            ...yearPosts
              .filter(post => selectedTag === "All" || post.tags.includes(selectedTag))
              .map(post => {
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
                    style: { '--index': index + 1 } // Adjust index for animation
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
          ];
        }).flat()
      )
    )
  );
};