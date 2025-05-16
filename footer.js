window.Footer = () => {
  const handleTimelineClick = window.handleTimelineClick || (() => console.error("handleTimelineClick not defined"));

  return React.createElement(
    'footer',
    null,
    // Apple-Inspired Timeline Section
    React.createElement(
      'div',
      { className: 'timeline-container' },
      React.createElement(
        'div',
        { className: 'timeline' },
        React.createElement('div', { className: 'timeline-highlight-dot' }),
        window.blogPosts.map((post, index) =>
          React.createElement(
            'div',
            {
              key: post.title,
              className: 'timeline-entry',
              onClick: () => handleTimelineClick(post),
              style: { '--index': index }
            },
            React.createElement('div', { className: 'timeline-dot' }),
            React.createElement(
              'div',
              { className: 'timeline-card' },
              React.createElement('div', { className: 'timeline-date' }, post.timelineDate),
              React.createElement('div', { className: 'timeline-highlight' }, post.timelineHighlight)
            )
          )
        )
      )
    )
  );
};