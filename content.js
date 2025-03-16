// Initialize content script
// console.log("content.js running");
/**
 * Normalizes a color value to RGB format by:
 * 1. Using browser's color parser via a temporary DOM element
 * 2. Extracting RGB values using regex
 * 3. Removing opacity to prevent duplicates
 * 4. Converting to standardized RGB format
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
 * Validates if a color value should be included in the palette by:
 * 1. Checking if color value exists
 * 2. Filtering out transparent/invalid values
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
 * Extracts unique colors from specified HTML elements by:
 * 1. Scanning specific HTML tags
 * 2. Getting computed background and border colors
 * 3. Normalizing and deduplicating colors
 * 4. Returning sorted array of unique colors
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

  // Convert Map to sorted array for consistent display
  return Array.from(uniqueColors.values()).sort();
};

// Extract colors from current page
const colorCodes = getElementColors();
// console.log("Colors extracted from page:", colorCodes);

// Send extracted colors to background script
chrome.runtime.sendMessage({
  action: "sendColorCodes",
  data: colorCodes,
});
