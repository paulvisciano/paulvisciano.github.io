window.BlogPostDrawer = ({ content, onClose }) => {
  // If there's an image, we want to remove the title from the content since it's already shown in the title bar
  const processedContent = content && content.image ? {
    ...content,
    content: content.content.replace(/<h2>[^<]*<\/h2>/, '') // Remove the first h2 tag which is typically the title
  } : content;

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
      content && content.image && React.createElement(
        'div',
        { key: 'cover', className: 'blog-post-cover' },
        React.createElement('img', {
          src: content.image,
          alt: content.imageAlt,
          className: 'blog-post-cover-image',
          style: content.image.includes('03-20-sofia-childhood.jpg') ? { objectFit: 'scale-down', objectPosition: 'center' } : undefined
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
        processedContent && [
          React.createElement('div', {
            key: 'content',
            className: 'blog-post-body',
            dangerouslySetInnerHTML: { __html: processedContent.content }
          }),
          // Add Urban Runner episode navigation if this is an Urban Runner episode
          processedContent.title && processedContent.title.includes('Urban Runner') && React.createElement('div', {
            key: 'episode-nav',
            id: 'episode-navigation-container',
            style: { marginTop: '2rem' }
          }),
          processedContent.mapLink && React.createElement(
            'a',
            { 
              key: 'map',
              href: processedContent.mapLink, 
              target: '_blank', 
              rel: 'noopener noreferrer',
              className: 'map-link'
            },
            processedContent.mapText
          )
        ]
      )
    )
  );
};