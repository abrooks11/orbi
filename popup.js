// WHEN POPUP.HTML OPENS, INJECT AND RUN CONTENT SCRIPT PROGRAMMATICALLY
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];

    // First inject style.css
    await chrome.scripting.insertCSS({
      target: { tabId: activeTab.id },
      files: ["style.css"]
    });

    // Then execute the content script function
    const results = await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: extractColorsFromPage,
    });

    // Get colors from the result
    const colorCodes = results[0].result;
    
    // Display colors in popup
    const palette = document.querySelector("#color-container");

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
    console.log("Error ", error);
    // Display error in the popup
    document.querySelector("#color-container").innerHTML = 
      `<p>Error extracting colors: ${error.message}</p>`;
  }
});

// This function will be injected into the page and executed there
function extractColorsFromPage() {
  /**
   * Converts RGB color to HSL color space
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {number[]} - [hue, saturation, lightness]
   */
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic (gray)
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  /**
   * Extracts RGB values from a color string
   * @param {string} color - RGB/RGBA color string
   * @returns {number[]} - [red, green, blue]
   */
  const extractRgbValues = (color) => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : [0, 0, 0];
  };

  /**
   * Normalizes a color value to RGB format
   * @param {string} color - The color value to normalize
   * @returns {string|null} - Normalized RGB color or null if invalid/transparent
   */
  const normalizeColor = (color) => {
    // Create temporary DOM element for color parsing
    const tempDiv = document.createElement("div");
    tempDiv.style.color = color;
    document.body.appendChild(tempDiv);
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);

    // Extract RGB/RGBA components using regex
    const rgbMatch = computedColor.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/
    );
    if (!rgbMatch) return computedColor;

    // Destructure RGB values from regex match
    const [_, red, green, blue, alpha] = rgbMatch;

    // Skip colors with very low opacity (almost transparent)
    if (alpha && parseFloat(alpha) < 0.1) return null;

    // Return color in standardized RGB format
    return `rgb(${red}, ${green}, ${blue})`;
  };

  /**
   * Validates if a color value should be included in the palette
   * @param {string} color - The color value to validate
   * @returns {boolean} - Whether the color is valid
   */
  const isValidColor = (color) => {
    return (
      color &&
      color !== "rgba(0, 0, 0, 0)" &&
      color !== "transparent" &&
      color !== "none" &&
      color !== ""
    );
  };

  /**
   * Sorts colors by hue (ROY G BIV order)
   * @param {string[]} colors - Array of RGB color strings
   * @returns {string[]} - Sorted array of colors
   */
  const sortColorsByHue = (colors) => {
    return colors.sort((a, b) => {
      const [rA, gA, bA] = extractRgbValues(a);
      const [rB, gB, bB] = extractRgbValues(b);

      const [hueA] = rgbToHsl(rA, gA, bA);
      const [hueB] = rgbToHsl(rB, gB, bB);

      return hueB - hueA; // Reverse order to get ROY G BIV (red first)
    });
  };

  /**
   * Extracts unique colors from specified HTML elements
   * @returns {string[]} - Array of unique, normalized color values
   */
  const getElementColors = () => {
    // Define HTML elements to extract colors from
    const targetTags = [
      "body",
      "button",
      "div",
      "footer",
      "header",
      "nav",
      "ul",
      "li",
      "p",
      "table",
      "tbody",
      "tr",
      "td",
    ];

    // Initialize Map for O(1) duplicate prevention
    const uniqueColors = new Map();

    // Scan all DOM elements for colors
    document.querySelectorAll("*").forEach((element) => {
      const tagName = element.tagName.toLowerCase();

      // Only process specified HTML tags
      if (targetTags.includes(tagName)) {
        const computedStyle = window.getComputedStyle(element, "");
        const backgroundColor =
          computedStyle.getPropertyValue("background-color");
        const borderColor = computedStyle.getPropertyValue("border-top-color");

        // Process and store background color if valid
        if (isValidColor(backgroundColor)) {
          const normalizedBgColor = normalizeColor(backgroundColor);
          if (normalizedBgColor) {
            uniqueColors.set(normalizedBgColor, normalizedBgColor);
          }
        }

        // Process and store border color if valid
        if (isValidColor(borderColor)) {
          const normalizedBorderColor = normalizeColor(borderColor);
          if (normalizedBorderColor) {
            uniqueColors.set(normalizedBorderColor, normalizedBorderColor);
          }
        }
      }
    });

    // Convert Map to array and sort by hue (ROY G BIV order)
    return sortColorsByHue(Array.from(uniqueColors.values()));
  };

  // Extract colors and return them
  return getElementColors();
}