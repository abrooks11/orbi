console.log("content.js running");
// console.log(document); // Now you can access the document object

const getElementColors = () => {
  // HTML ELEMENTS TO SCAN
  const tagNames = [
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

  // MAPS TO STORE UNIQUE COLORS
  const uniqueColors = new Map();
  const accessoryColors = new Map();

  // ITERATE THROUGH ALL DOM ELEMENTS AND MAKE MAP OF UNIQUE COLORS FROM RELEVANT HTML TAGS
  const makeColorMap = document.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    if (tagNames.includes(tagName)) {
      const style = window.getComputedStyle(element, "");
      const backgroundColor = style.getPropertyValue("background-color");
      const borderColor = style.getPropertyValue("border-top-color");
      // console.log(style);
      uniqueColors.set(backgroundColor, backgroundColor);
      accessoryColors.set(borderColor, borderColor);
    }
  });
  // console.log("uniqueColorsMap", uniqueColors);

  return Array.from(uniqueColors.values());
};

let colorCodes = getElementColors();
console.log("data sent from content.js to background.js ", colorCodes);

// SEND COLOR CODES TO THE BACKGROUND SCRIPT
chrome.runtime.sendMessage({
  action: "sendColorCodes",
  data: colorCodes,
});
