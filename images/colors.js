console.log("colors.js running");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  console.log("colors.js running");
  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => {
        return Array.from(document.querySelectorAll("*"))
          .map((el) => window.getComputedStyle(el).backgroundColor)
          .filter((c) => c !== "rgba(0, 0, 0, 0)");
      },
    },
    (results) => {
      console.log(results);

      if (results && results[0]) {
        const colors = results[0].result; // Get the colors from the tab
        const colorsContainer = document.querySelector("#palette");

        // Create color boxes in the popup
        colors.forEach((color) => {
          const colorDiv = document.createElement("div");
          colorDiv.classList.add("colorOrb");
          colorDiv.style.backgroundColor = color;
          colorsContainer.appendChild(colorDiv);
        });
      }
    }
  );
});
