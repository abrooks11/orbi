// console.log("background.js running");

// Store colors for each tab
const tabColorMap = new Map();

let colorCodes = null;
// LISTEN FOR DATA FROM CONTENT.JS
// LISTEN FOR REQUESTS FROM POPUP.JS FOR DATA (FROM CONTENT.JS)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendColorCodes" && sender.tab) {
    // Store colors with the tab ID as the key
    tabColorMap.set(sender.tab.id, message.data);
    // console.log(`Data received from content.js for tab ${sender.tab.id}:`, message.data);
  } 
  else if (message.action === "getColoCodes") {
    // Get the active tab ID
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        const tabId = tabs[0].id;
        const colors = tabColorMap.get(tabId) || [];
        // console.log(`Data sent from background to popup.js for tab ${tabId}:`, colors);
        sendResponse({ data: colors });
      } else {
        sendResponse({ data: [] });
      }
    });
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Clean up data when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabColorMap.has(tabId)) {
    tabColorMap.delete(tabId);
    // console.log(`Cleaned up data for closed tab ${tabId}`);
  }
});