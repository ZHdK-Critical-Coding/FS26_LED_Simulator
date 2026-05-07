# Billboard Simulation

A p5.js sketch that simulates an LED billboard composed of a grid of panels. The simulation renders content to an off-screen graphics buffer and then displays it through a preview shader that mimics the look of physical LED subpixels (pitch, scale, glow).

The project is structured so that different visual "shows" can be plugged in and switched at runtime.

## Project layout

```
.
├── index.html                # Loads p5, the shows, and the main sketch
├── sketch.js                 # Main p5 entry point — setup/draw, show switching
├── preview.js                # LED-look preview renderer (subpixel shader)
├── ui.js                     # On-canvas UI, fullscreen, shader/canvas toggles
├── style.css
├── jsconfig.json             # Enables p5 global types in VS Code
├── libraries/
│   └── p5.min.js
└── shows/
    ├── 00_plain/
    ├── 01_bouncy_balls/
    └── 02_pixel_font/
```

Each show is a class registered into `window.shows`. Shows draw onto the global `led` graphics buffer (the off-screen canvas the size of the LED wall). Shows may implement `setup`, `draw`, `cleanup`, `mousePressed`, `mouseDragged`, `mouseReleased`, `mouseMoved`, `keyPressed`, `keyReleased`, and `windowResized`.

## Getting started in VS Code

1. Open this folder in VS Code.
2. When prompted, install the recommended extensions (or run **Extensions: Show Recommended Extensions**):
   - **p5.vscode** (`samplavigne.p5-vscode`) — p5 autocomplete and global types.
   - **Live Server** (`ritwickdey.liveserver`) — serves the project so p5 can load assets without CORS issues.
3. Open `index.html` and click **Go Live** in the status bar (or right-click → **Open with Live Server**). The sketch opens in your browser at `http://127.0.0.1:5500`.

A simple `python3 -m http.server` from this folder works too.

## Keyboard shortcuts

| Key     | Action                          |
| ------- | ------------------------------- |
| `Enter` | Switch to next show             |
| `m`     | Toggle the on-canvas UI         |
| `f`     | Toggle fullscreen               |
| `s`     | Toggle the LED preview shader   |
| `l`     | Toggle the LED canvas           |

## Configuration

Panel geometry lives at the top of `sketch.js`:

```js
const matrix = { x: 64, y: 32 };  // pixels per panel
const panel  = { column: 7, row: 8 };  // panels in the wall
const pitch  = 6;       // physical pitch used by the preview shader
const scale  = 3.2;     // preview scale
const subpixelSize = 0.2;
```

The off-screen buffer resolution is `matrix.x * panel.column` × `matrix.y * panel.row`.

## Adding a new show

1. Create `shows/NN_my_show/NN_my_show.js`.
2. Define a class and push it into `window.shows`:

   ```js
   class MyShow {
     setup()   { /* initialize state on `this` */ }
     draw()    { led.background(0); /* draw onto the global `led` */ }
     cleanup() { /* free resources */ }
   }
   window.shows.push(MyShow);
   ```

3. Add a `<script>` tag for it in `index.html` before `preview.js`.

Press `Enter` while the sketch is running to cycle to it.
