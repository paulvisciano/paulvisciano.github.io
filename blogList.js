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

      console.log("Initializing Globe.GL to match world-cities example with semi-transparent globe and topographic texture");

      globeInstance.current = Globe()
        .backgroundColor('rgba(0, 0, 0, 1)')
        .globeMaterial(new THREE.MeshPhongMaterial({ 
          color: '#1a2526', 
          shininess: 0, 
          transparent: true, 
          opacity: 0.8,
          side: THREE.DoubleSide
        }))
        .bumpImageUrl('https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png')
        .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0)
        .pointsData(pointsData)
        .pointLat('lat')
        .pointLng('lng')
        .pointRadius(d => Math.min(0.3 + d.stayDuration * 0.05, 0.8))
        .pointColor(() => '#00D4FF')
        .labelText('label')
        .labelSize(d => d.hovered ? 1.5 : (window.innerWidth < 640 ? 0.8 : 1.2))
        .labelDotRadius(0.5)
        .labelColor(() => '#ffffff')
        .labelAltitude(0.02)
        .labelsTransitionDuration(500)
        .pointsMerge(true)
        .pointAltitude(0.01)
        .pointLabel("label")
        .customThreeObject(d => {
          console.log("Creating city marker with CircleGeometry");
          const radius = Math.min(0.3 + d.stayDuration * 0.05, 0.8);
          const geometry = new THREE.CircleGeometry(radius, 32);
          const material = new THREE.MeshBasicMaterial({ color: '#00D4FF', transparent: true, opacity: 0.8 });
          return new THREE.Mesh(geometry, material);
        })
        .customThreeObjectUpdate((obj, d) => {
          Object.assign(obj.position, globeInstance.current.getCoords(d.lat, d.lng, 0.01));
        })
        (document.getElementById('globeViz'));

      // Add lighting
      try {
        console.log("Adding lighting to enhance topographic texture");
        const scene = globeInstance.current.scene();
        const ambientLight = new THREE.AmbientLight(0x404040, 1);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(5, 3, 5);
        scene.add(directionalLight);
      } catch (error) {
        console.error("Error adding lighting:", error);
      }

      // Add starfield
      try {
        console.log("Adding starfield to scene background");
        const starCount = 5000;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
          const r = 200;
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
        globeInstance.current.scene().background = null;
        globeInstance.current.scene().add(stars);
      } catch (error) {
        console.error("Error adding starfield:", error);
      }

      // Enable controls
      try {
        console.log("Enabling Globe.GL controls");
        globeInstance.current.controls().autoRotate = true;
        globeInstance.current.controls().autoRotateSpeed = 0.5;
        globeInstance.current.controls().enableZoom = true;
        globeInstance.current.controls().minDistance = 100;
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
          globeInstance.current.pointOfView({
            lat: point.lat,
            lng: point.lng,
            altitude: 0.1
          }, 1000);

          waitForZoom(1000).then(() => {
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
        } catch (error) {
          console.error("Error handling point click:", error);
          isZooming.current = false;
        }
      });

      // Emphasize city name on hover
      globeInstance.current.onPointHover(point => {
        try {
          pointsData.forEach(p => {
            if (point && p.label === point.label) {
              p.hovered = true;
            } else {
              p.hovered = false;
              p.label = p.label.split('\n')[0];
            }
          });
          globeInstance.current.pointsData(pointsData);
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
      globeInstance.current.pointOfView({
        lat: post.location.lat,
        lng: post.location.lng,
        altitude: 0.1
      }, 1000);

      setPopoverContent(null);
      waitForZoom(1000).then(() => {
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