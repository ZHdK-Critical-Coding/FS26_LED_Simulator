class Bouncy_Balls {
  setup() {
    this.balls = [
      { x: 0, y: 0, vx: 1.5, vy: 1.2, color: [255, 0, 0], radius: 40 },
      { x: 0, y: 0, vx: -1.3, vy: 1.7, color: [0, 0, 255], radius: 50 },
      { x: 0, y: 0, vx: 1.1, vy: -1.4, color: [0, 255, 0], radius: 60 }
    ];
    for (let ball of this.balls) {
      ball.x = random(ball.radius, led.width - ball.radius);
      ball.y = random(ball.radius, led.height - ball.radius);
    }
  }

  draw() {
    led.blendMode(DIFFERENCE);
    led.noStroke();
    for (let ball of this.balls) {
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x - ball.radius < 0 || ball.x + ball.radius > led.width) ball.vx *= -1;
      if (ball.y - ball.radius < 0 || ball.y + ball.radius > led.height) ball.vy *= -1;

      ball.x = constrain(ball.x, ball.radius, led.width - ball.radius);
      ball.y = constrain(ball.y, ball.radius, led.height - ball.radius);

      led.fill(ball.color[0], ball.color[1], ball.color[2]);
      led.circle(ball.x, ball.y, ball.radius * 2);
    }
    led.blendMode(BLEND);
  }

}


// This registers the show...
window.shows.push(Bouncy_Balls)