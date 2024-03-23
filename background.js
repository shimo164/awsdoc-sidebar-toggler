chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {

    chrome.storage.local.set({
      leftSidebar: 'asis',
      rightSidebar: 'close'
    }, function () {
      console.log('Default values set in local storage');
    });
  }
});

function toggleSidebarsAndScrollToAnchor() {
  // Set this flag to true for debugging, false for production
  const DEBUG = false;
  function log(...args) {
    if (DEBUG) {
      console.log(...args);
    }
  }

  log('toggleSidebarsAndScrollToAnchor function called');

  chrome.storage.local.get(['leftSidebar', 'rightSidebar'], function (settings) {
    log('Settings loaded:', settings);

    // Find the open aside element
    const openAside = document.querySelector('aside[aria-hidden="false"]');
    const closedAside = document.querySelector('aside[aria-hidden="true"]');

    // Toggle right sidebar
    if (openAside && settings.rightSidebar === 'close') {
      log('Closing the right sidebar');
      openAside.querySelector('button[class^="awsui_tools-close"]')?.click();
    } else if (closedAside && settings.rightSidebar === 'open') {
      log('Opening the right sidebar');
      closedAside.querySelector('button[class^="awsui_tools-toggle"]')?.click();
    } else {
      log('Open aside not found or right sidebar setting not found');
    }

    // Toggle left sidebar navigation
    document.querySelectorAll('nav[class^="awsui_toggle"]').forEach((nav) => {
      const ariaHidden = nav.getAttribute('aria-hidden');

      if (ariaHidden === 'false' && settings.leftSidebar === 'open') {
        log('Closing the left sidebar');
        nav.querySelector('button[class^="awsui_navigation-toggle"]')?.click();
      } else if (ariaHidden === 'true' && settings.leftSidebar === 'close') {
        log('Opening the left sidebar');
        const drawerContent = nav.closest('[class^="awsui_drawer-content_"]');
        drawerContent?.querySelector('button[class^="awsui_navigation-close"]')?.click();
      }
    });

    // Scroll to the anchor if present in the URL
    const anchorId = window.location.hash.substring(1);
    if (anchorId) {
      log('Anchor found in URL:', anchorId);
      const anchorElement = document.getElementById(anchorId);
      if (anchorElement) {
        log('Anchor element found:', anchorElement);
        setTimeout(() => {
          anchorElement.scrollIntoView({ behavior: 'auto' });
        }, 100);
      } else {
        log('Anchor element not found for ID:', anchorId);
      }
    } else {
      log('No anchor found in URL');
    }
  });

}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url.includes('https://docs.aws.amazon.com/') && tab.active) {

    // Set this flag to true for debugging, false for production
    const DEBUG = false;
    function log(...args) {
      if (DEBUG) {
        console.log(...args);
      }
    }

    let attempts = 0;
    const maxAttempts = 5;

    const tryToggleSidebarsAndScrollToAnchor = () => {
      log('Attempting to close aside and scroll to anchor, attempt:', attempts + 1);

      // Execute the toggleSidebarsAndScrollToAnchor function in the tab's context
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: toggleSidebarsAndScrollToAnchor
      }, (results) => {
        attempts++;

        // Check if scroll was successful
        if (results && results[0]) {
          log('Scroll successful, stopping further attempts');
        } else if (attempts < maxAttempts) {
          // Retry after a delay if maximum attempts not reached
          setTimeout(() => {
            tryToggleSidebarsAndScrollToAnchor();
          }, 1000);
        } else {
          log('Max attempts reached');
        }
      });
    };

    // Start the first attempt immediately
    tryToggleSidebarsAndScrollToAnchor();
  }
});
