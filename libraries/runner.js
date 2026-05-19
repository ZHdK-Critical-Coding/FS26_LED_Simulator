/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Matrix & Panel Configuration
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * - `matrix`   : physical LED matrix dimensions (wide x tall).
 * - `panel`    : how the matrix is partitioned into panels (columns × rows).
 * - `pitch`    : distance in pixels between the centre of each LED.
 * - `scale`    : scaling factor applied when rendering the preview.
 * - `subpixelSize` : size of the tiny sub‑pixel dots used for smooth preview.
 */
const matrix = { x: 64, y: 32 };
const panel = { column: 7, row: 8 };
const pitch = 6;
const scale = 3.2;
const subpixelSize = 0.2;

/**
 * Global objects used throughout the sketch.
 *
 * @type {p5.Graphics|null}
 * @type {Preview|null}
 * @type {Example|null}
 * @type {UI|null}
 */
let led;
let preview;
let example;
let ui;
let ctrl;

/**
 * Index of the currently playing example.
 */
let current_show = 0;

/**
 * Fade transition state.
 * - `fading`   : true when a transition is in progress.
 * - `fadepoint`: true only during the first frame of a transition.
 * - `fadeopacity`: current alpha level of the fade overlay.
 * - `fadedelta`: change in opacity per frame.
 * - `nextExample`: the index of the example that will be loaded next.
 */
let fading = false;
let fadepoint = 0;
let fadeopacity = 0;
let fadedelta;
let nextExample;

/* ========================================================================== */
/*  Setup & Teardown                                                            */
/* ========================================================================== */

/**
 * p5.js callback ― called once when the sketch starts.
 * Initialises the canvas, the LED buffer, the preview engine, UI, and loads
 * the first example.
 *
 * @see https://p5js.org/reference/#/p5/setup
 */
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // full‑screen 3D canvas
  setAttributes('antialias', false);             // anti‑alias must be set before
  noSmooth();                                    // disable smoothing
  pixelDensity(2);                               // retina/HiDPI support

  // Render buffer for the LED matrix (Chad of 64 × 32 pixels times panels)
  led = createGraphics(matrix.x * panel.column, matrix.y * panel.row);

  // Preview draws a scaled representation of the matrix onto the screen
  preview = new Preview(pitch, scale, subpixelSize);
  preview.setup();

  // UI overlays (fullscreen, shader toggle, etc.)
  ui = new UI(led, preview);
  ui.setup();

  // Load the first example
  loadExample(current_show);
}

/**
 * Helper that safely calls a method on the active `example`.
 *
 * @param {string} method Name of the method to invoke.
 * @param {...any} args   Arguments forwarded to the method.
 */
function callExample(method, ...args) {
  if (!example || typeof example[method] !== 'function') return;
  try {
    example[method](...args);
  } catch (e) {
    console.error(`example.${method}() error:`, e);
  }
}

/**
 * Public API for requesting a new example.
 *
 * The transition is performed with a fade‑out/fade‑in effect. If a
 * transition is already in progress, the call is ignored.
 *
 * @param {number} index Index of the example to show next.
 */
function loadExample(index) {
  if (fading === true) return;           // ignore if already fading
  fading = true;
  fadepoint = true;                      // will trigger the fade‑in loop
  nextExample = index;
}

/**
 * Internal function that actually swaps out the old example.
 *
 * @private
 * @param {number} index Index of the example to load.
 */
function _loadExample(index) {
  const total = (window.shows || []).length;
  if (total === 0) return;

  // Normalise index to a valid range
  current_show = ((index % total) + total) % total;

  // Clean up the current example if one is already active
  if (example) {
    callExample('cleanup');
    example = null;
  }

  // Clear the LED buffer and instantiate the next example
  led.clear();
  const Ctor = window.shows[current_show];
  example = new Ctor(led);

  // Call the usual setup routine for the example
  callExample('setup');

  // Inform the UI of the currently loaded example
  ui.setExample(current_show, total, Ctor.name);
}

/* ========================================================================== */
/*  Main Render Loop                                                            */
/* ========================================================================== */

/**
 * p5.js callback – runs on every frame.
 * It clears the screen, renders the current example, applies fade
 * transitions, updates the preview, and finally draws UI elements.
 *
 * @see https://p5js.org/reference/#/p5/draw
 */
function draw() {
  clear();                  // clear WebGL canvas
  led.background(0);         // black background on the LED buffer
  callExample('draw');      // delegate animation logic to the active example

  // ---------- Fade Transition ----------
  if (fading === true) {
    // Initial frame – start the fade‑in
    if (fadepoint === true) {
      fadeopacity = 0;
      fadedelta = 10;
      console.log('start');
      fadepoint = false;
    }

    // Draw a semi‑transparent black rectangle over the LED buffer
    led.fill(0, 0, 0, fadeopacity);
    led.rect(0, 0, led.width, led.height);

    // Increment the fade opacity
    fadeopacity += fadedelta;

    // When fully opaque, swap the example
    if (fadeopacity > 255) {
      fadedelta *= -1;                 // reverse direction to fade‑out
      fadeopacity = 255;
      _loadExample(nextExample);       // swap example
    }

    // When fully transparent, end transition
    if (fadeopacity < 0) {
      fading = false;
      fadeopacity = 0;
      console.log('stop');
    }
  }

  // ---------- Preview & UI ----------
  preview.update(led); // render the LED buffer to the preview canvas
  ui.draw();            // draw UI controls
}

/* ========================================================================== */
/*  Input Event Handlers                                                       */
/* ========================================================================== */

function mousePressed() {
  ui.mousePressed(mouseX, mouseY);
  callExample('mousePressed', mouseX, mouseY);
}

function mouseDragged() {
  ui.mouseDragged(mouseX, mouseY);
  callExample('mouseDragged', mouseX, mouseY);
}

function mouseReleased() {
  ui.mouseReleased();
  callExample('mouseReleased', mouseX, mouseY);
}

function mouseMoved() {
  callExample('mouseMoved', mouseX, mouseY);
}

/**
 * Detects key presses that trigger global UI actions or advance the example.
 *
 * @param {KeyboardEvent} e
 */
function keyPressed() {
  if (key === CONTROL) {
    ctrl = true
    return
  }
  if (ctrl === true) {
    if (key === 'm') {
      ui.toggle();            // show/hide UI
    }
    if (key === 'f') {
      ui.toggleFullscreen();  // toggle full‑screen mode
    }
    if (key === 's') {
      ui.toggleShader();      // enable/disable shader
    }
    if (key === 'l') {
      ui.toggleCanvas();      // show/hide preview graph
    }
    return;
  }
  if (key === ENTER) {
    loadExample(current_show + 1); // next example
    return;
  }
  callExample('keyPressed', key);
}

function keyReleased() {
  if (key === CONTROL) {
    ctrl = false
  }
  callExample('keyReleased', key);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  callExample('windowResized');
}
