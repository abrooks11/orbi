// WHEN POPUP.HTML OPENS, RUN CONTENT.JS; INJECT WITH SCRIPTING API EXECUTESCRIPT
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    // INJECT CONTENT.JS
    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    });

    // REQUEST COLOR CODES (FROM BACKGROUND)
    const response = await chrome.runtime.sendMessage({
      action: "getColoCodes",
    });

    const palette = document.querySelector("#color-container");
    let colorCodes = response.data;

    colorCodes.forEach((colorCode) => {
      const orbContainer = document.createElement("div");
      orbContainer.setAttribute("class", "orb-wrapper");

      const orb = document.createElement("div");
      orb.setAttribute("class", "orb");
      orb.style.backgroundColor = colorCode;

      const code = document.createElement("div");
      code.setAttribute("class", "code");
      code.innerText = colorCode;

      // Add click handler for copying
      orbContainer.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(colorCode);
          // Show feedback
          code.textContent = "Copied!";
          setTimeout(() => {
            code.textContent = colorCode;
          }, 1000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      });

      orbContainer.append(orb, code);
      palette.append(orbContainer);
    });
  } catch (error) {
    console.error("Error ", error);
  }
});
