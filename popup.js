// WHEN POPUP.HTML OPENS, RUN CONTENT.JS; INJECT WITH SCRIPTING API EXECUTESCRIPT
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

      // REQUEST COLOR CODES DIRECTLY FROM BACKGROUND
    const response = await chrome.runtime.sendMessage({
      action: "getColoCodes",
    });
    // console.log("data received from background ", response.data);
    
    // If we don't have any colors yet, only then inject the content script
    if (!response.data || response.data.length === 0) {
      // INJECT CONTENT.JS ONLY IF NEEDED
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      });

       // Wait a moment for content script to process and send data
       await new Promise(resolve => setTimeout(resolve, 300));
      
       // Request the colors again after injection
       response.data = (await chrome.runtime.sendMessage({
         action: "getColoCodes",
       })).data;
     }

      
    const palette = document.querySelector("#color-container");
    // Clear existing color elements to prevent duplicates
    palette.innerHTML = '';
    
    let colorCodes = response.data || [];
    

    if (colorCodes.length === 0) {
      // Handle case when no colors were found
      const noColorsMsg = document.createElement("div");
      noColorsMsg.setAttribute("class", "no-colors-message");
      noColorsMsg.textContent =
        "No colors detected on this page. Try refreshing the page or navigating to a different one.";
      palette.appendChild(noColorsMsg);
      return;
    }

    // Helper function to convert RGB to hex
    const rgbToHex = (rgb) => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return rgb;

      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);

      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };

    // Helper function to determine if a color is dark
    const isDarkColor = (rgb) => {
      const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return false;

      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);

      // Calculate perceived brightness
      // Using the formula from W3C: https://www.w3.org/TR/AERT/#color-contrast
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128; // If less than 128, considered dark
    };
    
 // Create the header with the site title
 const header = document.createElement("div");
 header.setAttribute("class", "header");
 header.textContent = `Colors from ${tabs[0].title}`;
 palette.before(header);

 // Add color count info
 const countInfo = document.createElement("div");
 countInfo.setAttribute("class", "count-info");
 countInfo.textContent = `${colorCodes.length} colors found`;
 header.after(countInfo);

 // Add tab title to palette header
    colorCodes.forEach((colorCode) => {
      const orbContainer = document.createElement("div");
      orbContainer.setAttribute("class", "orb-wrapper");

      const orb = document.createElement("div");
      orb.setAttribute("class", "orb");
      orb.style.backgroundColor = colorCode;

      // const code = document.createElement("div");
      // code.setAttribute("class", "code");
      // code.innerText = colorCode;

  // Create container for color info
  const colorInfo = document.createElement("div");
  colorInfo.setAttribute("class", "color-info");

  // Add RGB value
  const rgbCode = document.createElement("div");
  rgbCode.setAttribute("class", "code rgb");
  rgbCode.innerText = colorCode;

  // Add HEX value
  const hexCode = document.createElement("div");
  hexCode.setAttribute("class", "code hex");
  hexCode.innerText = rgbToHex(colorCode);

  // Add color info to container
  colorInfo.appendChild(rgbCode);
  colorInfo.appendChild(hexCode);

  // Set text color based on background brightness
  if (isDarkColor(colorCode)) {
    orb.classList.add("dark");
    colorInfo.classList.add("dark");
  }


      // Add click handler for copying
      orbContainer.addEventListener("click", async () => {
        try {
          // Copy the hex code by default
          await navigator.clipboard.writeText(hexCode.textContent);
          
          // Show feedback
          const originalText = hexCode.textContent;
          hexCode.textContent = "Copied!";
          hexCode.classList.add("copied");
          
          setTimeout(() => {
            hexCode.textContent = originalText;
            hexCode.classList.remove("copied");
          }, 1000);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
      });


      orbContainer.appendChild(orb);
      orbContainer.appendChild(colorInfo);
      palette.appendChild(orbContainer);

          // Add a footer with info and options
    const footer = document.createElement("div");
    footer.setAttribute("class", "footer");
    
    const modeToggle = document.createElement("button");
    modeToggle.setAttribute("class", "mode-toggle");
    modeToggle.textContent = "Grid View";
    modeToggle.addEventListener("click", () => {
      if (palette.classList.contains("grid-view")) {
        palette.classList.remove("grid-view");
        modeToggle.textContent = "Grid View";
      } else {
        palette.classList.add("grid-view");
        modeToggle.textContent = "List View";
      }
    });
    
    footer.appendChild(modeToggle);
    palette.after(footer);
    });
  } catch (error) {
    console.log("Error ", error);
     // Show error message
     const palette = document.querySelector("#color-container");
     const errorMsg = document.createElement("div");
     errorMsg.setAttribute("class", "error-message");
     errorMsg.textContent = "An error occurred while extracting colors. Try refreshing the page.";
     palette.appendChild(errorMsg);
  }
});
