console.log("background.js running");

let colorCodes = null;
// LISTEN FOR DATA FROM CONTENT.JS
// LISTEN FOR REQUESTS FROM POPUP.JS FOR DATA (FROM CONTENT.JS)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "sendColorCodes") {
    colorCodes = message.data;
    console.log("data recieved from content.js ", colorCodes);
  } else if (message.action === "getColoCodes") {
    console.log("data sent from background to popup.js:", colorCodes);
    sendResponse({
      data: colorCodes,
    });
  }
});
// When the user clicks on the extension action
// chrome.action.onClicked.addListener((tab) => {
//   console.log("extension icon clicked", tab);
//   console.log("injecting content.js . . . ");
//   chrome.scripting.executeScript(
//     {
//       target: { tabId: tab.id },
//       files: ["content.js"],
//     }
// ,
// () => {
//   // After the content script runs, query for the colors
//   chrome.tabs.sendMessage(tab.id, { action: "getColors" });
// }
//   );
// });
