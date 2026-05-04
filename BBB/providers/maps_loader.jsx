// Loads the Google Maps JS API on demand. Returns a promise that resolves once
// google.maps is available. Re-uses the same loader if called multiple times.

(function () {
  let loadPromise = null;
  let loadedKey = null;

  window.loadGoogleMaps = (apiKey) => {
    if (!apiKey) return Promise.reject(new Error('No Google Maps API key configured'));
    if (window.google && window.google.maps && loadedKey === apiKey) {
      return Promise.resolve(window.google.maps);
    }
    if (loadPromise && loadedKey === apiKey) return loadPromise;

    loadedKey = apiKey;
    loadPromise = new Promise((resolve, reject) => {
      const cbName = '__bbbGmapsCb_' + Date.now();
      window[cbName] = () => {
        delete window[cbName];
        resolve(window.google.maps);
      };
      const s = document.createElement('script');
      s.async = true;
      s.defer = true;
      s.src = 'https://maps.googleapis.com/maps/api/js'
        + '?key=' + encodeURIComponent(apiKey)
        + '&libraries=marker'
        + '&loading=async'
        + '&v=weekly'
        + '&callback=' + cbName;
      s.onerror = () => reject(new Error('Failed to load Google Maps JS API'));
      document.head.appendChild(s);
    });
    return loadPromise;
  };
})();
