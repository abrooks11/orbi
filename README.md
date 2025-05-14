# Orbi - Color Palette Extractor

## Overview
Orbi is a Chrome extension designed to instantly extract and visualize color palettes from any webpage. Whether you're a designer seeking inspiration or a developer analyzing a site's color scheme, Orbi makes capturing color codes effortless.

## Features

- **Automatic Color Detection:** Extracts all unique colors from webpage elements including backgrounds and borders
- **Visual Color Palette:** Displays colors as elegant circular swatches with their corresponding RGB codes
- **One-Click Copy:** Simply click any color to copy its code to your clipboard
- **Smart Color Sorting:** Colors are organized by hue for intuitive browsing (ROY G BIV order)
- **Real-Time Extraction:** Colors update automatically when you navigate to new pages
- **Clean Interface:** Minimalist design that focuses on the colors themselves

## How to Use

1. Click the Orbi icon in your Chrome toolbar
2. View the extracted color palette in the popup window
3. Click any color to copy its RGB code
4. See "Copied!" confirmation when successful

## Technical Architecture
- Content Script: Scans DOM elements and extracts computed styles
- Background Service Worker: Manages data flow between content and popup
- Popup UI: Displays interactive color palette with smooth animations

## Project Structure
```
├── manifest.json      # Extension configuration
├── popup.html         # Popup interface structure
├── popup.js           # Popup logic and interactions
├── content.js         # DOM color extraction
├── background.js      # Message broker
├── style.css          # UI styling
└── images/            # Extension icons
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

**Development Guidelines**

- Maintain the existing code style
- Add comments for complex logic
- Test on multiple websites before submitting
- Update documentation as needed

## Roadmap

- [ ] Add hex and HSL color format support
- [ ] Export palette to various formats (CSS, JSON, Adobe Swatch)
- [ ] Custom color naming
- [ ] Dark mode support

## License
MIT License

## Author
Created with ❤️ by abrooks11