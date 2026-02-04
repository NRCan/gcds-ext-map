// Scrolls smoothly to the element specified in a URL hash after the page has fully loaded.
// The delay allows time for the layout and content to finish loading before scrolling.
window.addEventListener('load', function () {
  const hash = window.location.hash; // Get the hash from the URL

  if (hash) {
    // Ensure the element exists for the given hash
    const target = document.querySelector(hash);

    if (target) {
      // Wait a bit for layout shifts or content loading before scrolling
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      console.warn('Element not found for hash:', hash);
    }
  }
});

// Preserve scroll position when navigating between component documentation tabs
// to prevent annoying scroll-to-top behavior
(function() {
  const SCROLL_STORAGE_KEY = 'componentTabScrollPosition';
  
  // Restore scroll position on page load if returning from a tab click
  window.addEventListener('load', function() {
    const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll, 10));
        sessionStorage.removeItem(SCROLL_STORAGE_KEY);
      }, 100);
    }
  });
  
  // Save scroll position when clicking component tabs
  document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('.tabs a');
    tabLinks.forEach(link => {
      link.addEventListener('click', function() {
        sessionStorage.setItem(SCROLL_STORAGE_KEY, window.scrollY);
      });
    });
  });
})();
