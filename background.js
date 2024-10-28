chrome.runtime.onInstalled.addListener(() => {
  // console.log("background.js running");
});

// When the user clicks on the extension action
chrome.action.onClicked.addListener((tab) => {
  // console.log("extension icon clicked", tab);
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["content.js"],
    },
    () => {
      // After the content script runs, query for the colors
      chrome.tabs.sendMessage(tab.id, { action: "getColors" });
    }
  );
});
