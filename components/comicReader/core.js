// ============================================================================
// Comic Reader Core Logic
// ============================================================================
// Shared business logic used by all device-specific readers

// Global state manager to prevent flipbook state from being wiped
window.ComicReaderState = window.ComicReaderState || {
  flipbookCreated: false,
  episodeData: null,
  currentPage: 1,
  totalPages: 0,
  flipbookReady: false,
  isVisible: false,
  isLoading: true
};

// Function to update global state
const updateGlobalState = (updates) => {
  Object.assign(window.ComicReaderState, updates);
};

// Function to get global state
const getGlobalState = () => window.ComicReaderState;

/**
 * Generate pages dynamically based on available files
 */
const getPages = (episodeData) => {
  if (!episodeData) {
    return [];
  }
  
  // Extract base path from fullLink
  const basePath = episodeData.fullLink.replace(/\/$/, '');
  const pagesArray = []; // Don't include cover - it's handled separately
  
  // For new episodes, we'll need to add a pageCount property to the episode data
  // For now, use a reasonable default and let the browser handle 404s gracefully
  const maxPages = episodeData.pageCount || 50; // Default to 50, can be overridden per episode
  
  for (let i = 1; i <= maxPages; i++) {
    pagesArray.push(`${basePath}/page-${i.toString().padStart(2, '0')}.png`);
  }
  
  return pagesArray;
};

/**
 * Find the next episode in the series
 */
const getNextEpisode = (episodeData) => {
  if (!episodeData || !window.momentsInTime) {
    return null;
  }

  const currentEpisodeId = episodeData.id;
  const currentDate = episodeData.date;
  
  // Find episodes that are comics and come after the current episode
  const futureComics = window.momentsInTime
    .filter(moment => 
      moment.isComic && 
      moment.date > currentDate &&
      moment.id !== currentEpisodeId
    )
    .sort((a, b) => a.date - b.date);

  // Return the next comic episode, if any
  return futureComics.length > 0 ? futureComics[0] : null;
};

/**
 * Find the previous episode in the series
 */
const getPreviousEpisode = (episodeData) => {
  if (!episodeData || !window.momentsInTime) {
    return null;
  }

  const currentEpisodeId = episodeData.id;
  const currentDate = episodeData.date;
  
  // Find episodes that are comics and come before the current episode
  const pastComics = window.momentsInTime
    .filter(moment => 
      moment.isComic && 
      moment.date < currentDate &&
      moment.id !== currentEpisodeId
    )
    .sort((a, b) => b.date - a.date); // Sort descending to get most recent first

  // Return the previous comic episode, if any
  return pastComics.length > 0 ? pastComics[0] : null;
};

/**
 * Find current episode from URL path
 */
const findCurrentEpisode = () => {
  if (!window.momentsInTime) {
    return null;
  }
  
  const currentPath = window.location.pathname;
  
  const currentMoment = window.momentsInTime.find(m => {
    if (!m.isComic) return false;
    const episodePath = m.fullLink.replace(/\/$/, ''); // Remove trailing slash
    return currentPath.includes(episodePath);
  });
  
  if (currentMoment) {
    return currentMoment;
  }
  
  // Fallback episode data for Bangkok Episode 20
  return {
    id: 'urban-runner-episode-20-2025-09-16',
    title: 'Urban Runner Episode 20: Comic Book Edition',
    fullLink: '/moments/bangkok/2025-09-16/',
    location: { name: 'Bangkok, Thailand' },
    date: new Date('2025-09-16T00:00:00Z')
  };
};

/**
 * Calculate page increment/decrement based on device type
 * Mobile: 1 page at a time
 * Tablet/Desktop: 2 pages at a time (2-page spreads)
 */
const getPageIncrement = (deviceType) => {
  return deviceType === 'mobile' ? 1 : 2;
};

/**
 * Export core utilities
 */
window.ComicReaderCore = {
  updateGlobalState,
  getGlobalState,
  getPages,
  getNextEpisode,
  getPreviousEpisode,
  findCurrentEpisode,
  getPageIncrement
};

