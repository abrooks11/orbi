// FILTER OUT WHITE???

console.log("content.js running");
console.log(document); // Now you can access the document object

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

  // MAPS TO STORE DOM ELEMENTS AND UNIQUE COLORS
  const elementMap = new Map();
  const colorMap = new Map();

  // ITERATE THROUGH ALL DOM ELEMENTS AND ADD TO ELEMENTMAP
  const elements = document.querySelectorAll("*").forEach((element) => {
    const tagName = element.tagName.toLocaleLowerCase();
    // if the tagname is in the tagnames array, check if it's in the map, if it's in the map, push to the array, if not add to the map
    if (tagNames.includes(tagName))
      elementMap.set(tagName, [...(elementMap.get(tagName) ?? []), element]);
  });
  console.log(elementMap);

  // ITERATE THROUGH THE ELEMENT MAP AND GENERATE MAP FOR UNIQUE COLORS
  elementMap.forEach((array) => {
    array.forEach((element) => {
      const style = window.getComputedStyle(element, "");
      const backgroundColor = style.getPropertyValue("background-color");
      colorMap.set(backgroundColor, backgroundColor);
    });
  });
  console.log(colorMap);

  console.log(Array.from(colorMap.values()));

  const colorContainer = document.createElement("div");
  colorContainer.setAttribute("id", "color-container");
  colorContainer.style.padding = "10px";
  colorContainer.style.display = "flex";
  colorContainer.style.justifyContent = "center";
  colorContainer.style.gap = "20px";

  Array.from(colorMap.values()).forEach((color) => {
    const orbContainer = document.createElement("div");
    orbContainer.style.display = "flex";
    orbContainer.style.flexDirection = "column";
    orbContainer.style.alignItems = "center";

    const orb = document.createElement("div");
    const colorCode = document.createElement("div");
    colorCode.style.fontSize = "0.8rem";
    colorCode.innerText = color;

    orb.setAttribute("class", "orb");
    orb.style.height = "50px";
    orb.style.width = "50px";
    orb.style.border = "1px solid #ccc";
    orb.style.borderRadius = "50%";
    orb.style.backgroundColor = color;
    orbContainer.append(orb, colorCode);
    colorContainer.prepend(orbContainer);
  });

  document.body.prepend(colorContainer);

  return Array.from(colorMap.values());
};

// Send the collected colors back to the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getColors") {
    const colors = getElementColors();
    console.log(colors);
    console.log({ colors });

    sendResponse({ colors });
  }
});

// elementMap.get(tagName)
//   ? elementMap.set(tagName, [...elementMap.get(tagName), tagName])
//   : elementMap.set(tagName, [element]);

// https://www.permadi.com/tutorial/cssGettingBackgroundColor/index.html
