// ===========================================================================
// PLAIN — starter template for a "show"
// ===========================================================================
//
// A "show" is one piece of content that runs on the simulated LED billboard.
// Every show is a JavaScript class. The framework will:
//   1) create one instance of your class           (new Plain())
//   2) call setup() once                           — initialize state
//   3) call draw() every frame, ~60 times/second   — render the picture
//   4) call cleanup() when the user switches away  — release resources
//   5) call mousePressed(), keyPressed(), etc. when input happens
//
// You cycle through registered shows by pressing [Enter].
//
//
// ---------------------------------------------------------------------------
// JUST A REGULAR p5 SKETCH
// ---------------------------------------------------------------------------
// Inside setup() and draw() you use plain p5 functions exactly like in the
// p5.js editor — no `led.` prefix, no special API:
//
//     background(0);
//     fill(255, 0, 0);
//     noStroke();
//     circle(20, 20, 10);
//     rect(5, 5, 30, 30);
//
// `width` and `height` give you the size of the LED panel (e.g. 448 × 256).
// The mouse coordinates passed to mousePressed(mx, my) etc. are in LED pixels.
// Everything you draw lands on the LED buffer and is then displayed through
// the simulator shader.
//
// The framework is the one that calls createCanvas() for you — you should NOT
// call it yourself. Just write your drawing logic inside the methods below.
//
//
// ---------------------------------------------------------------------------
// CLASS VARIABLES — `this.something`
// ---------------------------------------------------------------------------
// In a normal p5 sketch you might write:
//
//     let x = 0;
//     function draw() { x = x + 1; circle(x, 50, 10); }
//
// Inside a class you cannot use top-level `let` like that. Instead, every
// piece of state that needs to survive between frames lives on `this`:
//
//     setup() { this.x = 0; }
//     draw()  { this.x = this.x + 1; circle(this.x, 50, 10); }
//
// `this` refers to the current instance of the class — your show. So
// `this.x` means "the variable x that belongs to this show". Each show has
// its own `this`, so two shows can both have a `this.x` without colliding.
//
// Rule of thumb: if a value must be remembered for the next frame, store it
// on `this`. If it's only used inside one method, a local `let` is fine.
//
//   this.balls = [...];          // survives across frames — use `this.`
//   let dx = ball.vx * 2;        // only used right here — local `let` is fine
//
// Initialize your `this.*` variables in setup(), then read/update them in
// draw() and the input handlers.
// ===========================================================================


class Plain {

  // setup() runs ONCE when this show becomes active.
  // Use it to create your starting state on `this` (e.g. arrays, positions,
  // colors, counters). Do NOT draw the final picture here — drawing belongs
  // in draw().
  setup() {
    // Example:
    // this.x = width / 2;
    // this.y = height / 2;
  }

  // draw() runs every frame (~60 fps). Whatever you draw here is what shows
  // up on the LED billboard for this frame. Start with background(...) if
  // you want a clean slate; otherwise the previous frame stays.
  draw() {
    background('magenta');

    // Example:
    // fill(255);
    // noStroke();
    // circle(this.x, this.y, 10);
  }

  // ---- Optional input + lifecycle hooks ---------------------------------
  // Delete the ones you don't need, or fill them in with your own logic.
  // mx / my are mouse coordinates in LED pixels.

  windowResized() {}      // browser window changed size
  mousePressed(mx, my) {} // mouse button went down
  mouseDragged(mx, my) {} // mouse moved while a button is held
  mouseReleased(mx, my) {}// mouse button went up
  mouseMoved(mx, my) {}   // mouse moved without a button held
  keyPressed(key) {}      // a key went down (`key` is the character)
  keyReleased(key) {}     // a key went up
  cleanup() {}            // runs when the user switches to another show —
                          // stop sounds, clear timers, free big arrays here
}


// Register this show with the framework so it appears in the [Enter] cycle.
// Add the same line at the bottom of every show file you create.
window.shows.push(Plain);
