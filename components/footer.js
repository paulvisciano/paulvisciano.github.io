window.Footer = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, selectedYear }) => {
  // Filter moments by selectedTag and selectedYear
  const filteredMoments = window.momentsInTime.filter(moment => {
    const tagMatch = selectedTag === "All" || moment.tags.includes(selectedTag);
    const yearMatch = selectedYear === "All" || new Date(moment.date).getUTCFullYear().toString() === selectedYear;
    return tagMatch && yearMatch;
  });

  // Group moments by year while preserving original order
  const momentsByYear = filteredMoments.reduce((acc, moment) => {
    const startDate = new Date(moment.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + moment.stayDuration - 1);
    const startYear = startDate.getUTCFullYear().toString();
    const endYear = endDate.getUTCFullYear().toString();
    
    // Add moment to both start and end years if they differ
    if (!acc[startYear]) {
      acc[startYear] = [];
    }
    acc[startYear].push(moment);
    
    if (startYear !== endYear) {
      if (!acc[endYear]) {
        acc[endYear] = [];
      }
      acc[endYear].push(moment);
    }
    return acc;
  }, {});

  // Get unique years from filtered moments and compute years spanned by each moment
  const years = filteredMoments.length > 0 
    ? [...new Set(filteredMoments.flatMap(moment => {
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
    acc[year] = filteredMoments.filter(moment => {
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
    const timelineContainer = document.querySelector('.timeline-container');
    
    if (timeline && timelineLine) {
      const entries = document.querySelectorAll('.timeline-entry, .timeline-year-entry');
      const totalWidth = Array.from(entries).reduce((acc, entry) => {
        return acc + entry.offsetWidth + 32; // Include margin-right (32px)
      }, 0) + 32; // Extra padding
      timelineLine.style.width = `${totalWidth}px`;
    }

    // Handle scroll events to rotate the globe
    const handleScroll = (event) => {
      if (!window.globeInstance) return;
      
      const scrollDelta = event.deltaX || event.deltaY;
      if (scrollDelta === 0) return;

      const currentPOV = window.globeInstance.pointOfView();
      const rotationSpeed = 0.2; // Reduced rotation speed for slower rotation
      const zoomSpeed = 0.001; // Very subtle zoom effect
      // Scroll right (positive delta) = going to past = rotate west (negative)
      // Scroll left (negative delta) = going to future = rotate east (positive)
      const newLng = currentPOV.lng + (scrollDelta > 0 ? -rotationSpeed : rotationSpeed);
      const newAltitude = Math.min(3.5, currentPOV.altitude + zoomSpeed); // Zoom out slightly, max altitude of 3.5
      
      window.globeInstance.pointOfView({
        lat: currentPOV.lat,
        lng: newLng,
        altitude: newAltitude
      }, 0);
    };

    if (timelineContainer) {
      timelineContainer.addEventListener('wheel', handleScroll, { passive: false });
    }

    // Scroll to selected moment, centering it in the timeline
    if (selectedId) {
      const selectedEntry = document.querySelector(`.timeline-entry[data-id="${selectedId}"]`);
      if (selectedEntry) {
        const entryRect = selectedEntry.getBoundingClientRect();
        const containerRect = timelineContainer.getBoundingClientRect();
        const scrollOffset = entryRect.left + (entryRect.width / 2) - (containerRect.width / 2);
        timelineContainer.scrollTo({
          left: timelineContainer.scrollLeft + scrollOffset,
          behavior: 'smooth'
        });
      }
    }

    return () => {
      if (timelineContainer) {
        timelineContainer.removeEventListener('wheel', handleScroll);
      }
    };
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
        filteredMoments.length === 0 ? 
          React.createElement('div', { className: 'timeline-empty' }, 'No adventures found for the selected filters') :
          years.map((year, index) => {
            const yearMoments = momentsByYear[year] || [];
            if (yearMoments.length === 0) return null; // Skip empty years
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
              ...yearMoments.map(moment => {
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
                    moment.fullLink !== '#' && React.createElement(
                      'span',
                      { className: 'full-moment-indicator', title: 'Full blog post available' },
                      '📖'
                    ),
                    React.createElement(
                      'div',
                      { className: 'timeline-highlight' },
                      moment.timelineHighlight
                    ),
                    React.createElement(
                      'div',
                      { 
                        className: 'timeline-date-combined',
                        title: fullDateRange
                      },
                      combinedDate,
                      React.createElement(
                        'span',
                        { className: 'timeline-duration' },
                        ` · ${moment.stayDuration} ${moment.stayDuration === 1 ? 'day' : 'days'}`
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