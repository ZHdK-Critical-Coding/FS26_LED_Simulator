// ===========================================================================
// CHAT EXAMPLE — talks to an OpenAI-compatible chat server
// ===========================================================================
//
// The LED billboard becomes a little self-talking screen. It asks an
// OpenAI-compatible HTTP API for a piece of text, prints the answer, then
// turns that answer back into the next question ("What do you think about
// this: `...`") and repeats — roughly every 10 seconds.
//
// Endpoint:   http://brian3.byod.zhdk.ch:8000/v1
// Auth:       none (the server is on the ZHdK network and does not require
//             an API key)
//
// ---------------------------------------------------------------------------
// HOW IT FITS INTO THE FRAMEWORK
// ---------------------------------------------------------------------------
// Just like the other shows, this is a class with setup() / draw() / cleanup().
// The simulator is 448×256 LED pixels — `width` and `height` reflect that.
// Drawing is plain p5 (no `led.` prefix).
//
// The network request is asynchronous. We never `await` inside draw(); we
// kick off a fetch() and stash the result on `this` when it eventually
// resolves. draw() simply renders whatever the latest state is — "thinking…",
// the current answer, or an error.
//
// We reuse the 04B_30 pixel font from the 02_pixel_font show, so make sure
// that folder still exists alongside this one.
// ===========================================================================


// --- Configuration ---------------------------------------------------------
// The server is a vLLM instance running Qwen/Qwen3-Coder-Next-FP8.
// Sampling params mirror the Continue (VSCode) config used against the same
// endpoint so behaviour stays consistent.

const CHAT_ENDPOINT    = 'http://brian3.byod.zhdk.ch:8000/v1/chat/completions';
const CHAT_MODEL       = 'Qwen/Qwen3-Coder-Next-FP8';
const CHAT_CYCLE_MS    = 10000;    // pause after an answer before re-asking
const CHAT_MAX_CHARS   = 128;      // truncate answers to this many characters
const CHAT_MAX_TOKENS  = 80;       // ~roughly 128 chars; we also hard-trim
const CHAT_TEMPERATURE = 0.7;
const CHAT_TOP_P       = 0.8;
const CHAT_TOP_K       = 20;       // vLLM extension, sent as a top-level field

const CHAT_FONT_PX     = 17;       // glyph height in LED pixels — fixed
const CHAT_THINK_PX    = CHAT_FONT_PX * 3;
const CHAT_THINK_MIN_MS = 5000;    // hold "THINKING…" on screen at least this long

// We ask the model itself to stay under the limit; truncation is the safety net.
const CHAT_LENGTH_RULE =
  ' Answer in a single sentence, plain text, at most ' + CHAT_MAX_CHARS + ' characters.';


class Chat_Example {

  async setup() {
    this.font           = null;
    this.question       = 'Tell me something I don\'t know';
    this.answer         = '';
    this.status         = 'loading font…';
    this.pending        = false;     // true while a fetch is in flight
    this.askedAt        = 0;         // millis() when the current request was sent
    this.answerArrivedAt = 0;        // millis() when the latest answer came back
    this.aborted        = false;     // set on cleanup() so late replies are ignored

    loadFont('shows/02_pixel_font/04B_30__.TTF', (f) => {
      this.font = f;
      this.ask(this.question);
    });
  }


  // Fire one chat request. The answer (or an error message) is written to
  // this.answer when the response arrives. We do NOT await this from draw();
  // draw() just keeps polling this.answer.
  async ask(prompt) {
    if (this.pending || this.aborted) return;
    this.pending  = true;
    this.askedAt  = millis();
    this.question = prompt;
    this.answer   = '';
    this.status   = 'thinking…';

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:       CHAT_MODEL,
          max_tokens:  CHAT_MAX_TOKENS,
          temperature: CHAT_TEMPERATURE,
          top_p:       CHAT_TOP_P,
          top_k:       CHAT_TOP_K,
          messages:    [{ role: 'user', content: prompt + CHAT_LENGTH_RULE }],
        }),
      });
      if (!res.ok) {
        throw new Error('HTTP ' + res.status + ' ' + res.statusText);
      }
      const data = await res.json();
      if (this.aborted) return;

      const text = data && data.choices && data.choices[0]
                 && data.choices[0].message && data.choices[0].message.content;
      let trimmed = (text || '(empty response)').trim();
      if (trimmed.length > CHAT_MAX_CHARS) {
        trimmed = trimmed.slice(0, CHAT_MAX_CHARS - 1) + '…';
      }
      this.answer = trimmed;
    } catch (e) {
      if (this.aborted) return;
      this.answer = '(network error)';
      this.status = String(e && e.message || e);
    } finally {
      
      this.answerArrivedAt = millis();
      this.t1 = setTimeout(() => {
        this.pending         = false;
        this.status = 'answered';
        this.t2 = setTimeout(() => {
          this.ask('What do you think about this: `' + this.answer + '`')
        }, CHAT_CYCLE_MS)
      }, 5000 - (this.answerArrivedAt - this.askedAt))
    }
  }


  draw() {
    background(0);
    if (!this.font) return;

    textFont(this.font);
    noStroke();

    const half = floor(width / 2);
    const pad  = 4;

    // ── "THINKING…" overlay, centered, blinking. Held at least 5 s so the
    //    audience sees it even when the server replies almost immediately. ─

    if (this.pending) {
      const dots  = '.'.repeat(1 + (floor(millis() / 400) % 3));
      const label = ('thinking' + dots).toUpperCase();
      fill(0, 0, 0, 200);
      rect(0, 0, width, height);
      fill(255, 200, 0);
      textSize(CHAT_THINK_PX);
      textAlign(CENTER, CENTER);
      text(label, width / 2, height / 2);
    } 

    // ── Left half: Question ──────────────────────────────────────────────
    fill(80, 200, 255);
    textSize(CHAT_FONT_PX);
    textAlign(LEFT, TOP);
    text(this.question.toUpperCase(), pad, pad, half - pad * 2, height - pad * 2);

    // ── Right half: Answer (always rendered; hidden under overlay below) ─
    if (this.status === "answered") {
      fill(255);
      textSize(CHAT_FONT_PX);
      textAlign(LEFT, TOP);
      text(this.answer.toUpperCase(), half + pad, pad, half - pad * 2, height - pad * 2);
    }
  }


  // Called when the user switches to another show. We can't actually cancel
  // an in-flight fetch with plain p5, but we set a flag so its late .then()
  // will not touch our state any more.
  cleanup() {
    this.aborted = true;
    clearTimeout(this.t1);
    clearTimeout(this.t2);
  }


  // ---- Optional input + lifecycle hooks ---------------------------------
  windowResized() {}
  mousePressed(mx, my) {}
  mouseDragged(mx, my) {}
  mouseReleased(mx, my) {}
  mouseMoved(mx, my) {}
  keyPressed(key) {}
  keyReleased(key) {}
}


window.shows.push(Chat_Example);
