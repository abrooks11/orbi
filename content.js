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

  // const colorContainer = document.createElement("div");
  // colorContainer.setAttribute("id", "color-container");
  // colorContainer.style.padding = "10px";
  // colorContainer.style.display = "flex";
  // colorContainer.style.justifyContent = "center";
  // colorContainer.style.gap = "20px";

  // Array.from(uniqueColors.values()).forEach((color) => {
  //   const orbContainer = document.createElement("div");
  //   orbContainer.setAttribute("class", "orb-wrapper");
  //   orbContainer.style.display = "flex";
  //   orbContainer.style.flexDirection = "column";
  //   orbContainer.style.alignItems = "center";

  //   const orb = document.createElement("div");
  //   orb.setAttribute("class", "orb");
  //   orb.style.height = "50px";
  //   orb.style.width = "50px";
  //   orb.style.border = "1px solid #ccc";
  //   orb.style.borderRadius = "50%";
  //   orb.style.backgroundColor = color;

  //   const colorCode = document.createElement("div");
  //   colorCode.style.fontSize = "0.8rem";
  //   colorCode.innerText = color;

  //   orbContainer.append(orb, colorCode);
  //   colorContainer.prepend(orbContainer);
  // });

  // document.body.prepend(colorContainer);

  return Array.from(uniqueColors.values());
};

let colorCodes = getElementColors();
console.log("data sent from content.js to background.js ", colorCodes);

// Send color code data to the background script
chrome.runtime.sendMessage({
  action: "sendColorCodes",
  data: colorCodes,
});

// // Send the collected colors back
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "getColors") {
//     const colors = getElementColors();
//     sendResponse({ colors });
//   }
// });
