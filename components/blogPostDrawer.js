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
    React.createElement(
      'div',
      { className: 'blog-post-drawer-content' },
      window.isLoading && React.createElement('p', null, 'Loading...'),
      window.error && React.createElement('p', { style: { color: 'red' } }, window.error),
      content && [
        React.createElement('h1', { key: 'title' }, content.title),
        content.image && React.createElement('img', { 
          key: 'image',
          src: content.image, 
          alt: content.imageAlt,
          className: 'blog-post-image'
        }),
        content.caption && React.createElement('p', { 
          key: 'caption',
          className: 'caption'
        }, content.caption),
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