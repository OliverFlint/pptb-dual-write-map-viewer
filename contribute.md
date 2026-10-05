# Contributing

Thanks for your interest in improving Dual Write Map Viewer. Bug reports, documentation updates, and code contributions are welcome.

## Prerequisites

- Node.js 18 or later
- npm
- Power Platform ToolBox and a Dataverse environment for exercising the ToolBox APIs

## Set up the project

Clone the repository, open its directory, and install the dependencies:

```bash
git clone https://github.com/OliverFlint/pptb-dual-write-map-viewer.git
cd pptb-dual-write-map-viewer
npm install
```

## Develop

Start Vite's development server:

```bash
npm run dev
```

The app uses `window.toolboxAPI` and `window.dataverseAPI`, which are provided by Power Platform ToolBox. For end-to-end work with a real Dataverse connection, build the tool and load the output in ToolBox.

Build the distributable files into `dist/`:

```bash
npm run build
```

Validate the ToolBox package manifest:

```bash
npm run validate
```

Preview the production build locally:

```bash
npm run preview
```

## Code map

- `src/App.tsx` — App shell, solution and connection state, and map export actions.
- `src/hooks/useDataverseApi.ts` — Loads solutions and Dual Write maps from Dataverse.
- `src/hooks/useToolboxAPI.ts` — Reads connection state and subscribes to ToolBox events.
- `src/components/` — Solution picker, map list, and map detail, Markdown, diagram, and source views.
- `src/utils/generateMapMarkdown.ts` — Converts a map's JSON mapping to Markdown.
- `src/utils/generateMapDiagram.ts` — Converts a map's JSON mapping to Mermaid flowchart source.
- `CHANGELOG.md` — Project change history.

When changing Markdown or Mermaid output, keep the preview and export paths using the shared generators so their content stays consistent.

## Pull requests

1. Create a branch for your change.
2. Keep the change focused and update documentation when behavior changes.
3. Run `npm run build` and `npm run validate` before submitting.
4. Describe the user-visible change and include screenshots for UI changes where practical.

Please do not include credentials, connection tokens, or environment-specific Dataverse data in code, logs, screenshots, or pull requests.
