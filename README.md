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

1. Open a GRAB level in the browser
2. Open DevTools (`F12`)
3. Go into the "Network" tab
4. Reload the page
5. Find a fetch with just a number (like 8, 5, 1, 11...)
6. Copy the Request URL
7. Go into the "Console" Tab
8. Paste the script.txt into the console
9. Change the change_this_to_your_request_url into the you earler copied Request URL
10. Press Enter

Now you have your GRAB Level!
