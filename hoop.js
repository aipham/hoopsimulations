function Hoop(ledstrip, mode, colors) {
	this.ledstrip = ledstrip;
    this.t = 0;		// tick counter
    this.NUM_LEDS = this.ledstrip.buffer.length;
    this.mode = mode ? mode : 0;
    this.colors = colors ? colors : 0;

    this.on = true; // blinking
    this.pos = 0; // gradient cycle
    this.bouncers = []; // bounce tracker

    this.colorPalette = [];
    return this;
}

function Bouncer(color, start, direction, limit) {
	this.limit = limit;

	this.color = color;
	this.direction = direction; // false = left, true = right
	this.pos = start;
	this.speed = Math.floor(Math.random() * 5) + 3;
}

Bouncer.prototype.changeDirection = function () {
	this.direction = !this.direction;
}

Bouncer.prototype.step = function () {
	if (this.direction) {
		this.pos++;
	} else this.pos--;
	if (this.pos >= this.limit) this.pos = 0;
	if (this.pos < 0) this.pos = this.limit - 1;
}

Hoop.prototype.init = function () {
	return this;
}

Hoop.prototype.static = function () {
	var c = 0;
	for (i = 0; i < this.NUM_LEDS; i++) {
		this.ledstrip.buffer[i] = this.colorPalette[c];
		c++;
		if (c == this.colorPalette.length) c = 0;
	}
}
Hoop.prototype.bounce = function () {
	// initialize the bouncers
	if (this.bouncers.length == 0) {
		for (i in this.colorPalette) {
			var b = new Bouncer(this.colorPalette[i], Math.floor(Math.random() * this.NUM_LEDS), Math.random() > 0.5, this.NUM_LEDS);
			this.bouncers.push(b);
		}
	}

	// move the bouncers
	for (i in this.bouncers) {
		var b = this.bouncers[i];
		if (!(this.t % b.speed == 0)) continue;
		b.color = this.colorPalette[i];
		this.ledstrip.buffer[b.pos] = b.color;
		var spread = this.NUM_LEDS / this.colorPalette.length;
		if (b.direction) {
			for (j = 1; j < spread; j++)
			{
				if (b.pos - j >= 0) {
					this.ledstrip.buffer[b.pos - j] = [
						b.color[0] + Math.floor(j * (255 - b.color[0]) / spread),
						b.color[1] + Math.floor(j * (255 - b.color[1]) / spread),
						b.color[2] + Math.floor(j * (255 - b.color[2]) / spread)
					];
				}
			}

		} else {
			for (j = 1; j < spread; j++)
			{
				if (b.pos + j >= 0) {
					this.ledstrip.buffer[b.pos + j] = [
						b.color[0] + Math.floor(j * (255 - b.color[0]) / spread),
						b.color[1] + Math.floor(j * (255 - b.color[1]) / spread),
						b.color[2] + Math.floor(j * (255 - b.color[2]) / spread)
					];
				}
			}
		}



		b.step();
	}

}

Hoop.prototype.racer = function () {
	if (!(this.t % 5 == 0)) return;
	var c = 0;
	if (this.pos == this.NUM_LEDS) this.pos = 0;
	for (i = 0; i < this.NUM_LEDS; i++) {
		if (i == this.pos) {
			this.ledstrip.buffer[i] = this.colorPalette[c];	
		}
		else this.ledstrip.buffer[i] = [0,0,0];
		c++;
		if (c == this.colorPalette.length) c = 0;
		
	}
	this.pos++;
}

Hoop.prototype.colorwave = function () {
	if (!(this.t % 5 == 0)) return;
	var start = this.colorPalette[0];
	var end = this.colorPalette[1];
	var c = 1;
	var spread = Math.floor(this.NUM_LEDS / this.colorPalette.length);
	var grad = 0;
	for (i = 0; i < this.NUM_LEDS; i++) { 
		var p = i + this.pos;
		if (p >= this.NUM_LEDS) {
			p = p - this.NUM_LEDS;
		}
		this.ledstrip.buffer[p] = [
			Math.floor(start[0] + ((end[0] - start[0]) * (grad / spread))),
			Math.floor(start[1] + ((end[1] - start[1]) * (grad / spread))),
			Math.floor(start[2] + ((end[2] - start[2]) * (grad / spread)))
		];
		grad++;
		if (i >= spread * c) {
			start = this.colorPalette[c];
			end = this.colorPalette[c + 1];
			if (c == this.colorPalette.length - 1) {
				end = this.colorPalette[0];
			}
			grad = 0;
			c++;
		}
	}
	this.pos++;
	if (this.pos == this.NUM_LEDS - 1) this.pos = 0;
}

Hoop.prototype.loop = function (tick) {
	//this.ledstrip.clear();
	this.setPalette();
	switch (this.mode) {
		case 0:
			this.static();
			break;
		case 1:
			this.racer();
			break;
		case 2:
			this.colorwave();
			break;
		case 3:
			
			this.bounce();
			break;
		case 4:
			this.ledstrip.clear();
			break;
		default:
			this.mode = 0;
			this.loop();
			break;
	}
	return this;
}

Hoop.prototype.off = function () {
	this.ledstrip.clear();
	this.ledstrip.send();
}

Hoop.prototype.nextMode = function () {
	this.ledstrip.clear();
	this.bouncers = [];
	this.on = true; // blinking
    this.pos = 0; // gradient cycle
	this.mode++;
}

Hoop.prototype.nextColor = function () {
	this.colors++;
}

Hoop.prototype.setPalette = function () {
	switch (this.colors) {
		case 0:
		//FIRE
			this.colorPalette = [
				[242,227,7],
				[242,185,12],
				[242,120,12],
				[242,96,12],
				[242,38,19]
			]
			break;
		case 1:
		// FOREST
			this.colorPalette = [
				[0,242,132],
				[48,237,234],
				[255,254,241],
				[247,228,1],
				[0,229,39]
			]
			break;
		case 2:
		// OCEAN
			this.colorPalette = [
				[14,234,255],
				[21,169,250],
				[27,118,255],
				[28,63,253],
				[44,29,255]
			]
			break;
		case 3:
		// PINK PURPLE
			this.colorPalette = [
				[255,94,158],
				[228,88,232],
				[195,97,255],
				[126,88,232],
				[91,105,255]
			]
			break;
		case 4:
		// BASICS
			this.colorPalette = [
				[255,0,0],
				[0,255,0],
				[0,0,255],
				[255,255,0],
				[255,0,255]
			]
			break;
		default:
			this.colors = 0;
			this.setPalette();
			break;
	}
}

Hoop.prototype.animate = function () {
	animation = requestAnimationFrame(this.animate.bind(this)); // preserve our context
    this.loop(this.t++);
    this.ledstrip.send(); // update strip
}