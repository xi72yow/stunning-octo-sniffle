import MeteorRain from "./meteor";
import DataEmitter from "./network/dataEmitter";
import BouncingBalls from "./bouncingBalls";
import FireFlame from "./fireFlame";
import ColorWheel from "./colorWheel";
import FrostyPike from "./frostyPike";
import DyingLights from "./dyingLights";
import Snake from "./snake";
import SpaceShuttle from "./spaceShuttle";
import Bubbles from "./bubbles";

import setAll from "./basics/setAll";
import setPixel from "./basics/setPixel";

let count = 0;

function createExampleStripe(neopixelCount: number) {
  const stripe = setAll(0, 0, 0, neopixelCount);

  for (let index = 0; index < neopixelCount; index++) {
    if (index < neopixelCount / 2) {
      setPixel(index, stripe, 255, 187, 0);
    } else setPixel(index, stripe, 175, 0, 105);
  }
  return stripe;
}

/* const DyingLightEffect = new DyingLights(120);
const MeteorRainEffect = new MeteorRain(155, 25, 200, 5, 20, 100, 120, true);
const FireFlameEffect = new FireFlame(150, 30, 120);
const BouncingBallsEffect = new BouncingBalls(255, false, 10, 3, 120);
const ColorWheelEffect = new ColorWheel(2, 120);
const FrostyPikeEffect = new FrostyPike(createExampleStripe(120), 5, 120); */
/* const SnakeEffect = new Snake({
  neopixelCount: 113,
  maxSnakeSize: 20,
  red: 12,
  green: 255,
  blue: 0,
  appleCount: 5,
  speed: 1,
  rainbow: true,
}); */

/* const SpaceShuttleEffect = new SpaceShuttle({
  neopixelCount: 113,
  maxSnakeSize: 20,
  red: 12,
  green: 255,
  blue: 0,
  appleCount: 5,
  speed: 1,
  rainbow: true,
}); */

const ChristmasEffect = new Bubbles({
  neopixelCount: 114,
  maxParticles: 25,
  fadeValue: 5,
});

const MeteorRainEffect = new MeteorRain({
  red: 155,
  green: 3,
  blue: 255,
  meteorSize: 2,
  meteorTrailDecay: 64,
  meteorRandomDecay: 10,
  rainbow: true,
  neopixelCount: 114,
});

/* const BouncingBallsEffect = new BouncingBalls({
  ballMode: "fixed",
  mirrored: true,
  tail: 10,
  ballCount: 2,
  neopixelCount: 114,
  baseStripe: null,
}); */

async function main() {
  const DataEmitterForIP = new DataEmitter(true, "192.168.2.113");
  //await DataEmitterForIP.init();
  setInterval(() => {
    count++;
    if (count % 60 === 0) {
      DataEmitterForIP.logHealth();
      DataEmitterForIP.logMaxPower();
    }
    DataEmitterForIP.emit(ChristmasEffect.render());
  }, 110);
}

main();
