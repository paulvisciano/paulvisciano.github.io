window.GlobeComponent = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, setSelectedTag, selectedYear, setSelectedYear, setZoomCallback }) => {
  if (typeof window.blogPosts === 'undefined') {
    return React.createElement('div', null, 'Error: Data not loaded');
  }

  // Separate regular tags and years
  const regularTags = ["All", ...new Set(window.blogPosts.flatMap(post => post.tags))];
  const yearTags = ["All", ...new Set(window.blogPosts.map(post => new Date(post.date).getUTCFullYear().toString()))].sort((a, b) => b - a);
  const [popoverContent, setPopoverContent] = React.useState(null);
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 });
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false); // State for drawer visibility
  const globeInstance = React.useRef(null);
  const popoverRef = React.useRef(null);
  const drawerRef = React.useRef(null); // Ref for filter drawer container
  const isZooming = React.useRef(false);
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  // Utility to wait for zoom animation
  const waitForZoom = (duration) => new Promise(resolve => setTimeout(resolve, duration));

  // Handle clicks and taps outside the popover and filter drawer
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle popover dismissal
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverContent(null);
        setSelectedId(null);
      }
      // Handle filter drawer dismissal
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsDrawerOpen(false);
      }
    };

    const handleTouchStart = (event) => {
      if (event.touches.length === 1) {
        touchStartX.current = event.touches[0].clientX;
        touchStartY.current = event.touches[0].clientY;
      }
    };

    const handleTouchMove = (event) => {
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
  }, [popoverContent, setSelectedId, isDrawerOpen]);

  // Provide zoom callback to App.js
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

  // Define onZoomHandler
  const onZoomHandler = () => {
    if (!globeInstance.current) return;

    const altitude = globeInstance.current.pointOfView().altitude;
    const maxRadius = 0.2;
    const minRadius = 0.5;
    const maxPointAltitude = 0.4;
    const minPointAltitude = 0.02;
    const maxAltitude = 2.5;
    const minAltitude = 0.1;
    const radius = maxRadius - (maxRadius - minRadius) * (altitude - minAltitude) / (maxAltitude - minAltitude);
    let pointAltitude = maxPointAltitude - (maxPointAltitude - minPointAltitude) * (altitude - minAltitude) / (maxAltitude - minAltitude);

    if (altitude < maxAltitude / 2) {
      pointAltitude = 0.02;
    } else if (altitude > (maxAltitude / 2) && altitude < (maxAltitude - 0.1)) {
      pointAltitude = 0.08;
    } else if (altitude >= maxAltitude - 0.1) {
      pointAltitude = 0.4;
    }

    globeInstance.current.pointRadius(radius);
    globeInstance.current.pointAltitude(pointAltitude);
    globeInstance.current.controls().autoRotate = altitude > 2.2;
  };

  // Initialize the Globe.GL on mount
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

  // Update pointsData and trigger zoom handler when filters change
  React.useEffect(() => {
    if (globeInstance.current) {
      const filteredPosts = window.blogPosts.filter(post => {
        const tagMatch = selectedTag === "All" || post.tags.includes(selectedTag);
        const yearMatch = !selectedYear || selectedYear === "All" || new Date(post.date).getUTCFullYear().toString() === selectedYear;
        return tagMatch && yearMatch;
      });
      
      const pointsData = filteredPosts.map(post => ({
        lat: post.location.lat,
        lng: post.location.lng,
        label: post.location.name,
        fullLink: post.fullLink,
        snippet: post.snippet,
        title: post.title,
        stayDuration: post.stayDuration,
        id: post.id
      }));

      globeInstance.current.pointsData(pointsData);
      onZoomHandler();
    }
  }, [selectedTag, selectedYear]);

  // Clear selectedId and popover when changing filters
  React.useEffect(() => {
    setSelectedId(null);
    setPopoverContent(null);
  }, [selectedTag, selectedYear, setSelectedId]);

  // Popover Component
  const Popover = ({ title, snippet, fullLink, onClose, position }) => {
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
          React.createElement('h2', { className: 'popover-title' }, title),
          React.createElement(
            'button',
            { className: 'popover-close', onClick: () => {
              onClose();
              setSelectedId(null);
            }},
            '×'
          )
        ),
        React.createElement(
          'div',
          { className: 'popover-body' },
          React.createElement('p', null, snippet)
        ),
        React.createElement(
          'div',
          { className: 'popover-footer' },
          React.createElement(
            'a',
            { href: fullLink, className: 'popover-link' },
            'Read Full Post'
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
      position: popoverPosition
    })
  );
};