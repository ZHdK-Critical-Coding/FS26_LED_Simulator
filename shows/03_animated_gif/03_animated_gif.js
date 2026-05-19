// ===========================================================================
// GIF_LOOP — A looping animated GIF playback show for the LED billboard
// ===========================================================================
//
// This show displays a looping animated GIF on the simulated LED billboard.
// It loads a GIF asset once and draws it full-screen each frame.
//
// Every "show" is a JavaScript class that the framework manages:
//   1) Instantiates the class once (new GIFLoop())
//   2) Calls setup() exactly once to initialize state
//   3) Calls draw() ~60 times per second to render each frame
//   4) Calls cleanup() when the user switches to a different show
//   5) Responds to input events like mousePressed(), keyPressed(), etc.
//
// Shows are cycled through by pressing [Enter] on the keyboard.
//
//
// ---------------------------------------------------------------------------
// JUST A REGULAR p5 SKETCH
// ---------------------------------------------------------------------------
// Inside setup() and draw() you use plain p5 functions exactly like in the
// p5.js editor — no special prefix, no special API:
//
//     background(0);
//     image(this.bgAnim, 0, 0, width, height);
//
// `width` and `height` give you the size of the LED panel. Everything you
// draw lands on the LED buffer and is then rendered through the simulator
// shader. The framework calls createCanvas() for you — don't call it yourself.
//
//
// ---------------------------------------------------------------------------
// STATE MANAGEMENT — use `this` for persistent values
// ---------------------------------------------------------------------------
// In a standard p5 sketch, you might write:
//
//     let x = 0;
//     function draw() { x = x + 1; circle(x, 50, 10); }
//
// Inside a class-based show, top-level variables won’t persist across frames.
// Instead, store persistent state on `this`:
//
//     setup() { this.x = 0; }
//     draw()  { this.x = this.x + 1; circle(this.x, 50, 10); }
//
// `this` refers to the current show instance — each show has its own `this`.
// So `this.x` is independent across multiple shows.
//
// Rule of thumb:
//   • Use `this.something` for values that must survive between frames.
//   • Use local `let`/`const` for temporary values used only once.
//
//   this.balls = [];             // persistent — use `this.`
//   let speed = 2;               // temporary — local `let` is fine
//
// Initialize all persistent state in setup(). Access and update it in draw()
// and input handlers.
// ===========================================================================


class GIFLoop {

  // setup() runs ONCE when this show becomes active.
  // Use it to load assets, initialize arrays, set initial positions, etc.
  // Do NOT draw the final picture here — drawing belongs exclusively in draw().
  async setup() {
    // Load the animated GIF asset (must be accessible at this path)
    this.gifUrl = '/shows/03_animated_gif/movie_countdown.gif';
    this.bgAnim = await loadImage(this.gifUrl);
  }


  // draw() runs every frame (~60 fps).
  // Whatever you draw here is rendered on the LED billboard.
  //
  // Start with background(...) if you want a clean slate each frame;
  // otherwise the previous frame's contents persist.
  draw() {
    background(0);
    if (this.bgAnim) {
      // Draw the GIF full-screen, preserving aspect ratio implicitly
      image(this.bgAnim, 0, 0, width, height);
    }
  }

  // ---- Optional lifecycle & input handlers ------------------------------
  // Implement only the methods you need. Unused ones may be omitted.
  // mx / my are mouse coordinates in LED pixels.

  windowResized() {}      // browser window changed size
  mousePressed(mx, my) {} // mouse button pressed
  mouseDragged(mx, my) {} // mouse moved while a button is held
  mouseReleased(mx, my) {}// mouse button released
  mouseMoved(mx, my) {}   // mouse moved without a button held
  keyPressed(key) {}      // a key pressed (`key` is the character)
  keyReleased(key) {}     // a key released
  cleanup() {}            // called when switching away from this show
                          // — stop sounds, timers, free memory, etc.
}


// Register this show with the framework so it appears in the [Enter] cycle.
// Add the same line at the bottom of every show file you create.
window.shows.push(GIFLoop);
