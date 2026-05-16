# grab-level-downloader
Download valid `.level` files from GRAB VR viewer links directly in your browser.

## Features

- Downloads real protobuf `.level` files
- Works directly from grabvr.quest viewer pages
- No extensions required

## How it works

GRAB levels are stored as protobuf binaries (`.level` files).
This tool captures the original binary payload requested by the viewer page and saves it directly without reconstructing or modifying the data.

## Usage

1. Open a GRAB viewer page
2. Open DevTools (`F12`)
3. Paste the script into the console
4. Reload the page
5. The `.level` file downloads automatically
