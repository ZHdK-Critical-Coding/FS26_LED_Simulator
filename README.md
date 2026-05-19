# Billboard Simulation

[Demo](https://zhdk-critical-coding.github.io/FS26_LED_Simulator/)

A p5.js sketch that simulates an LED billboard composed of a grid of panels. Examples ("shows") are plain p5 sketches that draw onto a small LED-resolution canvas. A separate WEBGL shader canvas runs fullscreen behind it, sampling the LED canvas as a texture and rendering the look of physical LED subpixels (pitch, scale, glow).

The project is structured so that different visual shows can be plugged in and switched at runtime.

## Project layout

```
.
├── index.html                # Loads p5, the shows, and the framework scripts
├── style.css
├── jsconfig.json             # Enables p5 global types in VS Code
├── libraries/
│   ├── p5.min.js
│   ├── runner.js             # Main p5 entry point — setup/draw, show switching
│   ├── preview.js            # LED-look preview renderer (subpixel shader)
│   └── ui.js                 # On-screen UI, fullscreen, shader/preview toggles
└── shows/
    ├── 00_plain/
    ├── 01_bouncy_balls/
    ├── 02_pixel_font/
    └── 03_animated_gif/
```

## How a show works

Each show is a JavaScript class registered into `window.shows`. Inside its methods you use plain p5 functions (`background`, `fill`, `circle`, `text`, `image`, …) exactly as in the p5.js editor — there is no `led.` prefix and no special API. The main p5 canvas IS the LED screen, so `width` / `height` are the LED panel dimensions and `mouseX` / `mouseY` arrive in LED pixels (the LED canvas is what receives mouse events; the shader preview underneath is non-interactive).

A show may implement any of: `setup`, `draw`, `cleanup`, `mousePressed`, `mouseDragged`, `mouseReleased`, `mouseMoved`, `keyPressed`, `keyReleased`, `windowResized`.

## Getting started in VS Code

1. Open this folder in VS Code.
2. When prompted, install the recommended extensions (or run **Extensions: Show Recommended Extensions**):
   - **p5.vscode** (`samplavigne.p5-vscode`) — p5 autocomplete and global types.
   - **Live Server** (`ritwickdey.liveserver`) — serves the project so p5 can load assets without CORS issues.
3. Open `index.html` and click **Go Live** in the status bar (or right-click → **Open with Live Server**). The sketch opens in your browser at `http://127.0.0.1:5500`.

A simple `python3 -m http.server` from this folder works too.

## Keyboard shortcuts

| Key        | Action                          |
| ---------- | ------------------------------- |
| `Enter`    | Switch to next show             |
| `ctrl-m`   | Toggle the on-screen UI panel   |
| `ctrl-f`   | Toggle fullscreen               |
| `ctrl-s`   | Toggle the LED simulator shader |
| `ctrl-l`   | Toggle the LED preview canvas   |

## Configuration

Panel geometry lives at the top of `libraries/runner.js`:

```js
const matrix = { x: 64, y: 32 };       // pixels per panel
const panel  = { column: 7, row: 8 };  // panels in the wall
const pitch  = 6;                      // physical pitch used by the preview shader
const scale  = 3.2;                    // preview scale
const subpixelSize = 0.2;
```

The LED canvas resolution is `matrix.x * panel.column` × `matrix.y * panel.row` (default 448 × 256).

## Adding a new show

1. Create `shows/NN_my_show/NN_my_show.js`.
2. Define a class and push it into `window.shows`:

   ```js
   class MyShow {
     setup()   { /* initialize state on `this` */ }
     draw()    { background(0); /* plain p5, drawn onto the LED panel */ }
     cleanup() { /* free resources */ }
   }
   window.shows.push(MyShow);
   ```

3. Add a `<script>` tag for it in `index.html` before `libraries/runner.js`.

Press `Enter` while the sketch is running to cycle to it.
