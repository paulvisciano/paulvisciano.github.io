// Urban Runner Episode Navigation Component
// Provides breadcrumb navigation between all Urban Runner episodes

window.EpisodeNavigation = {
  episodes: [
    {
      id: 'urban-runner-episode-4-2025-08-31',
      title: 'Episode 4: Bangkok Hustle',
      date: '2025-08-31',
      link: '2025/08-31-episode4-bangkok-hustle.html',
      description: 'The Bangkok Hustle scam becomes Urban Runner\'s first major side quest'
    },
    {
      id: 'urban-runner-episode-5-2025-09-01', 
      title: 'Episode 5: Bangkok Hustle II',
      date: '2025-09-01',
      link: '/moments/bangkok/2025-09-01/',
      description: 'Meta gaming and QR code validation in the Urban Runner universe'
    },
    {
      id: 'urban-runner-episode-6-2025-09-02',
      title: 'Episode 6: Amsterdam Café Cutscene', 
      date: '2025-09-02',
      link: '/moments/bangkok/2025-09-02/',
      description: 'Sewer City Hustle and late-night Bangkok adventures'
    },
    {
      id: 'urban-runner-episode-7-2025-09-03',
      title: 'Episode 7: Pura Vida',
      date: '2025-09-03', 
      link: '/moments/bangkok/2025-09-03/',
      description: 'K-FIT power-ups, volleyball victories, and holistic recovery'
    },
    {
      id: 'urban-runner-episode-13-2025-09-09',
      title: 'Episode 13: Bangkok Green Lung & City Cross',
      date: '2025-09-09', 
      link: '2025/09-09-episode13-bangkok-green-lung.html',
      description: 'Interactive Tinder-style card journey through Bangkok\'s Green Lung'
    },
    {
      id: 'urban-runner-episode-15-2025-09-11',
      title: 'Episode 15: Dinner Date',
      date: '2025-09-11', 
      link: '2025/09-11-episode15-dinner-date.html',
      description: 'A day of balance between coding grind and human connection'
    }
  ],

  // Generate breadcrumb navigation HTML
  generateBreadcrumb: function(currentEpisodeId) {
    const currentIndex = this.episodes.findIndex(ep => ep.id === currentEpisodeId);
    if (currentIndex === -1) return '';

    let breadcrumb = `
      <div style="margin: 1rem 0; padding: 1rem; background: rgba(26, 26, 26, 0.4); border-radius: 8px; border: 1px solid rgba(255, 165, 0, 0.1);">
        <h3 style="color: var(--primary-orange); margin: 0 0 0.75rem 0; text-align: center; font-size: 1.1rem;">🏃‍♂️ Urban Runner Episodes</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; align-items: center;">
    `;

    this.episodes.forEach((episode, index) => {
      const isCurrent = episode.id === currentEpisodeId;
      const isCompleted = index < currentIndex;
      const isUpcoming = index > currentIndex;
      
      let statusIcon = '';
      let statusClass = '';
      
      if (isCurrent) {
        statusIcon = '📍';
        statusClass = 'current-episode';
      } else if (isCompleted) {
        statusIcon = '✅';
        statusClass = 'completed-episode';
      } else {
        statusIcon = '⏳';
        statusClass = 'upcoming-episode';
      }

      const episodeNumber = episode.title.match(/Episode (\d+)/)[1];
      
      breadcrumb += `
        <div style="
          display: flex; 
          align-items: center; 
          gap: 0.3rem; 
          padding: 0.4rem 0.8rem; 
          border-radius: 6px; 
          background: ${isCurrent ? 'var(--primary-orange)' : 'rgba(255, 255, 255, 0.05)'};
          color: ${isCurrent ? '#000' : 'var(--text-color)'};
          border: 1px solid ${isCurrent ? 'var(--primary-orange)' : 'rgba(255, 165, 0, 0.2)'};
          font-size: 0.85rem;
          font-weight: ${isCurrent ? 'bold' : 'normal'};
          opacity: ${isUpcoming ? '0.6' : '1'};
          cursor: pointer;
          transition: all 0.3s ease;
        " 
        onclick="window.smoothEpisodeTransition('${episode.id}')"
        onmouseover="this.style.background='rgba(255, 165, 0, 0.2)'; this.style.transform='translateY(-1px)'"
        onmouseout="this.style.background='${isCurrent ? 'var(--primary-orange)' : 'rgba(255, 255, 255, 0.05)'}'; this.style.transform='translateY(0)'">
          <span style="font-size: 0.9rem;">${statusIcon}</span>
          <span>Ep ${episodeNumber}</span>
        </div>
      `;
    });

    breadcrumb += `
        </div>
        <div style="text-align: center; margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.7;">
          ${this.episodes[currentIndex].description}
        </div>
      </div>
    `;

    return breadcrumb;
  },

  // Generate episode navigation (previous/next) using smooth transitions
  generateEpisodeNav: function(currentEpisodeId) {
    const currentIndex = this.episodes.findIndex(ep => ep.id === currentEpisodeId);
    if (currentIndex === -1) return '';

    const prevEpisode = currentIndex > 0 ? this.episodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < this.episodes.length - 1 ? this.episodes[currentIndex + 1] : null;

    let nav = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 1rem 0; gap: 0.5rem;">
    `;

    // Previous episode
    if (prevEpisode) {
      nav += `
        <div style="flex: 1; text-align: left;">
          <a href="javascript:void(0)" onclick="window.smoothEpisodeTransition('${prevEpisode.id}')" style="
            display: inline-flex; 
            align-items: center; 
            gap: 0.4rem; 
            padding: 0.5rem 1rem; 
            background: rgba(26, 26, 26, 0.3); 
            color: var(--text-color); 
            text-decoration: none; 
            border-radius: 6px; 
            border: 1px solid rgba(255, 165, 0, 0.2);
            transition: all 0.3s ease;
            font-size: 0.85rem;
            cursor: pointer;
          " 
          onmouseover="this.style.background='rgba(255, 165, 0, 0.1)'; this.style.transform='translateX(-1px)'"
          onmouseout="this.style.background='rgba(26, 26, 26, 0.3)'; this.style.transform='translateX(0)'">
            <span>←</span>
            <div>
              <div style="font-weight: bold; color: var(--primary-orange); font-size: 0.85rem;">${prevEpisode.title}</div>
              <div style="font-size: 0.75rem; opacity: 0.7;">${prevEpisode.date}</div>
            </div>
          </a>
        </div>
      `;
    } else {
      nav += `<div style="flex: 1;"></div>`;
    }

    // Next episode
    if (nextEpisode) {
      nav += `
        <div style="flex: 1; text-align: right;">
          <a href="javascript:void(0)" onclick="window.smoothEpisodeTransition('${nextEpisode.id}')" style="
            display: inline-flex; 
            align-items: center; 
            gap: 0.4rem; 
            padding: 0.5rem 1rem; 
            background: rgba(26, 26, 26, 0.3); 
            color: var(--text-color); 
            text-decoration: none; 
            border-radius: 6px; 
            border: 1px solid rgba(255, 165, 0, 0.2);
            transition: all 0.3s ease;
            font-size: 0.85rem;
            cursor: pointer;
          " 
          onmouseover="this.style.background='rgba(255, 165, 0, 0.1)'; this.style.transform='translateX(1px)'"
          onmouseout="this.style.background='rgba(26, 26, 26, 0.3)'; this.style.transform='translateX(0)'">
            <div style="text-align: right;">
              <div style="font-weight: bold; color: var(--primary-orange); font-size: 0.85rem;">${nextEpisode.title}</div>
              <div style="font-size: 0.75rem; opacity: 0.7;">${nextEpisode.date}</div>
            </div>
            <span>→</span>
          </a>
        </div>
      `;
    } else {
      nav += `<div style="flex: 1;"></div>`;
    }

    nav += `</div>`;

    return nav;
  }
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    // Navigation will be manually inserted into episodes
  });
} else {
  // DOM already loaded
}
