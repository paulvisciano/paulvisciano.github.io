window.GlobeComponent = ({ handleTimelineClick, selectedId, setSelectedId, selectedTag, setSelectedTag, selectedYear, setSelectedYear, setZoomCallback }) => {
  if (typeof window.momentsInTime === 'undefined') {
    return React.createElement('div', null, 'Error: Data not loaded');
  }

  const regularTags = ["All", ...new Set(window.momentsInTime.flatMap(post => post.tags))];
  const yearTags = ["All", ...new Set(window.momentsInTime.map(post => new Date(post.date).getUTCFullYear().toString()))].sort((a, b) => b - a);
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
  const lastTap = React.useRef(0);
  const doubleTapTimeout = React.useRef(null);
  const isDoubleTapSliding = React.useRef(false);

  // Expose state setters and refs to window for BlogPostDrawer
  window.setBlogPostContent = setBlogPostContent;
  window.isLoading = isLoading;
  window.error = error;
  window.blogDrawerRef = blogDrawerRef;

  // Define linear scales for each duration range for smooth gradients
  const scaleShort = d3.scaleLinear()
    .domain([1, 3])
    .range(["#FF4500", "#FF4500"]);
  const scaleWeek = d3.scaleLinear()
    .domain([4, 14])
    .range(["#FF4500", "#A32F00"]);
  const scaleMonth = d3.scaleLinear()
    .domain([15, 90])
    .range(["#A32F00", "#A32F00"]);
  const scaleLong = d3.scaleLinear()
    .domain([91, 365])
    .range(["#A32F00", "#4F1F00"]);

  // Combine scales into a single weightColor function
  const weightColor = (duration) => {
    if (duration <= 3) return scaleShort(duration);
    if (duration <= 14) return scaleWeek(duration);
    if (duration <= 90) return scaleMonth(duration);
    return scaleLong(Math.min(duration, 365));
  };

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
      if (event.target.closest('.overlay') || event.target.closest('.popover') || event.target.closest('.filter-drawer') || event.target.closest('.blog-post-drawer')) {
        return;
      }
      if (event.touches.length === 1) {
        touchStartX.current = event.touches[0].clientX;
        touchStartY.current = event.touches[0].clientY;
        const currentTime = new Date().getTime();
        const timeSinceLastTap = currentTime - lastTap.current;

        // Detect double-tap (within 300ms)
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
          clearTimeout(doubleTapTimeout.current);
          handleDoubleTap(event);
        } else {
          lastTap.current = currentTime;
          // Set a timeout to handle single tap if no second tap occurs
          doubleTapTimeout.current = setTimeout(() => {
            touchStartX.current = null;
            touchStartY.current = null;
          }, 300);
        }
      }
    };

    const handleDoubleTap = (event) => {
      if (!globeInstance.current || isZooming.current) return;

      // Prevent default to avoid browser zoom
      event.preventDefault();

      const currentPOV = globeInstance.current.pointOfView();
      const newAltitude = Math.max(0.1, currentPOV.altitude * 0.7); // Zoom in by 30%

      globeInstance.current.pointOfView({
        lat: currentPOV.lat,
        lng: currentPOV.lng,
        altitude: newAltitude
      }, 500);

      isDoubleTapSliding.current = true; // Enable sliding for zoom adjustment
      setTimeout(() => {
        isDoubleTapSliding.current = false; // Reset after 1s to allow new gestures
      }, 1000);
    };

    const handleTouchMove = (event) => {
      if (event.target.closest('.overlay') || event.target.closest('.popover') || event.target.closest('.filter-drawer') || event.target.closest('.blog-post-drawer')) {
        return;
      }
      if (event.touches.length === 1 && touchStartX.current !== null && touchStartY.current !== null) {
        const touchEndX = event.touches[0].clientX;
        const touchEndY = event.touches[0].clientY;
        const deltaX = touchEndX - touchStartX.current;
        const deltaY = touchEndY - touchStartY.current;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Handle swipe-to-dismiss popover
        if (popoverContent && distance > 50) {
          setPopoverContent(null);
          setSelectedId(null);
          touchStartX.current = null;
          touchStartY.current = null;
          isDoubleTapSliding.current = false;
          return;
        }

        // Handle double-tap slide for zooming
        if (isDoubleTapSliding.current && !isZooming.current) {
          event.preventDefault(); // Prevent scrolling
          const deltaY = touchEndY - touchStartY.current;
          const zoomSensitivity = 0.005; // Adjust zoom speed
          const currentPOV = globeInstance.current.pointOfView();
          let newAltitude = currentPOV.altitude + deltaY * zoomSensitivity;

          // Respect minDistance (140) and maxDistance (500) converted to altitude
          const minAltitude = 140 / 200; // Approx conversion from distance to altitude
          const maxAltitude = 500 / 200;
          newAltitude = Math.max(minAltitude, Math.min(maxAltitude, newAltitude));

          globeInstance.current.pointOfView({
            lat: currentPOV.lat,
            lng: currentPOV.lng,
            altitude: newAltitude
          }, 0); // Immediate update for smooth sliding

          touchStartY.current = touchEndY; // Update start position for continuous sliding
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartX.current = null;
      touchStartY.current = null;
      if (isDoubleTapSliding.current) {
        setTimeout(() => {
          isDoubleTapSliding.current = false; // Ensure reset after gesture
        }, 100);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
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
              lat: post.lat,
              lng: post.lng,
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
    const minAltitude = 0.1;
    const minHexAltitude = 0.02;
    const maxHexAltitude = 0.1;
    const isMobile = window.innerWidth <= 640;

    const zoomLevels = isMobile ? [
      { threshold: 1, hexAltitude: 0.3, hexBinResolution: 3 },
      { threshold: 0.7, hexAltitude: 0.1, hexBinResolution: 3.8 },
      { threshold: 0.3, hexAltitude: maxHexAltitude * 0.6, hexBinResolution: 4.5 },
      { threshold: minAltitude, hexAltitude: minAltitude * 1.5, hexBinResolution: 4 }
    ] : [
      { threshold: 1, hexAltitude: maxHexAltitude, hexBinResolution: 4 },
      { threshold: 0.5, hexAltitude: maxHexAltitude * 0.75, hexBinResolution: 4 },
      { threshold: 0.3, hexAltitude: maxHexAltitude * 0.5, hexBinResolution: 5 },
      { threshold: minAltitude, hexAltitude: minHexAltitude, hexBinResolution: 5 }
    ];

    let hexAltitude = minAltitude;
    let hexBinResolution = isMobile ? 4 : 5;

    for (const level of zoomLevels) {
      if (altitude >= level.threshold) {
        hexAltitude = level.hexAltitude;
        hexBinResolution = level.hexBinResolution;
        break;
      }
    }

    globeInstance.current.hexBinResolution(hexBinResolution);
    globeInstance.current.hexAltitude(hexAltitude);
    globeInstance.current.controls().autoRotate = altitude > 0.8;
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
          side: THREE.DoubleSide,
          shininess: 5,
        }))
        .pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 0)
        .hexBinPointsData([])
        .hexBinPointLat('lat')
        .hexBinPointLng('lng')
        .hexBinPointWeight('weight')
        .hexBinResolution(5)
        .hexTopColor(d => weightColor(d.sumWeight))
        .hexSideColor(d => weightColor(d.sumWeight))
        .hexLabel(d => `${Math.round(d.sumWeight)} days`)
        .onZoom(onZoomHandler)
        .onHexHover((hex) => {
          if (hex && hex.points.length > 0) {
            const post = hex.points[hex.points.length - 1];
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
        globeInstance.current.controls().minDistance = 140;
        globeInstance.current.controls().maxDistance = 500;
      } catch (error) {
      }

      globeInstance.current.onHexClick(hex => {
        try {
          if (!hex || hex.points.length === 0) {
            return;
          }

          if (isZooming.current) {
            return;
          }
          isZooming.current = true;
          globeInstance.current.controls().autoRotate = false;

          const post = hex.points[hex.points.length - 1];
          if (post && post.id) {
            setSelectedId(post.id);
            handleTimelineClick(post);
          }

          globeInstance.current.pointOfView({
            lat: post.lat,
            lng: post.lng,
            altitude: 0.1
          }, 1500);

          waitForZoom(1500).then(() => {
            const finalCoords = globeInstance.current.getScreenCoords(post.lat, post.lng, 0.5);
            setPopoverPosition({
              top: finalCoords.y + 20,
              left: finalCoords.x
            });

            setPopoverContent({
              title: post.title || "No Title",
              snippet: post.snippet || "No Snippet",
              fullLink: post.fullLink || "#",
              lat: post.lat,
              lng: post.lng,
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
      const filteredPosts = window.momentsInTime.filter(post => {
        const tagMatch = selectedTag === "All" || post.tags.includes(selectedTag);
        const yearMatch = !selectedYear || selectedYear === "All" || new Date(post.date).getUTCFullYear().toString() === selectedYear;
        return tagMatch && yearMatch;
      });

      const hexBinData = filteredPosts.map(post => ({
        lat: post.location.lat,
        lng: post.location.lng,
        weight: post.stayDuration,
        label: post.location.name,
        fullLink: post.fullLink,
        snippet: post.snippet,
        title: post.title,
        stayDuration: post.stayDuration,
        id: post.id
      }));

      globeInstance.current.hexBinPointsData(hexBinData);
      onZoomHandler();
    }
  }, [selectedTag, selectedYear]);

  React.useEffect(() => {
    setSelectedId(null);
    setPopoverContent(null);
  }, [selectedTag, selectedYear, setSelectedId]);

  const handleOpenBlogPost = async (postId) => {
    const post = window.momentsInTime.find(p => p.id === postId);

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