# Color Palette Chrome Extension

## Description

A Chrome extension that helps you extract and display color codes from web pages. This tool makes it easy for designers and developers to identify and collect color information from any website.

## Features

- Extracts color codes from the current web page
- Displays colors in an easy-to-view palette format
- Shows both color preview (as orbs) and corresponding color codes
- Real-time color extraction while browsing

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory

## Usage

1. Click on the extension icon in your Chrome toolbar
2. The popup will display a palette of colors found on the current page
3. Each color is shown as a circular preview with its corresponding color code

## Project Structure

```
chrome-extension/
├── manifest.json
├── popup.html
├── popup.js
├── content.js
├── background.js
└── style.css
```

## Technical Details

- Uses Chrome's Scripting API for content script injection
- Implements message passing between content scripts and background scripts
- Features a responsive popup UI with flexbox layout
- Handles color extraction and display in real-time

## Development

To modify or enhance the extension:

1. Make changes to the relevant files
2. Reload the extension in `chrome://extensions/`
3. Test changes on various websites

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your chosen license here]
