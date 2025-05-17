window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, selectedYear }) => {
  // Filter posts by selectedTag and selectedYear
  const filteredPosts = window.blogPosts.filter(post => {
    const tagMatch = selectedTag === "All" || post.tags.includes(selectedTag);
    const yearMatch = !selectedYear || selectedYear === "All" || new Date(post.date).getUTCFullYear().toString() === selectedYear;
    return tagMatch && yearMatch;
  });

  // Get unique years from filtered posts
  const years = filteredPosts.length > 0 
    ? [...new Set(filteredPosts.map(post => new Date(post.date).getUTCFullYear()))].sort((a, b) => a - b)
    : [];

  // Group filtered posts by year
  const postsByYear = years.reduce((acc, year) => {
    acc[year] = filteredPosts.filter(post => new Date(post.date).getUTCFullYear() === year);
    return acc;
  }, {});

  // UseEffect to dynamically set timeline-line width
  React.useEffect(() => {
    const timeline = document.querySelector('.timeline');
    const timelineLine = document.querySelector('.timeline-line');
    if (timeline && timelineLine) {
      const entries = document.querySelectorAll('.timeline-entry, .timeline-year-entry');
      const totalWidth = Array.from(entries).reduce((acc, entry) => {
        return acc + entry.offsetWidth + 32; // Include margin-right (32px)
      }, 0) + 32; // Extra padding
      timelineLine.style.width = `${totalWidth}px`;
    }
  }, [selectedTag, selectedYear]);

  // Helper function to format combined date (month and day range)
  const formatCombinedDate = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
    const startDay = start.getUTCDate();
    const endDay = end.getUTCDate();
    if (duration === 1) {
      return `${startMonth} ${startDay}`;
    }
    return startMonth === endMonth 
      ? `${startMonth} ${startDay}–${endDay}`
      : `${startMonth} ${startDay}–${endMonth} ${endDay}`;
  };

  // Helper function for tooltip full date
  const formatFullDateRange = (startDate, duration) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + duration - 1);
    const options = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

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
        filteredPosts.length === 0 ? 
          React.createElement('div', { className: 'timeline-empty' }, 'No adventures found for the selected filters') :
          years.map((year, index) => {
            const yearPosts = postsByYear[year] || [];
            if (yearPosts.length === 0) return null; // Skip empty years
            return [
              React.createElement(
                'div',
                {
                  key: `year-${year}`,
                  className: 'timeline-year-entry',
                  style: { '--index': index }
                },
                React.createElement('div', { className: 'timeline-dot' }),
                React.createElement(
                  'div',
                  { className: 'timeline-year-card' },
                  React.createElement('div', { className: 'timeline-year-text' }, year)
                )
              ),
              ...yearPosts.map(post => {
                const combinedDate = formatCombinedDate(post.date, post.stayDuration);
                const fullDateRange = formatFullDateRange(post.date, post.stayDuration);

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
                    style: { '--index': index + 1 }
                  },
                  React.createElement('div', { 
                    className: 'timeline-dot',
                    style: { width: `${10}px`, height: `${10}px` }
                  }),
                  React.createElement(
                    'div',
                    { className: 'timeline-card' },
                    React.createElement(
                      'div',
                      { 
                        className: 'timeline-date-combined',
                        title: fullDateRange
                      },
                      combinedDate
                    ),
                    React.createElement('div', { className: 'timeline-highlight' }, post.timelineHighlight)
                  )
                );
              })
            ];
          }).flat()
      )
    )
  );
};