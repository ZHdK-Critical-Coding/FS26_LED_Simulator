// ===========================================================================
// PIXEL FONT
// ===========================================================================
// Type letters/digits/space to extend the string, Backspace to delete.
// (Enter is reserved by the framework to switch shows.)
//
// Asset: 04B_30 — a free 5px pixel font by Yuji Oshimoto.
// Loaded with p5's loadFont() into `this.font` so we can pass it to
// textFont(). Loading is asynchronous, so we guard draw() with an early
// return until the font is ready.
//
//
// For non-antialiased font rendering on osx:
// - Open Terminal
// - Type: defaults -currentHost write -g AppleFontSmoothing -int 0 (disable font smoothing)
// - Type: defaults -currentHost write -g AppleFontSmoothing -int 1 (enable font smoothing)
//
// ===========================================================================

const pixelFontDefault = 17;

class Pixel_Font {
  setup() {
    this.text = 'CRITICAL';
    this.size = pixelFontDefault * 4;          // glyph size in led pixels
    this.font = null;
    loadFont('shows/02_pixel_font/04B_30__.TTF', (f) => {
      this.font = f;
    });
  }

  draw() {
    background(0);
    if (!this.font) return;
    textFont(this.font);
    textSize(this.size);
    textAlign(CENTER, TOP);
    stroke(0, 0, 255);
    strokeWeight(1);
    for (let index = 0; index < width / 2; index += 4) {
      line(index + .5, 0, index + .5, height);
    }
    stroke(0, 255, 0);
    for (let index = 0; index < height; index += 4) {
      line(width / 2, index + .5, width, index + .5);
    }
    stroke(255, 0, 0);
    line(0, 0, width, height);
    line(0, height, width, 0);

    noStroke();
    if (frameCount % 12 < 6) {
      fill(0);
    } else {
      fill(255);
    }

    text(this.text || '', 4 + floor(width / 2), floor((height - this.size) / 2));
  }

  keyPressed(k) {
    if (k === 'ArrowUp') this.size *= 2;
    if (k === 'ArrowDown') this.size = this.size > pixelFontDefault ? this.size / 2 : pixelFontDefault;
    if (k === 'Backspace') {
      this.text = this.text.slice(0, -1);
    } else if (typeof k === 'string' && k.length === 1) {
      this.text += k.toUpperCase();
    }
  }

  windowResized() {}
  mousePressed(mx, my) {}
  mouseDragged(mx, my) {}
  mouseReleased(mx, my) {}
  mouseMoved(mx, my) {}
  keyReleased(key) {}
  cleanup() {}
}


window.shows.push(Pixel_Font);
