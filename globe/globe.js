window.GlobeComponent = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, setSelectedTag, setZoomCallback }) => {
  if (typeof window.blogPosts === 'undefined') {
    return React.createElement('div', null, 'Error: Data not loaded');
  }

  const allTags = ["All", ...new Set(window.blogPosts.flatMap(post => post.tags))];
  const [popoverContent, setPopoverContent] = React.useState(null);
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 });
  const globeInstance = React.useRef(null);
  const popoverRef = React.useRef(null);
  const isZooming = React.useRef(false);
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  // Utility to wait for zoom animation
  const waitForZoom = (duration) => new Promise(resolve => setTimeout(resolve, duration));

  // Handle clicks and taps outside the popover to dismiss it
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverContent(null);
        setSelectedId(null); // Clear timeline highlight
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

        // Detect swipe (minimum distance threshold, e.g., 50 pixels)
        if (distance > 50) {
          setPopoverContent(null);
          setSelectedId(null); // Clear timeline highlight
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
  }, [popoverContent, setSelectedId]);

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

        // Zoom out first
        globeInstance.current.pointOfView({
          lat: post.location.lat,
          lng: post.location.lng,
          altitude: 1.0
        }, 2000);

        // Then zoom in closer
        waitForZoom(2000).then(() => {
          globeInstance.current.pointOfView({
            lat: post.location.lat,
            lng: post.location.lng,
            altitude: 0.1 // Zoom in further
          }, 1500);

          // Show popover after both animations
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
              id: post.id // Store post ID for hover comparison
            });
            setSelectedId(post.id); // Highlight timeline item
            isZooming.current = false;
          });
        });
      } catch (error) {
        isZooming.current = false;
      }
    });
  }, [setZoomCallback, setSelectedId]);

  // Define onZoomHandler outside useEffect for reuse
  const onZoomHandler = () => {
    if (!globeInstance.current) return;

    // Adjust point radius and altitude based on camera altitude
    const altitude = globeInstance.current.pointOfView().altitude;
    const maxRadius = 0.2; // Larger when zoomed out for mobile
    const minRadius = 0.5; // Larger when zoomed in for mobile
    const maxPointAltitude = 0.4; // Lower when zoomed out for better tap detection
    const minPointAltitude = 0.02; // Same when zoomed in
    const maxAltitude = 2.5;
    const minAltitude = 0.1;
    const radius = maxRadius - (maxRadius - minRadius) * (altitude - minAltitude) / (maxAltitude - minAltitude);
    let pointAltitude = maxPointAltitude - (maxPointAltitude - minPointAltitude) * (altitude - minAltitude) / (maxAltitude - minAltitude);

    if (altitude < maxAltitude / 2) {
      pointAltitude = 0.02; // Minimum altitude when max zoomed in
    } else if (altitude > (maxAltitude / 2) && altitude < (maxAltitude - 0.1)) {
      pointAltitude = 0.08; // Mid-range
    } else if (altitude >= maxAltitude - 0.1) {
      pointAltitude = 0.4; // Maximum altitude when max zoomed out
    }

    globeInstance.current.pointRadius(d => {
      const duration = d.stayDuration || 1;
      const baseRadius = radius;
      
      // Scale radius: min 0.5x for 1 day, max 2x for 10+ days
      const scale = Math.min(Math.max(duration / 5, 0.1), 2);

      return baseRadius * scale;
    });
    globeInstance.current.pointAltitude(pointAltitude);

    // Toggle rotation based on altitude
    globeInstance.current.controls().autoRotate = altitude > 2.2;
  };

  // Initialize the Globe.GL on mount
  React.useEffect(() => {
    try {
      // Load texture with filtering
      const textureLoader = new THREE.TextureLoader();
      const globeTexture = textureLoader.load('//unpkg.com/three-globe/example/img/earth-night.jpg');
      globeTexture.anisotropy = 4; // Enable anisotropic filtering
      globeTexture.minFilter = THREE.LinearMipmapLinearFilter; // Mipmapping for zoom
      globeTexture.magFilter = THREE.LinearFilter;

      globeInstance.current = Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .globeMaterial(new THREE.MeshPhongMaterial({
          map: globeTexture,
          side: THREE.DoubleSide
        }))
        .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0)
        .pointsData([]) // Initial empty pointsData, updated below
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(() => '#ffa500') // Orange to match timeline dot
        .pointsMerge(false) // Disable merging for better click detection
        .onZoom(onZoomHandler)
        .onPointHover((point) => {
          if (point) {
            const post = window.blogPosts.find(p => 
              p.location.lat === point.lat && p.location.lng === point.lng
            );
            if (post && post.id) {
              // Scroll timeline item into view
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

      // Trigger initial onZoom to set radius and altitude
      onZoomHandler();

      // Enable controls with adjusted minDistance
      try {
        globeInstance.current.controls().autoRotate = true;
        globeInstance.current.controls().autoRotateSpeed = 0.1;
        globeInstance.current.controls().enableZoom = true;
        globeInstance.current.controls().minDistance = 120; // Adjusted to allow closer zoom
        globeInstance.current.controls().maxDistance = 500;
      } catch (error) {
      }

      // Show popover on marker click
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

          // Find the corresponding post in window.blogPosts
          const post = window.blogPosts.find(p => 
            p.location.lat === point.lat && p.location.lng === point.lng
          );

          // Update timeline highlight and scroll into view
          if (post && post.id) {
            setSelectedId(post.id);
            handleTimelineClick(post);
          }

          // Zoom in to the point
          globeInstance.current.pointOfView({
            lat: point.lat,
            lng: point.lng,
            altitude: 0.1 // Zoom in
          }, 1500);

          // Show popover after animation
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
              id: post.id // Store post ID for hover comparison
            });
            isZooming.current = false;
          });
        } catch (error) {
          isZooming.current = false;
        }
      });

      // Prevent scroll-zoom conflict
      const globeContainer = document.getElementById('globeViz');
      const preventScroll = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      globeContainer.addEventListener('wheel', preventScroll, { passive: false });

      // Cleanup
      return () => {
        globeContainer.removeEventListener('wheel', preventScroll);
        if (globeInstance.current) {
          globeInstance.current.destroy();
        }
      };
    } catch (error) {
    }
  }, []); // Empty dependency array to run only on mount

  // Update pointsData and trigger zoom handler when selectedTag changes
  React.useEffect(() => {
    if (globeInstance.current) {
      const filteredPosts = selectedTag === "All" 
        ? window.blogPosts 
        : window.blogPosts.filter(post => post.tags.includes(selectedTag));
      
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
      onZoomHandler(); // Ensure pin altitude is set correctly
    }
  }, [selectedTag]);

  // Clear selectedId and popover when changing tags to avoid highlighting non-filtered posts
  React.useEffect(() => {
    setSelectedId(null);
    setPopoverContent(null); // Clear popover when changing tags
  }, [selectedTag, setSelectedId]);

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
              setSelectedId(null); // Clear timeline highlight when closing via button
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
      null,
      React.createElement(
        'div',
        { className: 'mb-8 flex flex-wrap justify-center' },
        allTags.map(tag =>
          React.createElement(
            'button',
            {
              key: tag,
              onClick: () => setSelectedTag(tag),
              className: `filter-tag ${selectedTag === tag ? 'active' : ''}`
            },
            tag
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
    )
  );
};