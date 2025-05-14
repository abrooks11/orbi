// Initialize content script

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
  let h,
    s,
    l = (max + min) / 2;

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

  // Convert Map to array and sort by hue (ROY G BIV order)
  return sortColorsByHue(Array.from(uniqueColors.values()));
};

// Extract colors from current page
const colorCodes = getElementColors();

// Send extracted colors to background script
chrome.runtime.sendMessage({
  action: "sendColorCodes",
  data: colorCodes,
});
