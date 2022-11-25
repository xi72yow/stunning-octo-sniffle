import setPixel from "./basics/setPixel.js";
import random from "./basics/random.js";
import setAll from "./basics/setAll.js";

class FrostyPike {
  constructor(options) {
    const { baseStripe, delay, neopixelCount } = options;
    this.count = 0;
    this.baseStripe = baseStripe ? baseStripe : setAll(0, 0, 0, neopixelCount);
    this.stripe = this.baseStripe;
    this.neopixelCount = neopixelCount;
    this.delay = delay;
    this.delayCount = 0;
  }

  render() {
    this.stripe = [...this.baseStripe];
    let pixel = random(this.neopixelCount);
    if (this.delayCount % this.delay === 0) {
      this.stripe = setPixel(pixel, this.stripe, 255, 255, 255);
      return this.stripe;
    }
    this.delayCount++;
    return this.baseStripe;
  }

  getIdentifier() {
    return "frostyPike";
  }
}

export default FrostyPike;
