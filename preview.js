class Preview {
  constructor(pitch, scale, subpixelSize) {
    this.pitch = pitch;
    this.scale = scale;
    this.dotSize = pitch * scale;
    this.subpixelSize = subpixelSize || 0.14;
    this.offsetX = 0;
    this.offsetY = 0;
    this.ledShader = null;
    this.enabled = true;
  }

  setup() {
    // createShader() compiles two programs (vertex + fragment) and links them
    // into a shader program that runs on the GPU. Unlike JavaScript which runs
    // on the CPU once per frame, shader code runs in parallel for every single
    // pixel on screen — that's why it's so fast.
    this.ledShader = createShader(Preview.VERT, Preview.FRAG);
  }

  update(source) {
    if (!this.enabled) return;

    // Activate this shader for all subsequent drawing
    shader(this.ledShader);

    // setUniform() sends data from JavaScript (CPU) to the shader (GPU).
    // Uniforms are read-only constants inside the shader — they stay the same
    // for every pixel in a single draw call. This is how we pass the source
    // image, dimensions, and parameters into the GPU.
    this.ledShader.setUniform('uSource', source);
    this.ledShader.setUniform('uSourceSize', [source.width, source.height]);
    this.ledShader.setUniform('uDotSize', this.dotSize);
    this.ledShader.setUniform('uDisplaySize', [width, height]);
    this.ledShader.setUniform('uSubpixelSize', this.subpixelSize);
    this.ledShader.setUniform('uOffset', [this.offsetX, this.offsetY]);

    // plane() draws a flat rectangle that covers the full canvas.
    // The GPU then runs the fragment shader once for every pixel of this
    // rectangle — each pixel independently computes its own color.
    noStroke();
    plane(width, height);

    // Switch back to p5's default shader so normal drawing works again
    resetShader();
  }
}

// ---------------------------------------------------------------------------
// VERTEX SHADER
// ---------------------------------------------------------------------------
// The vertex shader runs once per vertex (corner) of the plane geometry.
// Its job: transform the 3D position of each vertex into a 2D screen position.
// For our fullscreen plane, this is straightforward — we just apply p5's
// built-in camera/projection matrices.
//
// The key output is vTexCoord: a texture coordinate (0..1) that gets
// automatically interpolated across the surface between vertices. So each
// pixel in the fragment shader receives a unique vTexCoord telling it
// "where on the plane" it is. (0,0) = top-left, (1,1) = bottom-right.
// ---------------------------------------------------------------------------
Preview.VERT = `
// precision mediump float: tells the GPU to use medium precision for
// floating point numbers. Required in GLSL — "mediump" is a good default
// (faster than highp, precise enough for our math).
precision mediump float;

// "attribute" = per-vertex input data, provided by p5's geometry (plane()).
// Each vertex has a 3D position and a 2D texture coordinate.
// These are NOT available in the fragment shader — only here.
attribute vec3 aPosition;
attribute vec2 aTexCoord;

// "uniform" = constant data sent from JavaScript via setUniform().
// p5 automatically provides these two matrices:
// - uModelViewMatrix: positions/rotates the object in the scene
// - uProjectionMatrix: applies perspective/orthographic projection
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

// "varying" = data passed from vertex shader to fragment shader.
// The GPU automatically interpolates this value smoothly between vertices.
// So if vertex A has vTexCoord=(0,0) and vertex B has vTexCoord=(1,0),
// a pixel halfway between gets vTexCoord=(0.5, 0).
varying vec2 vTexCoord;

void main() {
  // Pass texture coordinate through to the fragment shader
  vTexCoord = aTexCoord;
  // Transform vertex position: object space → screen space
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

// ---------------------------------------------------------------------------
// FRAGMENT SHADER
// ---------------------------------------------------------------------------
// The fragment shader runs once per pixel on screen — in parallel on the GPU.
// It has NO knowledge of other pixels. It cannot loop over the image.
// It can only compute the color for its own single pixel based on:
//   - vTexCoord (where am I on the plane?)
//   - uniforms  (shared constants from JavaScript)
//   - texture samples (reading a pixel from an image)
//
// This is fundamentally different from p5/JavaScript where you loop over
// pixels sequentially. Here, millions of pixels compute simultaneously.
// ---------------------------------------------------------------------------
Preview.FRAG = `
precision mediump float;

// vTexCoord arrives interpolated from the vertex shader.
// Range: (0,0) at top-left to (1,1) at bottom-right of the plane.
varying vec2 vTexCoord;

// sampler2D is a texture — the source canvas passed as a uniform.
// We read pixel colors from it using texture2D().
uniform sampler2D uSource;

// Source canvas dimensions in pixels (e.g. 448, 256)
uniform vec2 uSourceSize;

// Size of one LED dot on screen in pixels (pitch * scale)
uniform float uDotSize;

// Display canvas dimensions in pixels (e.g. 1920, 1080)
uniform vec2 uDisplaySize;

// Radius of each R/G/B subpixel circle (0.05..0.45, normalized to cell)
uniform float uSubpixelSize;

// Offset in source pixels — which part of the source to display
uniform vec2 uOffset;

void main() {

  // --- Step 1: Convert normalized texture coordinate to pixel position ---
  // vTexCoord is 0..1, multiply by display size to get actual pixel position.
  vec2 pixel = vTexCoord * uDisplaySize;

  // --- Step 2: Determine which LED cell this pixel belongs to ---
  // floor() rounds down: pixel (25.7, 13.2) with dotSize=12 → cell (2, 1).
  // Each cell corresponds to one pixel in the source canvas.
  // uOffset shifts which region of the source is displayed.
  vec2 cell = floor(pixel / uDotSize) + uOffset;

  // If this cell is outside the source image, output black.
  if (cell.x < 0.0 || cell.y < 0.0 || cell.x >= uSourceSize.x || cell.y >= uSourceSize.y) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // --- Step 3: Compute position WITHIN the current LED cell ---
  // fract() returns only the fractional part (0..1), then shift to -0.5..0.5
  // so (0,0) is the center of the LED dot. This local coordinate system
  // is used for drawing circles and positioning subpixels.
  vec2 local = fract(pixel / uDotSize) - 0.5;
  float dist = length(local);

  // Outside the main LED circle (radius 0.45 of cell): black gap between LEDs
  if (dist > 0.45) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // --- Step 4: Sample the source image color for this LED ---
  // Convert cell index to UV coordinates (0..1) for texture lookup.
  // Adding 0.5 samples the center of the source pixel (avoids edge artifacts).
  vec2 uv = (cell + 0.5) / uSourceSize;

  // texture2D() reads a color from the source image at the given UV position.
  // Returns vec4(r, g, b, a) with values 0.0..1.0
  vec4 col = texture2D(uSource, uv);

  // --- Step 5: Draw three RGB subpixels in a triangle arrangement ---
  // Each subpixel is a small circle at a specific offset from center.
  // "spread" controls how far apart they are (scales with subpixel radius).
  float sr = uSubpixelSize;
  float spread = sr * 1.16;

  // step(edge, x) returns 1.0 if x < edge, else 0.0.
  // So step(distance_to_center, radius) = 1.0 inside the circle, 0.0 outside.
  // This is a hard on/off — no antialiasing, like a real LED.

  // R subpixel: top center of the triangle
  float rDot = step(length(local - vec2(0.0, -spread)), sr);
  // G subpixel: bottom-left (0.866 = sin(60°), triangle geometry)
  float gDot = step(length(local - vec2(-spread * 0.866, spread * 0.5)), sr);
  // B subpixel: bottom-right
  float bDot = step(length(local - vec2(spread * 0.866, spread * 0.5)), sr);

  // Multiply each channel by its subpixel mask:
  // - Where rDot=1, show the red value; where rDot=0, red is off.
  // - This means a white source pixel (1,1,1) lights up all three subpixels,
  //   while a pure red pixel (1,0,0) only lights up the R subpixel.
  vec3 result = vec3(col.r * rDot, col.g * gDot, col.b * bDot);

  // Inside the LED circle but not on any subpixel: dark gray substrate
  if (rDot + gDot + bDot == 0.0) {
    result = vec3(0.1);
  }

  // --- Step 6: Output the final pixel color ---
  // gl_FragColor is the built-in output: the color this pixel will be drawn as.
  // vec4(r, g, b, a) — alpha is always 1.0 (fully opaque).
  gl_FragColor = vec4(result, 1.0);
}
`;
