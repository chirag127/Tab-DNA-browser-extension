// Content script for Tab DNA extension

// Capture the document referrer when the page loads
const referrer = document.referrer;

// Send the referrer to the background script
if (referrer) {
  chrome.runtime.sendMessage({
    action: 'setReferrer',
    tabId: chrome.runtime.id, // This will be replaced with the actual tabId in the background script
    referrer
  });
}

// Listen for link clicks to potentially capture navigation
document.addEventListener('click', (event) => {
  // Check if the click was on a link
  let target = event.target;
  while (target && target.tagName !== 'A') {
    target = target.parentElement;
  }
  
  if (target && target.tagName === 'A' && target.href) {
    // Store the current URL and the target URL in sessionStorage
    // This can be used to reconstruct the navigation path if needed
    try {
      const navigationData = {
        from: window.location.href,
        to: target.href,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('tabDNA_lastClick', JSON.stringify(navigationData));
    } catch (error) {
      console.error('Error storing navigation data:', error);
    }
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageInfo') {
    // Collect information about the current page
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      lastClick: sessionStorage.getItem('tabDNA_lastClick')
    };
    
    sendResponse(pageInfo);
  }
});
