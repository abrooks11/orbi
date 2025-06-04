// Initialize content script
// console.log("content.js running");

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
 * Calculates the perceptual distance between two colors
 * using a simple Euclidean distance in RGB space
 * @param {number[]} color1 - RGB values of first color
 * @param {number[]} color2 - RGB values of second color
 * @returns {number} - Distance between colors
 */
const colorDistance = (color1, color2) => {
  return Math.sqrt(
    Math.pow(color1[0] - color2[0], 2) +
    Math.pow(color1[1] - color2[1], 2) +
    Math.pow(color1[2] - color2[2], 2)
  );
};

/**
 * Determine if two colors are similar enough to be considered the same
 * @param {string} color1 - First color as RGB string
 * @param {string} color2 - Second color as RGB string
 * @param {number} threshold - Similarity threshold (0-255)
 * @returns {boolean} - Whether colors are similar
 */
const areSimilarColors = (
  color1,
  color2,
  threshold = 15
) => {
  const rgb1 = extractRgbValues(color1);
  const rgb2 = extractRgbValues(color2);
  
  // For very dark colors (like blacks), use a tighter threshold
  const isVeryDark = 
    (rgb1[0] < 30 && rgb1[1] < 30 && rgb1[2] < 30) || 
    (rgb2[0] < 30 && rgb2[1] < 30 && rgb2[2] < 30);
  
  const actualThreshold = isVeryDark ? threshold / 2 : threshold;
  
  return colorDistance(rgb1, rgb2) < actualThreshold;
};

/**
 * Groups similar colors together and selects a representative
 * @param {string[]} colors - Array of RGB color strings
 * @returns {string[]} - Array of representative color values
 */
const groupSimilarColors = (colors) => {
  const groupedColors= [];
  const processed = new Set();

  colors.forEach(color => {
    // Skip if this color was already processed in a group
    if (processed.has(color)) return;
    
    // Create a new group with this color as representative
    processed.add(color);
    
    // Find all similar colors and mark them as processed
    colors.forEach(otherColor => {
      if (color !== otherColor && areSimilarColors(color, otherColor)) {
        processed.add(otherColor);
      }
    });
    
    // Add this color as the representative of its group
    groupedColors.push(color);
  });

  return groupedColors;
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
 * Filters out colors that are too similar to white or black
 * @param {string[]} colors - Array of RGB color strings
 * @returns {string[]} - Filtered array of colors
 */
const filterExtremeColors = (colors) => {
  // Exclude colors that are very close to pure black or white
  return colors.filter(color => {
    const [r, g, b] = extractRgbValues(color);
    const [_, s, l] = rgbToHsl(r, g, b);
    
    // Filter out colors with very high lightness (near white)
    // or very low lightness (near black) and low saturation
    const isNearWhite = l > 95;
    const isNearBlack = l < 5 && s < 10;
    
    return !isNearWhite && !isNearBlack;
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
      const backgroundColor = computedStyle.getPropertyValue("background-color");
      const borderColor = computedStyle.getPropertyValue("border-top-color");
      const color = computedStyle.getPropertyValue("color"); // Adding text color

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

      // Process and store text color if valid
      if (isValidColor(color)) {
        const normalizedTextColor = normalizeColor(color);
        if (normalizedTextColor) {
          uniqueColors.set(normalizedTextColor, normalizedTextColor);
        }
      }
    }
  });

  // Get all unique colors from the Map
  let allColors = Array.from(uniqueColors.values());
  
  // Group similar colors to eliminate near-duplicates
  const groupedColors = groupSimilarColors(allColors);
  
  // Optional: Filter out colors that are too close to pure black or white
  // const filteredColors = filterExtremeColors(groupedColors);
  
  // Sort by hue (ROY G BIV order)
  return sortColorsByHue(groupedColors);
};

// Extract colors from current page
const colorCodes = getElementColors();
// console.log("Colors extracted from page:", colorCodes);

// Send extracted colors to background script
chrome.runtime.sendMessage({
  action: "sendColorCodes",
  data: colorCodes,
});
