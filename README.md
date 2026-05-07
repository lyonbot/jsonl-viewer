# JSONL Viewer

A fast, browser-based viewer for NDJSON / JSON Lines files. Drop a file or paste content to explore, search, filter, and export your data — all client-side with no upload required.

**Live demo:** <https://lyonbot.github.io/jsonl-viewer/>

## Features

- Drag-and-drop or paste NDJSON / JSONL files
- Virtualized list for smooth scrolling through large files
- Full-text search and [Jora](https://github.com/nicot/jora) query support for advanced filtering
- Collapsible JSON tree view for each line
- Column resizing and customizable display
- Export filtered results
- Runs entirely in the browser — no data leaves your machine

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT
