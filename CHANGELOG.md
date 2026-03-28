# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0]

### Added
- `npx cloud-images-toolkit` zero-install support
- Interactive config file creation from reference template
- Config validation with clear error messages on startup

### Fixed
- Race condition in upload process (`processSrcFolder`) — async uploads now execute sequentially
- Race condition in fetch/download — promises properly collected and awaited
- API key no longer exposed to browser client
- Server no longer crashes on malformed WebSocket messages
- Graceful shutdown on `SIGINT` / `SIGTERM`
