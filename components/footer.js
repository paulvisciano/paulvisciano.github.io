window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, selectedYear }) => {
  // Filter moments by selectedTag and selectedYear
  const filteredMomentsInTime = window.momentsInTime.filter(moment => {
    const tagMatch = selectedTag === "All" || moment.tags.includes(selectedTag);
    const yearMatch = !selectedYear || selectedYear === "All" || new Date(moment.date).getUTCFullYear().toString() === selectedYear;
    return tagMatch && yearMatch;
  });

  // Get unique years from filtered moments and compute years spanned by each moment
  const years = filteredMomentsInTime.length > 0 
    ? [...new Set(filteredMomentsInTime.flatMap(moment => {
        const startDate = new Date(moment.date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + moment.stayDuration - 1);
        const startYear = startDate.getUTCFullYear();
        const endYear = endDate.getUTCFullYear();
        const yearRange = [];
        for (let year = startYear; year <= endYear; year++) {
          yearRange.push(year);
        }
        return yearRange;
      }))].sort((a, b) => a - b)
    : [];

  // Group filtered moments by year, allowing moments to appear in multiple years
  const momentsInTimeByYear = years.reduce((acc, year) => {
    acc[year] = filteredMomentsInTime.filter(moment => {
      const startDate = new Date(moment.date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + moment.stayDuration - 1);
      const startYear = startDate.getUTCFullYear();
      const endYear = endDate.getUTCFullYear();
      return year >= startYear && year <= endYear;
    });
    return acc;
  }, {});

  // UseEffect to dynamically set timeline-line width and scroll to selected moment
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

    // Scroll to selected moment, centering it in the timeline
    if (selectedId) {
      const selectedEntry = document.querySelector(`.timeline-entry[data-id="${selectedId}"]`);
      if (selectedEntry) {
        const timelineContainer = document.querySelector('.timeline-container');
        const entryRect = selectedEntry.getBoundingClientRect();
        const containerRect = timelineContainer.getBoundingClientRect();
        const scrollOffset = entryRect.left + (entryRect.width / 2) - (containerRect.width / 2);
        timelineContainer.scrollTo({
          left: timelineContainer.scrollLeft + scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedTag, selectedYear, selectedId]);

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
        filteredMomentsInTime.length === 0 ? 
          React.createElement('div', { className: 'timeline-empty' }, 'No adventures found for the selected filters') :
          years.map((year, index) => {
            const yearMomentsInTime = momentsInTimeByYear[year] || [];
            if (yearMomentsInTime.length === 0) return null; // Skip empty years
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
              ...yearMomentsInTime.map(moment => {
                const combinedDate = formatCombinedDate(moment.date, moment.stayDuration);
                const fullDateRange = formatFullDateRange(moment.date, moment.stayDuration);

                return React.createElement(
                  'div',
                  {
                    key: `${moment.id}-${year}`, // Unique key for each moment-year combination
                    className: `timeline-entry ${selectedId === moment.id ? 'selected' : ''} ${moment.fullLink !== '#' ? 'has-full-moment' : ''}`,
                    'data-id': moment.id,
                    onClick: () => {
                      handleTimelineClick(moment); // Use the unified logic (includes URL update)
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
                    React.createElement(
                      'div',
                      { className: 'timeline-highlight' },
                      moment.timelineHighlight,
                      moment.fullLink !== '#' && React.createElement(
                        'span',
                        { className: 'full-moment-indicator', title: 'Full blog post available' },
                        '📖'
                      )
                    )
                  )
                );
              })
            ];
          }).flat()
      )
    )
  );
};