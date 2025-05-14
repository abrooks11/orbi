let colorCodes = null;
// LISTEN FOR DATA FROM CONTENT.JS
// LISTEN FOR REQUESTS FROM POPUP.JS FOR DATA (FROM CONTENT.JS)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendColorCodes") {
    colorCodes = message.data;
  } else if (message.action === "getColoCodes") {
    sendResponse({
      data: colorCodes,
    });
  }
});
