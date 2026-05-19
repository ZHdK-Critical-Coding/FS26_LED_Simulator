/**
 * ──────────────────────────────────────────────────────────────────────────────
 *  Matrix & Panel Configuration
 * ──────────────────────────────────────────────────────────────────────────────
 *
 * - `matrix`       : physical LED matrix dimensions (wide × tall).
 * - `panel`        : how the matrix is partitioned into panels (columns × rows).
 * - `pitch`        : distance in pixels between the centre of each LED.
 * - `scale`        : scaling factor applied when rendering the preview.
 * - `subpixelSize` : size of the tiny sub-pixel dots used for smooth preview.
 */
const matrix = { x: 64, y: 32 };
const panel = { column: 7, row: 8 };
const pitch = 6;
const scale = 3.2;
const subpixelSize = 0.2;

const LED_W = matrix.x * panel.column;
const LED_H = matrix.y * panel.row;

/**
 * Architecture — two canvases on the page
 * ────────────────────────────────────────
 *  - LED canvas (`createCanvas(LED_W, LED_H)`): the main p5 canvas, pinned
 *    to the window's top-left at its native 1:1 resolution. Examples are
 *    plain p5 sketches — `background()`, `fill()`, `circle()`, `image()`,
 *    `text()` all draw straight onto this canvas with no `led.` prefix and
 *    no renderer swapping. p5's normal canvas-bound mouse listeners deliver
 *    `mouseX` / `mouseY` in LED pixels.
 *  - Shader preview (`createGraphics(windowWidth, windowHeight, WEBGL)`):
 *    fullscreen behind the LED canvas, with `pointer-events: none` so it
 *    stays purely visual. Each frame it samples the LED canvas as a texture
 *    and renders the simulated LED look across the whole window.
 *
 *  The LED-preview toggle simply hides/shows the LED canvas. The shader
 *  toggle hides/shows the WEBGL preview.
 */

let preview;
let example;
let ui;
let ctrl;
let pInst;
let ledCanvasEl;     // the HTMLCanvasElement of the LED screen

let current_show = 0;

let fading = false;
let fadepoint = 0;
let fadeopacity = 0;
let fadedelta;
let nextExample;

/* ========================================================================== */
/*  Setup                                                                       */
/* ========================================================================== */

function setup() {
  pInst = this;

  // ── Main canvas: the LED screen ─────────────────────────────────────────
  const c = createCanvas(LED_W, LED_H);
  pixelDensity(1);
  noSmooth();

  // Locate the underlying HTMLCanvasElement (p5 1.x vs 2.x expose it
  // differently). We need a real <canvas> for CSS styling and for the
  // shader pass to copy from via drawImage.
  ledCanvasEl =
    (c && c.canvas instanceof HTMLCanvasElement && c.canvas) ||
    (c && c.elt instanceof HTMLCanvasElement && c.elt) ||
    (c instanceof HTMLCanvasElement && c) ||
    document.querySelector('canvas');

  // The LED canvas is a reference panel pinned to the window's top-left at
  // native 1:1 resolution and stacked above the shader. It captures mouse
  // events (the shader canvas above sets pointer-events: none), so p5's
  // built-in mouseX/mouseY are LED-pixel coords — exactly what students
  // expect when writing a standard p5 sketch.
  ledCanvasEl.style.position = 'absolute';
  ledCanvasEl.style.left = '0';
  ledCanvasEl.style.top = '0';
  ledCanvasEl.style.zIndex = '3';
  ledCanvasEl.style.imageRendering = 'pixelated';

  // ── Shader Preview: its own WEBGL graphics, fullscreen on top ───────────
  preview = new Preview(pitch, scale, subpixelSize, LED_W, LED_H);
  preview.setup();

  // ── UI overlay ──────────────────────────────────────────────────────────
  ui = new UI(ledCanvasEl, preview);
  ui.setup();

  loadExample(current_show);
}

/* ========================================================================== */
/*  Mouse handling                                                              */
/* ========================================================================== */
/*
 * Mouse events are p5's standard canvas-bound listeners on the LED canvas.
 * `mouseX` / `mouseY` arrive already in LED-pixel coords (the LED canvas is
 * displayed at native 1:1 resolution), so no translation is needed and
 * students see plain p5 behavior.
 */

/* ========================================================================== */
/*  Show loading & fade transition                                              */
/* ========================================================================== */

function callExample(method, ...args) {
  if (!example || typeof example[method] !== 'function') return;
  try {
    example[method](...args);
  } catch (e) {
    console.error(`example.${method}() error:`, e);
  }
}

function loadExample(index) {
  if (fading === true) return;
  fading = true;
  fadepoint = true;
  nextExample = index;
}

function _loadExample(index) {
  const total = (window.shows || []).length;
  if (total === 0) return;

  current_show = ((index % total) + total) % total;

  if (example) {
    callExample('cleanup');
    example = null;
  }

  clear();
  const Ctor = window.shows[current_show];
  example = new Ctor();

  callExample('setup');
  ui.setExample(current_show, total, Ctor.name);
}

/* ========================================================================== */
/*  Main render loop                                                            */
/* ========================================================================== */

function draw() {
  // The example draws onto the main canvas (the LED screen) using plain p5.
  callExample('draw');

  // Fade transition is drawn on the same canvas the example used.
  if (fading === true) {
    if (fadepoint === true) {
      fadeopacity = 0;
      fadedelta = 10;
      fadepoint = false;
    }

    push();
    noStroke();
    fill(0, 0, 0, fadeopacity);
    rect(0, 0, width, height);
    pop();

    fadeopacity += fadedelta;
    if (fadeopacity > 255) {
      fadedelta *= -1;
      fadeopacity = 255;
      _loadExample(nextExample);
    }
    if (fadeopacity < 0) {
      fading = false;
      fadeopacity = 0;
    }
  }

  // Shader pass first — samples the LED canvas BEFORE the UI overlays its
  // red selection frame, so the frame stays a clean 1-pixel indicator on the
  // LED preview and is never piped through the simulator.
  preview.update(ledCanvasEl);

  // UI's red frame drawn last, only visible on the LED preview canvas.
  ui.draw();
}

/* ========================================================================== */
/*  Input event handlers                                                        */
/* ========================================================================== */

function mousePressed() {
  if (ui) ui.mousePressed(mouseX, mouseY);
  callExample('mousePressed', mouseX, mouseY);
}

function mouseDragged() {
  if (ui) ui.mouseDragged(mouseX, mouseY);
  callExample('mouseDragged', mouseX, mouseY);
}

function mouseReleased() {
  if (ui) ui.mouseReleased();
  callExample('mouseReleased', mouseX, mouseY);
}

function mouseMoved() {
  callExample('mouseMoved', mouseX, mouseY);
}

function keyPressed() {
  if (key === CONTROL) {
    ctrl = true;
    return;
  }
  if (ctrl === true) {
    if (key === 'm') ui.toggle();
    if (key === 'f') ui.toggleFullscreen();
    if (key === 's') ui.toggleShader();
    if (key === 'l') ui.toggleCanvas();
    return;
  }
  if (key === ENTER) {
    loadExample(current_show + 1);
    return;
  }
  callExample('keyPressed', key);
}

function keyReleased() {
  if (key === CONTROL) ctrl = false;
  callExample('keyReleased', key);
}

function windowResized() {
  // Main canvas keeps LED dimensions; only the CSS stretches to the window.
  if (preview) preview.windowResized();
  callExample('windowResized');
}
