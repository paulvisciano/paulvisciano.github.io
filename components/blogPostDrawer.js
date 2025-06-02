window.BlogPostDrawer = ({ content, onClose }) => {
  return React.createElement(
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
    content && content.image && React.createElement(
      'div',
      { key: 'cover', className: 'blog-post-cover' },
      React.createElement('img', {
        src: content.image,
        alt: content.imageAlt,
        className: 'blog-post-cover-image'
      }),
      React.createElement(
        'div',
        { className: 'blog-post-title-bar' },
        React.createElement('h1', { className: 'blog-post-title' }, content.title)
      )
    ),
    React.createElement(
      'div',
      { className: 'blog-post-drawer-content' },
      window.isLoading && React.createElement('p', null, 'Loading...'),
      window.error && React.createElement('p', { style: { color: 'red' } }, window.error),
      content && [
        React.createElement('div', {
          key: 'content',
          className: 'blog-post-body',
          dangerouslySetInnerHTML: { __html: content.content }
        }),
        content.mapLink && React.createElement(
          'a',
          { 
            key: 'map',
            href: content.mapLink, 
            target: '_blank', 
            rel: 'noopener noreferrer',
            className: 'map-link'
          },
          content.mapText
        )
      ]
    )
  );
};