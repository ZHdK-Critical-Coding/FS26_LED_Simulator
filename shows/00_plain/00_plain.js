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
// THE `led` GLOBAL — read this carefully
// ---------------------------------------------------------------------------
// `led` is NOT the screen you see in your browser window. It is a small,
// hidden off-screen canvas whose size matches the LED billboard
// (e.g. 448 × 256 pixels — one pixel per physical LED). The framework then
// reads this small canvas and renders it as the simulated LED panel you see.
//
// This means: ALL of your drawing must go to `led`, not to the main canvas.
//
//   GOOD:  led.background(0)        led.fill(255, 0, 0)
//          led.circle(20, 20, 10)   led.rect(5, 5, 30, 30)
//
//   BAD :  background(0)            fill(255, 0, 0)
//          circle(20, 20, 10)       rect(5, 5, 30, 30)
//
// The "bad" calls would draw on the main browser canvas — invisible behind
// the simulation, and ignored by the LED preview. Always prefix p5 drawing
// calls with `led.` inside this class.
//
// `led` is a p5.Graphics object, which means every p5 drawing function works
// on it: led.fill, led.stroke, led.circle, led.rect, led.line, led.image,
// led.push / led.pop, led.translate, led.rotate, led.text, led.blendMode, ...
// You can also read led.width and led.height to know the panel size.
//
// Math/utility functions like random(), constrain(), map(), sin(), millis()
// are NOT drawing functions — they don't go through `led`. Just call them
// directly.
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
//     draw()  { this.x = this.x + 1; led.circle(this.x, 50, 10); }
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
    // this.x = led.width / 2;
    // this.y = led.height / 2;
  }

  // draw() runs every frame (~60 fps). Whatever you draw on `led` here is
  // what shows up on the LED billboard for this frame.
  //
  // Note: the framework already clears `led` to black before draw() runs,
  // so unless you want a different background, you don't need to clear it
  // yourself. If you want a solid colour, call led.background(...).
  draw() {
    led.background('magenta');

    // Example:
    // led.fill(255);
    // led.noStroke();
    // led.circle(this.x, this.y, 10);
  }

  // ---- Optional input + lifecycle hooks ---------------------------------
  // Delete the ones you don't need, or fill them in with your own logic.
  // mx / my are mouse coordinates in main-canvas pixels (NOT led pixels).

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
