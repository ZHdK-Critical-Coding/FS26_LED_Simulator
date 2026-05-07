class UI {
  constructor(source, preview) {
    this.source = source;
    this.preview = preview;
    this.frameX = 0;
    this.frameY = 0;
    this.dragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
  }

  setup() {
    this.visible = true;
    this.showCanvas = true;
    let container = createDiv();
    this.container = container;
    container.style('position', 'absolute');
    container.style('top', '10px');
    container.style('right', '10px');
    container.style('z-index', '100');
    container.style('color', '#fff');
    container.style('font-family', 'monospace');
    container.style('font-size', '12px');
    container.style('border', '1px solid rgba(255, 255, 255, 0.4)');
    container.style('padding', '0 10px 10px 10px');
    container.style('backdrop-filter', 'blur(12px)');
    container.style('-webkit-backdrop-filter', 'blur(12px)');
    container.style('border-radius', '6px');

    let handle = createDiv('&#x2630; drag');
    handle.parent(container);
    handle.style('cursor', 'move');
    handle.style('user-select', 'none');
    handle.style('padding', '6px 0');
    handle.style('margin-bottom', '6px');
    handle.style('border-bottom', '1px solid rgba(255, 255, 255, 0.25)');
    handle.style('opacity', '0.7');
    this._enableDrag(container, handle);

    this.exampleLabel = createDiv('example —');
    this.exampleLabel.parent(container);
    this.exampleLabel.style('margin-bottom', '8px');
    this.exampleLabel.style('opacity', '0.85');

    this.pitchSlider = this._addSlider(container, 'Pixel Pitch (mm)', 2, 20, this.preview.pitch, 1);
    this.scaleSlider = this._addSlider(container, 'Screen Adjust (scale)', 1, 5, this.preview.scale, 0.01);
    this.subpixelSlider = this._addSlider(container, 'Subpixel Size', 0.05, 0.45, this.preview.subpixelSize, 0.01);

    this.menuCheckbox = this._addCheckbox(container, 'GUI <span style="color:green;">[m]</span>', this.visible, (checked) => {
      this.visible = checked;
      this.container.style('display', checked ? 'block' : 'none');
    });
    this.fullscreenCheckbox = this._addCheckbox(container, 'Fullscreen <span style="color:green">[f]</span>', false, (checked) => {
      fullscreen(checked);
    });
    this.shaderCheckbox = this._addCheckbox(container, 'LED simulator <span style="color:green">[s]</span>', this.preview.enabled, (checked) => {
      this.preview.enabled = checked;
    });
    this.canvasCheckbox = this._addCheckbox(container, 'LED output <span style="color:green">[l]</span>', this.showCanvas, (checked) => {
      this.showCanvas = checked;
    });
  }

  _enableDrag(container, handle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;

    handle.elt.addEventListener('mousedown', (e) => {
      dragging = true;
      let rect = container.elt.getBoundingClientRect();
      // Switch from right-anchored to left-anchored on first drag
      container.style('right', 'auto');
      container.style('left', rect.left + 'px');
      container.style('top', rect.top + 'px');
      startX = e.clientX;
      startY = e.clientY;
      originX = rect.left;
      originY = rect.top;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      container.style('left', (originX + e.clientX - startX) + 'px');
      container.style('top', (originY + e.clientY - startY) + 'px');
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
    });
  }

  _addCheckbox(container, label, value, onChange) {
    let row = createDiv();
    row.parent(container);
    row.style('margin-bottom', '4px');

    let cb = createCheckbox(label, value);
    cb.parent(row);
    cb.style('color', '#fff');
    cb.changed(() => onChange(cb.checked()));
    return cb;
  }

  toggleFullscreen() {
    let fs = !fullscreen();
    fullscreen(fs);
    this.fullscreenCheckbox.checked(fs);
  }

  toggleShader() {
    this.preview.enabled = !this.preview.enabled;
    this.shaderCheckbox.checked(this.preview.enabled);
  }

  toggleCanvas() {
    this.showCanvas = !this.showCanvas;
    this.canvasCheckbox.checked(this.showCanvas);
  }

  setExample(index, total, name) {
    this.exampleLabel.html(`Example <span style="color:green">[Enter]</span> <span style="color:red">${index + 1}/${total} ${name}</span>`);
  }

  _addSlider(container, label, min, max, value, step) {
    let row = createDiv();
    row.parent(container);
    row.style('margin-bottom', '4px');

    let lbl = createSpan(label);
    lbl.parent(row);
    lbl.style('display', 'inline-block');
    lbl.style('width', '120px');

    let slider = createSlider(min, max, value, step);
    slider.parent(row);
    slider.style('display', 'inline-block');
    slider.style('vertical-align', 'middle');

    let val = createSpan(value);
    val.parent(row);
    val.style('display', 'inline-block');
    val.style('width', '40px');
    val.style('text-align', 'right');

    slider._valueLabel = val;
    return slider;
  }

  _frameSize() {
    let dotSize = this.preview.dotSize;
    let w = Math.min(Math.floor(width / dotSize), this.source.width);
    let h = Math.min(Math.floor(height / dotSize), this.source.height);
    return { w, h };
  }

  mousePressed(mx, my) {
    if (!this.visible) return;
    let f = this._frameSize();
    if (mx >= this.frameX && mx <= this.frameX + f.w &&
        my >= this.frameY && my <= this.frameY + f.h) {
      this.dragging = true;
      this.dragOffsetX = mx - this.frameX;
      this.dragOffsetY = my - this.frameY;
    }
  }

  mouseDragged(mx, my) {
    if (!this.dragging) return;
    let f = this._frameSize();
    this.frameX = constrain(mx - this.dragOffsetX, 0, this.source.width - f.w);
    this.frameY = constrain(my - this.dragOffsetY, 0, this.source.height - f.h);
  }

  mouseReleased() {
    this.dragging = false;
  }

  toggle() {
    this.visible = !this.visible;
    this.container.style('display', this.visible ? 'block' : 'none');
    if (this.menuCheckbox) this.menuCheckbox.checked(this.visible);
  }

  draw() {
    // Update preview from sliders
    this.preview.pitch = this.pitchSlider.value();
    this.preview.scale = this.scaleSlider.value();
    this.preview.dotSize = this.preview.pitch * this.preview.scale;
    this.preview.subpixelSize = this.subpixelSlider.value();

    this.pitchSlider._valueLabel.html(this.pitchSlider.value());
    this.scaleSlider._valueLabel.html(this.scaleSlider.value());
    this.subpixelSlider._valueLabel.html(this.subpixelSlider.value());

    // Sync frame position to preview offset
    this.preview.offsetX = this.frameX;
    this.preview.offsetY = this.frameY;

    // Red frame showing visible LED area
    if (this.visible) {
      let f = this._frameSize();
      this.source.noFill();
      this.source.stroke(255, 0, 0);
      this.source.strokeWeight(1);
      this.source.rect(floor(this.frameX), floor(this.frameY), ceil(f.w), ceil(f.h));
    }

    // Source overlay
    if (this.showCanvas) {
      push();
      translate(-width / 2, -height / 2);
      image(this.source, 0, 0);
      pop();
    }
  }
}
