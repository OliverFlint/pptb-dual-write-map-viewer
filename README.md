# Dual Write Map Viewer

A Power Platform ToolBox tool for visualising and documenting Dual Write maps in Microsoft Dataverse.

## Features

- ✅ **Solution Filtering** - Select a solution to view only its Dual-Write maps
- ✅ **Interactive Map Viewer** - Browse and select Dual Write maps from a solution
- ✅ **Multiple View Tabs**:
  - **Details** - View field mappings with sync directions (→, ←, ⇆), default values, and value maps
  - **Markdown** - Generate formatted markdown documentation of the mapping
  - **Source** - View the raw JSON mapping data
- ✅ **React 18 with TypeScript** - Modern UI framework with type safety
- ✅ **Fluent UI Components** - Microsoft Fluent design system
- ✅ **ToolBox API Integration** - Connection handling, notifications, and theme support
- ✅ **Dark/Light Theme Support** - Automatically follows ToolBox theme settings

## Installation

Install the Power Platform ToolBox @ https://www.powerplatformtoolbox.com/ and select the 'Dual Write Map Viewer' tool from the marketplace.

## Usage

1. Connect to a Dataverse environment using Power Platform ToolBox
2. Select a solution from the dropdown to view its Dual Write maps
3. Click on a map to view its details in the preview panel
4. Use the tabs to switch between:
   - **Details** - Field mappings, value maps, and sync directions
   - **Markdown** - Copy-paste ready documentation
   - **Source** - Raw JSON mapping data
   - **Diagram** - COMING SOON!

## Structure

```
pptb-dual-write-map-viewer/
├── src/
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles
│   ├── hooks/
│   │   ├── useDataverseApi.ts   # Dataverse API hooks for solutions and maps
│   │   └── useToolboxAPI.ts     # ToolBox API hooks
│   ├── components/
│   │   ├── DualWriteMapList.tsx      # List of Dual-Write maps in selected solution
│   │   ├── DualWriteMapPreview.tsx   # Multi-tab preview component
│   │   └── SolutionPicker.tsx        # Solution selection dropdown
│   └── icons/
│       └── app-icon.svg         # Tool icon
├── dist/                    # Build output
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

Install dependencies:

```bash
npm install
```

Start development server with HMR:

```bash
npm run dev
```

Build the tool:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

### Building and Installing

1. Build the tool: `npm run build`
2. Package the `dist/` folder
3. Install in ToolBox
4. Load and use from the ToolBox interface

## Technical Details

### Dependencies

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Fluent UI** React Components for the UI
- **Mustache** for template rendering
- **React Markdown** for documentation generation
- **React Syntax Highlighter** for code display

## License

MIT
