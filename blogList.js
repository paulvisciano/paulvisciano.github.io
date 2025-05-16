window.BlogList = ({ handleTimelineClick }) => {
  if (typeof window.blogPosts === 'undefined') {
    console.error("blogPosts is undefined. Ensure blogData.js is loaded before blogList.js");
    return React.createElement('div', null, 'Error: Data not loaded');
  }

  const allTags = ["All", ...new Set(window.blogPosts.flatMap(post => post.tags))];
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [popoverContent, setPopoverContent] = React.useState(null);
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 });
  const globeInstance = React.useRef(null);
  const popoverRef = React.useRef(null);
  const isZooming = React.useRef(false);

  // Utility to wait for zoom animation
  const waitForZoom = (duration) => new Promise(resolve => setTimeout(resolve, duration));

  // Handle clicks outside the popover to dismiss it
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setPopoverContent(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initialize the Globe.GL after the component renders
  React.useEffect(() => {
    try {
      const pointsData = window.blogPosts.map(post => ({
        lat: post.location.lat,
        lng: post.location.lng,
        label: post.location.name,
        fullLink: post.fullLink,
        snippet: post.snippet,
        title: post.title,
        stayDuration: post.stayDuration
      }));

      // Prepare labels data
      const labelsData = window.blogPosts.map(post => ({
        name: post.location.name,
        lat: post.location.lat,
        lng: post.location.lng
      }));

      console.log("Initializing Globe.GL with earth-night.jpg texture and enhanced point markers");

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
        .pointsData(pointsData)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor(() => '#ffa500') // Orange to match timeline dot
        .pointRadius(0.2) // Larger circles
        .pointAltitude(0.01) // Slight elevation
        .pointsMerge(true)
       
        (document.getElementById('globeViz'));

      // Enable controls with adjusted minDistance
      try {
        console.log("Enabling Globe.GL controls");
        globeInstance.current.controls().autoRotate = true;
        globeInstance.current.controls().autoRotateSpeed = 0.5;
        globeInstance.current.controls().enableZoom = true;
        globeInstance.current.controls().minDistance = 120; // Adjusted to allow closer zoom
        globeInstance.current.controls().maxDistance = 500;
      } catch (error) {
        console.error("Error enabling Globe.GL controls:", error);
      }

      // Show popover on marker click
      globeInstance.current.onPointClick(point => {
        try {
          console.log("Point clicked, zooming and showing popover");
          if (isZooming.current) return;
          isZooming.current = true;
          globeInstance.current.controls().autoRotate = false;

          // Zoom out first
          globeInstance.current.pointOfView({
            lat: point.lat,
            lng: point.lng,
            altitude: 1.0
          }, 2000);

          // Then zoom in closer
          waitForZoom(2000).then(() => {
            globeInstance.current.pointOfView({
              lat: point.lat,
              lng: point.lng,
              altitude: 0.1 // Zoom in further
            }, 1500);

            // Show popover after both animations
            waitForZoom(1500).then(() => {
              const finalCoords = globeInstance.current.getScreenCoords(point.lat, point.lng, 0.01);
              setPopoverPosition({
                top: finalCoords.y + 20,
                left: finalCoords.x
              });
              setPopoverContent({
                title: point.title,
                snippet: point.snippet,
                fullLink: point.fullLink,
                lat: point.lat,
                lng: point.lng
              });
              isZooming.current = false;
            });
          });
        } catch (error) {
          console.error("Error handling point click:", error);
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
      console.error('Error initializing Globe.GL:', error);
    }
  }, []);

  // Expose handleTimelineClick to parent component
  window.handleTimelineClick = (post) => {
    if (!globeInstance.current) {
      console.error("Globe instance not initialized");
      return;
    }

    try {
      if (isZooming.current) return;
      isZooming.current = true;
      globeInstance.current.controls().autoRotate = false;
      console.log(`Zooming to ${post.location.name} at lat: ${post.location.lat}, lng: ${post.location.lng}`);

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
          const finalCoords = globeInstance.current.getScreenCoords(post.location.lat, post.location.lng, 0.01);
          setPopoverPosition({
            top: finalCoords.y + 20,
            left: finalCoords.x
          });
          setPopoverContent({
            title: post.title,
            snippet: post.snippet,
            fullLink: post.fullLink,
            lat: post.location.lat,
            lng: post.location.lng
          });
          isZooming.current = false;
        });
      });
    } catch (error) {
      console.error("Error in handleTimelineClick:", error);
      isZooming.current = false;
    }
  };

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
            { className: 'popover-close', onClick: onClose },
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