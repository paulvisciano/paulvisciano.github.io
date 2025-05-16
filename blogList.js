window.BlogList = ({ handleTimelineClick }) => {
  if (typeof window.blogPosts === 'undefined') {
    console.error("blogPosts is undefined. Ensure blogData.js is loaded before blogList.js");
    return React.createElement('div', null, 'Error: Data not loaded');
  }

  const allTags = ["All", ...new Set(window.blogPosts.flatMap(post => post.tags))];
  const [selectedTag, setSelectedTag] = React.useState("All");
  const [popoverContent, setPopoverContent] = React.useState(null); // State for popover content
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 }); // State for popover position
  let globeInstance = null;

  // Initialize the Globe.GL after the component renders
  React.useEffect(() => {
    try {
      const pointsData = window.blogPosts.map(post => ({
        lat: post.location.lat,
        lng: post.location.lng,
        label: post.location.name, // City name for label
        fullLink: post.fullLink, // Include the link for navigation
        snippet: post.snippet, // Include the snippet for the popover
        title: post.title, // Include the blog title for the popover
        stayDuration: post.stayDuration // Include stayDuration for circle size
      }));

      console.log("Initializing Globe.GL to match world-cities example with semi-transparent globe and topographic texture");

      globeInstance = Globe()
        .backgroundColor('rgba(0, 0, 0, 1)') // Black background for starfield
        .globeMaterial(new THREE.MeshPhongMaterial({ 
          color: '#1a2526', 
          shininess: 0, 
          transparent: true, 
          opacity: 0.8, // Semi-transparent globe
          side: THREE.DoubleSide // Render both sides of the globe
        }))
        .bumpImageUrl('https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png') // Topographic texture for mountains
        .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0) // Initial view similar to example
        .pointsData(pointsData)
        .pointLat('lat')
        .pointLng('lng')
        .pointRadius(d => Math.min(0.3 + d.stayDuration * 0.05, 0.8)) // Scale radius based on stayDuration, max 0.8
        .pointColor(() => '#00D4FF') // Cyan color from world-cities example
        .labelText('label')
        .labelSize(d => d.hovered ? 1.5 : (window.innerWidth < 640 ? 0.8 : 1.2)) // Larger label on hover
        .labelDotRadius(0.5)
        .labelColor(() => '#ffffff') // White labels
        .labelAltitude(0.02) // Position labels directly below circles
        .labelsTransitionDuration(500) // Smooth label transitions
        .pointsMerge(true) // Optimize rendering
        .pointAltitude(0.01) // Flat circles on surface
        .pointLabel("label") // Bind label to point
        .customThreeObject(d => {
          console.log("Creating city marker with CircleGeometry");
          const radius = Math.min(0.3 + d.stayDuration * 0.05, 0.8); // Match pointRadius logic
          const geometry = new THREE.CircleGeometry(radius, 32); // Flat circle geometry
          const material = new THREE.MeshBasicMaterial({ color: '#00D4FF', transparent: true, opacity: 0.8 });
          return new THREE.Mesh(geometry, material);
        })
        .customThreeObjectUpdate((obj, d) => {
          Object.assign(obj.position, globeInstance.getCoords(d.lat, d.lng, 0.01));
        })
        (document.getElementById('globeViz'));

      // Add lighting to enhance topographic texture visibility
      try {
        console.log("Adding lighting to enhance topographic texture");
        const scene = globeInstance.scene();
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 1); // Soft white light
        scene.add(ambientLight);
        // Directional light to highlight topography
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
      } catch (error) {
        console.error("Error adding lighting:", error);
      }

      // Add starfield to the scene background
      try {
        console.log("Adding starfield to scene background");
        const starCount = 5000;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
          const r = 200; // Distance from globe center
          const theta = Math.random() * 2 * Math.PI;
          const phi = Math.acos(2 * Math.random() - 1);
          starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          starPositions[i * 3 + 2] = r * Math.cos(phi);
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1, transparent: true, opacity: 0.7 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        globeInstance.scene().background = null; // Clear default background
        globeInstance.scene().add(stars); // Add stars to the scene
      } catch (error) {
        console.error("Error adding starfield:", error);
      }

      // Enable controls for rotation, zoom, and pan
      try {
        console.log("Enabling Globe.GL controls");
        globeInstance.controls().autoRotate = true;
        globeInstance.controls().autoRotateSpeed = 0.5;
        globeInstance.controls().enableZoom = true;
        globeInstance.controls().minDistance = 100; // Allow closer zoom
        globeInstance.controls().maxDistance = 500; // Wider zoom range
      } catch (error) {
        console.error("Error enabling Globe.GL controls:", error);
      }

      // Show popover with snippet on marker click
      globeInstance.onPointClick(point => {
        try {
          console.log("Point clicked, zooming and showing popover");
          globeInstance.controls().autoRotate = false; // Stop auto-rotation
          globeInstance.pointOfView({
            lat: point.lat,
            lng: point.lng,
            altitude: 0.1 // Zoom in to city level
          }, 1000); // Smooth transition over 1000ms

          // Delay showing the popover until after the zoom completes
          setTimeout(() => {
            const finalCoords = globeInstance.getScreenCoords(point.lat, point.lng, 0.01);
            setPopoverPosition({
              top: finalCoords.y + 20, // Position below the circle
              left: finalCoords.x
            });

            // Show popover with the snippet
            setPopoverContent({
              title: point.title,
              snippet: point.snippet,
              fullLink: point.fullLink,
              lat: point.lat, // Store lat/lng for repositioning
              lng: point.lng
            });
          }, 1000); // Match zoom animation duration
        } catch (error) {
          console.error("Error handling point click:", error);
        }
      });

      // Emphasize city name on hover
      globeInstance.onPointHover(point => {
        try {
          pointsData.forEach(p => {
            if (point && p.label === point.label) {
              p.hovered = true; // Mark as hovered to increase label size
            } else {
              p.hovered = false; // Reset hover state
              p.label = p.label.split('\n')[0]; // Reset to city name only
            }
          });
          globeInstance.pointsData(pointsData);
        } catch (error) {
          console.error("Error handling point hover:", error);
        }
      });

      // Prevent scroll-zoom conflict
      const globeContainer = document.getElementById('globeViz');
      const preventScroll = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      globeContainer.addEventListener('wheel', preventScroll, { passive: false });

      // Cleanup globe and event listeners on component unmount
      return () => {
        globeContainer.removeEventListener('wheel', preventScroll);
        if (globeInstance) {
          globeInstance.destroy();
        }
      };
    } catch (error) {
      console.error('Error initializing Globe.GL:', error);
    }
  }, []);

  // Expose handleTimelineClick to parent component
  window.handleTimelineClick = (post) => {
    if (globeInstance) {
      // Stop auto-rotation
      globeInstance.controls().autoRotate = false;

      // Debug coordinates
      console.log(`Zooming to ${post.location.name} at lat: ${post.location.lat}, lng: ${post.location.lng}`);

      // Zoom to city level
      globeInstance.pointOfView({
        lat: post.location.lat,
        lng: post.location.lng,
        altitude: 0.1 // Zoom in to city level
      }, 1000);

      // Delay showing the popover until after the zoom completes
      setTimeout(() => {
        const finalCoords = globeInstance.getScreenCoords(post.location.lat, post.location.lng, 0.01);
        setPopoverPosition({
          top: finalCoords.y + 20, // Position below the circle
          left: finalCoords.x
        });

        // Show popover with the snippet
        setPopoverContent({
          title: post.title,
          snippet: post.snippet,
          fullLink: post.fullLink,
          lat: post.location.lat, // Store lat/lng for repositioning
          lng: post.location.lng
        });
      }, 1000); // Match zoom animation duration
    }
  };

  // Popover Component
  const Popover = ({ title, snippet, fullLink, onClose, position }) => {
    return React.createElement(
      'div',
      {
        className: 'popover',
        style: {
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: 'translateX(-50%)', // Center the popover horizontally
          animation: 'fadeIn 0.3s ease-in-out' // Add fade-in animation
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
    // Tags at Bottom, in Foreground
    React.createElement(
      'div',
      null,
      // Tag Filter Bar (Container Removed)
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
      // Render Popover if popoverContent exists
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