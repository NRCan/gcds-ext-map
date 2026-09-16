# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0-preview.7] - 2026-09-16

### Added

- Static map control.
- MapML markup guidance and a GCDS map page template in the npm package.
- `npx gcds-ext-map-skills` CLI to install and remove the bundled markup skills.

### Changed

- Renamed the main component to `<gcds-ext-map>` and updated deployment paths.
- Applied GCDS design tokens and standardized control icons.
- Improved map sizing and locale synchronization.

### Fixed

- Added accessible names for the map region and attribution toggle.
- Set the map's application role earlier during initialization.
- Handled child-component readiness timeouts.
- Hardened pasted map content.

## [1.0.0-preview.2] - 2026-07-21

- Preview release of the GC Design System Map Extension.

[Unreleased]: https://github.com/nrcan/gcds-ext-map/compare/v1.0.0-preview.7...HEAD
[1.0.0-preview.7]: https://github.com/nrcan/gcds-ext-map/compare/v1.0.0-preview.2...v1.0.0-preview.7
[1.0.0-preview.2]: https://github.com/nrcan/gcds-ext-map/releases/tag/v1.0.0-preview.2