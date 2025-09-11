window.InteractiveEpisodeDrawer = ({ content, onClose }) => {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      {
        className: `blog-post-backdrop ${content ? 'open' : ''}`,
        onClick: onClose
      }
    ),
    React.createElement(
      'div',
      {
        className: `blog-post-drawer ${content ? 'open' : ''}`,
        ref: window.blogDrawerRef
      },
      React.createElement(
        'button',
        {
          className: 'close-button',
          onClick: () => {
            onClose();
            window.setBlogPostContent(null);
          }
        },
        '×'
      ),
      React.createElement(
        'div',
        { className: 'interactive-episode-content' },
        window.isLoading && React.createElement('p', null, 'Loading...'),
        window.error && React.createElement('p', { style: { color: 'red' } }, window.error),
        content && React.createElement('div', {
          key: 'content',
          className: 'interactive-episode-body',
          dangerouslySetInnerHTML: { __html: content.content }
        })
      )
    )
  );
};
