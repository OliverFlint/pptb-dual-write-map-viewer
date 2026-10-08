# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-10-06

### Changed

- Improve Mermaid diagram connector contrast with theme-aware colors in light and dark modes.
- Refresh the diagram screenshot to show the updated dark-mode connectors.

## [1.1.0] - 2026-10-05

### Added

- Export a selected map or all maps in a solution as Markdown, Mermaid source, or both.
- Include source filters in generated Markdown and Mermaid diagrams.
- Add visible connection feedback, export results, and clearer loading and empty states.

### Changed

- Update `@pptb/types` and use the current ToolBox connection type and event cleanup API.
- Refresh the application layout and presentation.

## [1.0.1] - 2026-07-03

### Added

- UI Improvements

## [1.0.0] - 2026-07-02

### Fixed

- Deprecated show/hide Loading API usage in ToolBox integration

### Added

- Mermaid diagram generation for Dual Write maps

## [0.0.3] - 2026-03-25

### Added

- Solution filtering to view only maps from selected solutions
- Interactive map viewer for browsing Dual Write maps
- Multiple view tabs:
  - Details: View field mappings with sync directions
  - Markdown: Generate formatted documentation
  - Diagram: Mermaid diagram generation
- React 18 with TypeScript support
- Fluent UI Components integration
- ToolBox API integration for connection handling and theme support
- Dark/light theme support following ToolBox settings
