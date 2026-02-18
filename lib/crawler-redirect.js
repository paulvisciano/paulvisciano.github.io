/**
 * Redirects human visitors to the SPA while letting crawlers (WhatsApp, Facebook, etc.)
 * stay on the page so they can read og:image and other meta tags for link previews.
 */
(function () {
  const isCrawler = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|Slurp|Googlebot|bingbot/i.test(
    navigator.userAgent
  );
  if (!isCrawler) {
    const redirectUrl = `/?path=${window.location.pathname}${window.location.hash}`;
    window.location.replace(redirectUrl);
  }
})();
