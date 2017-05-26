/**
 * shrine.js
 *
 * LEDstrip plugin
 *
 */

function Shrine (ledstrip, opts) {
    opts = opts || {};
    this.ledstrip = ledstrip;
    this.ledstrip.clear();
    this.direction = 1;
    this.color = opts.color || [255,0,0]; // default to red
    this.speed = opts.speed || 3; // run every Nth tick? 1 == full speed
    this.spread = opts.spread || 3; // spread N pixels on either side
    // tick counter
    this.t = 0;
    this.NUM_LEDS = 100;

    this.currentSpread = 0; // for sun spread fader
    this.shootStar = false;
    this.starPos = 0;

    this.waveTimer = 0;
    this.direction = 1;

    this.hour = (new Date()).getHours();
    this.minute = (new Date()).getMinutes();

    return this;
}

Shrine.prototype.init = function() {return this;}

Shrine.prototype.setColor = function(color) { this.color = color; return this; }
Shrine.prototype.setSpeed = function(speed) { this.speed = speed; return this; }
Shrine.prototype.setSpread = function(spread) { this.spread = spread; return this; }
Shrine.prototype.setPosition = function(pos) { this.position = pos; return this; }

Shrine.prototype.setDirection = function(dir) {
    if (dir >= 0) {
        this.direction = 1;
    } else {
        this.direction = -1;
    }
    return this;
}

Shrine.prototype.shootingStar = function (pos) {
    if (!this.shootStar) return;

    var spread_size = 10;
    var divider = 10;
    var star_color = [255, 210, 150];
    this.ledstrip.buffer[this.starPos] = [255, 255, 255];
    for (i = 0; i < (255 / divider); i++) {
        this.ledstrip.buffer[this.starPos - i] = [
            star_color[0] - (i * divider),
            star_color[1] - (i * divider),
            star_color[2] - (i * divider)];
    }
    this.starPos++;

    if (this.starPos == pos + spread_size + Math.floor(255 / divider)) {
        this.currentSpread = 0;
    }
    if (this.starPos == this.NUM_LEDS + Math.floor(255 / divider)) {
        this.starPos = 0;
        this.shootStar = false;
    }
    
}

Shrine.prototype.map2PI = function(tick) {
    return Math.PI * 2 * tick / this.ledstrip.size();
}

/**
 * scale values [-1.0, 1.0] to [0, 255]
 */
Shrine.prototype.scale = function (val) {
    val += 1;       // bump up to a zero base: [0, 2]
    val *= 255/2;   // scale up

    return Math.floor(val); // return int
}

Shrine.prototype.wave = function (tick) {
    if (this.waveTimer == 0) return;
    if ((new Date()).valueOf() - this.waveTimer >= 5000) {
        this.ledstrip.clear();
        this.currentSpread = 0;
        this.runPulse = false;
        this.waveTimer = 0;
        return;
    }

    var i, j, rsin, gsin, bsin, size = this.ledstrip.size(), offset = this.map2PI(tick);

    if (Math.random() > .999)  this.direction *= -1; // All skate, reverse direction!

    for (i = 0; i < size; i++) {
        /**
         * Generate some RGBs, range [-1, +1]
         * If you think about the LED strip as a unit circle, with 
         * circumference 2 PI, then angle between the LEDs is simply
         *   2 PI / count 
         * And the angle for any particular LED will be
         *   (2 PI / count) * position
         * That's what the map2PI() method does.
         */

        j = this.map2PI(i * this.direction) + offset;       // calculate angle
        rsin = Math.sin(j);                                 // sin(t)
        gsin = Math.sin(2 * j / 3 + this.map2PI(size / 6)); // sin(2/3 t + 1/3 PI)
        bsin = Math.sin(4 * j / 5 + this.map2PI(size / 3)); // sin(4/5 t + 2/3 PI)

        this.ledstrip.buffer[i] = [this.scale(rsin), this.scale(gsin), this.scale(bsin)];
    }
}

/*
The sun function creates a sun for a pixel, with a spread fading away.
We calculate the position of the sun from the hour
 */
Shrine.prototype.sun = function(currTime, sun_color, tick) {
    if (!(tick % this.speed == 0)) return; // speed control

    var hour = currTime.getHours();
    var minute = currTime.getMinutes();

    var pos = Math.floor(hour * (this.NUM_LEDS / 24));
    // number of pixels to spread the sun out on either side
    var spread_size = 10;
    // spread the sun center
    if (this.currentSpread < spread_size) {
        // Set the center of the sun
        this.ledstrip.buffer[pos] = sun_color;
        for (i = 1; i < this.currentSpread; i++) {
            scol = [
                Math.floor(sun_color[0] * ((this.currentSpread + 1 - i) / (this.currentSpread + 1))),
                Math.floor(sun_color[1] * ((this.currentSpread + 1 - i) / (this.currentSpread + 1))),
                Math.floor(sun_color[2] * ((this.currentSpread + 1 - i) / (this.currentSpread + 1)))
            ];

            this.ledstrip.buffer[(pos + i) % this.NUM_LEDS] = scol;
            this.ledstrip.buffer[(pos + this.NUM_LEDS - i) % this.NUM_LEDS] = scol;
        }
        this.currentSpread++;
    }
    if (minute - this.minute >= 1) { this.shootStar = true; console.log(minute); }
    if (hour - this.hour >= 1) { this.waveTimer = currTime.valueOf(); this.shootStar = false; console.log(hour); } // don't shoot the star while the color wave is going
    this.shootingStar(pos);
    this.wave(tick);
    

    // update the time keepers
    this.hour = hour;
    this.minute = minute;

    return this;
}

Shrine.prototype.animate = function () {
    animation = requestAnimationFrame(this.animate.bind(this)); // preserve our context
    var currTime = new Date();
    var sun_color = [253, 184, 1];
    this.sun(currTime, sun_color, this.t++);
    this.ledstrip.send(); // update strip
}
