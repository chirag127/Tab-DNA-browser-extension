# Tab DNA Browser Extension

**Visualize your browsing journey.**

Tab DNA is a browser extension that visualizes the click path or referral chain that led a user to their current tab in the form of a branch-like graph. This helps users understand how they navigated across different sites and pages, offering insight into their browsing habits and decision-making patterns.

## Features

### Core Features

-   **Real-Time Click Path Tracking**: Track referrer URLs when a link is clicked that opens a new tab or navigates in the current tab.
-   **Branch-Like Graph Visualization**: Interactive UI to view tab lineage as a collapsible tree.
-   **Session-Based Timeline**: Organize tab graphs by session and show time spent on each node.
-   **Manual Link Nodes**: Allow users to optionally link directly opened pages to a known origin.
-   **Export & Share**: Export the tab journey graph as PNG, SVG, or JSON.

### Privacy

-   All browsing data is stored locally unless user enables sync.
-   No third-party sharing of URLs or session graphs.
-   Users can delete session history at any time.

## Installation

### Development Installation

1. Clone this repository
2. Navigate to the extension directory: `cd extension`
3. Run `npm install` to install dependencies
4. Run `npm run build` to build the extension
5. Load the `dist` folder as an unpacked extension in your browser:
    - Chrome: Go to `chrome://extensions/`, enable Developer mode, and click "Load unpacked"
    - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` folder

## Development

### Commands

-   `npm run build`: Build the extension for production
-   `npm run dev`: Build the extension and watch for changes
-   `npm run generate-icons`: Generate extension icons

### Project Structure

-   `src/background`: Background script for tab tracking
-   `src/popup`: Popup UI for visualization
-   `src/options`: Options page for settings
-   `src/content`: Content script for page interaction
-   `src/utils`: Utility functions
-   `src/components`: Reusable UI components
-   `public`: Static assets

## License

MIT
