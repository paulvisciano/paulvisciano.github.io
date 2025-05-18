window.GlobeComponent = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, setSelectedTag, selectedYear, setSelectedYear, setZoomCallback }) => {
  if (typeof window.blogPosts === 'undefined') {
    return React.createElement('div', null, 'Error: Data not loaded');
  }

  const regularTags = ["All", ...new Set(window.blogPosts.flatMap(post => post.tags))];
  const yearTags = ["All", ...new Set(window.blogPosts.map(post => new Date(post.date).getUTCFullYear().toString()))].sort((a, b) => b - a);
  const [popoverContent, setPopoverContent] = React.useState(null);
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isBlogDrawerOpen, setIsBlogDrawerOpen] = React.useState(false);
  const [blogPostContent, setBlogPostContent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const globeInstance = React.useRef(null);
  const popoverRef = React.useRef(null);
  const drawerRef = React.useRef(null);
  const blogDrawerRef = React.useRef(null);
  const isZooming = React.useRef(false);
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  // Expose state setters and refs to window for BlogPostDrawer
  window.setBlogPostContent = setBlogPostContent;
  window.isLoading = isLoading;
  window.error = error;
  window.blogDrawerRef = blogDrawerRef;

  const waitForZoom = (duration) => new Promise(resolve => setTimeout(resolve, duration));

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target) && !event.target.closest('.overlay')) {
        setPopoverContent(null);
        setSelectedId(null);
      }
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(event.target) && !event.target.closest('.filter-toggle-button')) {
        setIsDrawerOpen(false);
      }
      if (isBlogDrawerOpen && blogDrawerRef.current && !blogDrawerRef.current.contains(event.target) && !event.target.closest('.popover-link')) {
        setIsBlogDrawerOpen(false);
      }
    };

    const handleTouchStart = (event) => {
      if (event.target.closest('.overlay')) return;
      if (event.touches.length === 1) {
        touchStartX.current = event.touches[0].clientX;
        touchStartY.current = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
      if (event.target.closest('.overlay')) return;
      if (event.touches.length === 1 && popoverContent && touchStartX.current !== null && touchStartY.current !== null) {
        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;
        const deltaX = touchEndX - touchStartX.current;
        const deltaY = touchEndY - touchStartY.current;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distance > 50) {
          setPopoverContent(null);
          setSelectedId(null);
          touchStartX.current = null;
          touchStartY.current = null;
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartX.current = null;
      touchStartY.current = null;
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [popoverContent, setSelectedId, isDrawerOpen, isBlogDrawerOpen]);

  React.useEffect(() => {
    setZoomCallback(() => (post) => {
      if (!globeInstance.current || !post) {
        return;
      }

      try {
        if (isZooming.current) {
          return;
        }
        isZooming.current = true;
        globeInstance.current.controls().autoRotate = false;

        globeInstance.current.pointOfView({
          lat: post.location.lat,
          lng: post.location.lng,
          altitude: 1.0
        }, 2000);

        waitForZoom(2000).then(() => {
          globeInstance.current.pointOfView({
            lat: post.location.lat,
            lng: post.location.lng,
            altitude: 0.1
          }, 1500);

          waitForZoom(1500).then(() => {
            const finalCoords = globeInstance.current.getScreenCoords(post.location.lat, post.location.lng, 0.5);
            setPopoverPosition({
              top: finalCoords.y + 20,
              left: finalCoords.x
            });
            setPopoverContent({
              title: post.title || "No Title",
              snippet: post.snippet || "No Snippet",
              fullLink: post.fullLink || "#",
              lat: post.location.lat,
              lng: post.location.lng,
              id: post.id
            });
            setSelectedId(post.id);
            isZooming.current = false;
          });
        });
      } catch (error) {
        isZooming.current = false;
      }
    });
  }, [setZoomCallback, setSelectedId]);

  const onZoomHandler = () => {
    if (!globeInstance.current) return;

    const altitude = globeInstance.current.pointOfView().altitude;
    const maxPointAltitude = 0.4;
    const minPointAltitude = 0.02;
    const maxAltitude = 2.5;
    const minAltitude = 0.1;

    let pointAltitude = maxPointAltitude - (maxPointAltitude - minPointAltitude) * (altitude - minAltitude) / (maxAltitude - minAltitude);

    if(altitude < maxAltitude / 10) {
      console.log('Smallest point')
      pointAltitude = 0.001;
    }
    else if (altitude < maxAltitude / 2) {
      console.log('Mid point')
      pointAltitude = 0.02;
    } else if (altitude > (maxAltitude / 2) && altitude < (maxAltitude - 0.1)) {
      console.log('Higher')
      pointAltitude = 0.08;
    } else if (altitude >= maxAltitude - 0.1) {
      console.log('Highest')

      pointAltitude = 0.4;
    }

    globeInstance.current.pointAltitude(pointAltitude);
    globeInstance.current.controls().autoRotate = altitude > 1;
  };

  React.useEffect(() => {
    try {
      const textureLoader = new THREE.TextureLoader();
      const globeTexture = textureLoader.load('//unpkg.com/three-globe/example/img/earth-night.jpg');
      globeTexture.anisotropy = 4;
      globeTexture.minFilter = THREE.LinearMipmapLinearFilter;
      globeTexture.magFilter = THREE.LinearFilter;

      globeInstance.current = Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .globeMaterial(new THREE.MeshPhongMaterial({
          map: globeTexture,
          side: THREE.DoubleSide
        }))
        .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0)
        .pointsData([])
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(() => '#ffa500')
        .pointRadius('radius')
        .pointsMerge(false)
        .onZoom(onZoomHandler)
        .onPointHover((point) => {
          if (point) {
            const post = window.blogPosts.find(p => 
              p.location.lat === point.lat && p.location.lng === point.lng
            );
            if (post && post.id) {
              const timelineItem = document.querySelector(`.timeline-entry[data-id="${post.id}"]`);
              if (timelineItem) {
                document.querySelectorAll('.timeline-entry.selected').forEach(item => 
                  item.classList.remove('selected')
                );
                timelineItem.classList.add('selected');
                timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          }
        })
        (document.getElementById('globeViz'));

      onZoomHandler();

      try {
        globeInstance.current.controls().autoRotate = true;
        globeInstance.current.controls().autoRotateSpeed = 0.1;
        globeInstance.current.controls().enableZoom = true;
        globeInstance.current.controls().minDistance = 120;
        globeInstance.current.controls().maxDistance = 500;
      } catch (error) {
      }

      globeInstance.current.onPointClick(point => {
        try {
          if (!point) {
            return;
          }

          if (isZooming.current) {
            return;
          }
          isZooming.current = true;
          globeInstance.current.controls().autoRotate = false;

          const post = window.blogPosts.find(p => 
            p.location.lat === point.lat && p.location.lng === point.lng
          );

          if (post && post.id) {
            setSelectedId(post.id);
            handleTimelineClick(post);
          }

          globeInstance.current.pointOfView({
            lat: point.lat,
            lng: point.lng,
            altitude: 0.1
          }, 1500);

          waitForZoom(1500).then(() => {
            const finalCoords = globeInstance.current.getScreenCoords(point.lat, point.lng, 0.5);
            setPopoverPosition({
              top: finalCoords.y + 20,
              left: finalCoords.x
            });
            setPopoverContent({
              title: point.title || "No Title",
              snippet: point.snippet || "No Snippet",
              fullLink: point.fullLink || "#",
              lat: point.lat,
              lng: point.lng,
              id: post.id
            });
            isZooming.current = false;
          });
        } catch (error) {
          isZooming.current = false;
        }
      });

      const globeContainer = document.getElementById('globeViz');
      const preventScroll = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      globeContainer.addEventListener('wheel', preventScroll, { passive: false });

      return () => {
        globeContainer.removeEventListener('wheel', preventScroll);
        if (globeInstance.current) {
          globeInstance.current.destroy();
        }
      };
    } catch (error) {
    }
  }, []);

  React.useEffect(() => {
    if (globeInstance.current) {
      const filteredPosts = window.blogPosts.filter(post => {
        const tagMatch = selectedTag === "All" || post.tags.includes(selectedTag);
        const yearMatch = !selectedYear || selectedYear === "All" || new Date(post.date).getUTCFullYear().toString() === selectedYear;
        return tagMatch && yearMatch;
      });
      
      const minDuration = 1;
      const maxDuration = 730;
      const minRadius = 0.2;
      const maxRadius = 0.8;

      const pointsData = filteredPosts.map(post => {
        const radius = minRadius + (maxRadius - minRadius) * (post.stayDuration - minDuration) / (maxDuration - minDuration);
        return {
          lat: post.location.lat,
          lng: post.location.lng,
          label: post.location.name,
          fullLink: post.fullLink,
          snippet: post.snippet,
          title: post.title,
          stayDuration: post.stayDuration,
          id: post.id,
          radius: radius
        };
      });

      globeInstance.current.pointsData(pointsData);
      onZoomHandler();
    }
  }, [selectedTag, selectedYear]);

  React.useEffect(() => {
    setSelectedId(null);
    setPopoverContent(null);
  }, [selectedTag, selectedYear, setSelectedId]);

  const handleOpenBlogPost = async (postId) => {
    const post = window.blogPosts.find(p => p.id === postId);

    if (post) {
      setIsLoading(true);
      setError(null);

      try {
        const htmlFile = post.fullLink && post.fullLink !== "#" ? post.fullLink : `${post.id}.html`;
        const response = await fetch(htmlFile);

        if (!response.ok) {
          throw new Error('Failed to load post content');
        }
        
        const htmlContent = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const bodyContent = doc.body.innerHTML;

        setBlogPostContent({
          title: post.title,
          content: bodyContent,
          image: post.image ? post.image.replace('attachment://', '') : null,
          imageAlt: post.imageAlt,
          caption: post.caption,
          mapLink: post.mapLink,
          mapText: post.mapText
        });

        setIsBlogDrawerOpen(true);
        setPopoverContent(null);
      } catch (err) {
        setError('Failed to load the full post. Please try again.');
        
        setBlogPostContent({
          title: post.title,
          content: `<p>${err.message}</p>`,
          image: post.image ? post.image.replace('attachment://', '') : null,
          imageAlt: post.imageAlt,
          caption: post.caption,
          mapLink: post.mapLink,
          mapText: post.mapText
        });
        setIsBlogDrawerOpen(true);
        setPopoverContent(null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const Popover = ({ title, snippet, fullLink, onClose, position, id }) => {
    return React.createElement(
      'div',
      {
        className: 'popover',
        ref: popoverRef,
        style: {
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)',
          animation: 'fadeIn 0.5s ease-in-out'
        }
      },
      React.createElement(
        'div',
        { className: 'popover-content' },
        React.createElement(
          'div',
          { className: 'popover-header' },
          React.createElement('h2', { className: 'popover-title' }, title)
        ),
        React.createElement(
          'div',
          { className: 'popover-body' },
          React.createElement('p', null, snippet)
        ),
        fullLink && fullLink !== '#' && React.createElement(
          'div',
          { className: 'popover-footer' },
          React.createElement(
            'button',
            { 
              className: 'popover-link',
              onClick: () => handleOpenBlogPost(id)
            },
            'View Full Post'
          )
        )
      )
    );
  };

  return React.createElement(
    'div',
    { className: 'container mx-auto main-content' },
    React.createElement(
      'div',
      { className: 'filter-drawer-container', ref: drawerRef },
      React.createElement(
        'button',
        {
          className: `filter-toggle-button ${isDrawerOpen ? 'open' : ''}`,
          onClick: () => setIsDrawerOpen(!isDrawerOpen)
        },
        'Filters',
        React.createElement('span', { className: 'chevron' }, isDrawerOpen ? '▲' : '▼')
      ),
      isDrawerOpen && React.createElement(
        'div',
        { className: 'filter-drawer open' },
        React.createElement(
          'button',
          {
            className: 'close-button',
            onClick: () => setIsDrawerOpen(false)
          },
          '×'
        ),
        React.createElement(
          'div',
          { className: 'year-filter-container' },
          yearTags.map(year =>
            React.createElement(
              'button',
              {
                key: `year-${year}`,
                onClick: () => setSelectedYear(year),
                className: `filter-tag year-tag ${selectedYear === year ? 'active' : ''}`
              },
              year
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'tag-filter-container' },
          regularTags.map(tag =>
            React.createElement(
              'button',
              {
                key: `tag-${tag}`,
                onClick: () => setSelectedTag(tag),
                className: `filter-tag ${selectedTag === tag ? 'active' : ''}`
              },
              tag
            )
          )
        )
      )
    ),
    popoverContent && React.createElement(Popover, {
      title: popoverContent.title,
      snippet: popoverContent.snippet,
      fullLink: popoverContent.fullLink,
      onClose: () => setPopoverContent(null),
      position: popoverPosition,
      id: popoverContent.id
    }),
    isBlogDrawerOpen && blogPostContent && React.createElement(window.BlogPostDrawer, {
      content: blogPostContent,
      onClose: () => setIsBlogDrawerOpen(false)
    })
  );
};