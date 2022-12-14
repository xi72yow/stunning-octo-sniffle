import DataEmitter from "../network/dataEmitter.js";
import MeteorRain from "../meteor.js";
import BouncingBalls from "../bouncingBalls.js";
import FireFlame from "../fireFlame.js";
import ColorWheel from "../colorWheel.js";
import FrostyPike from "../frostyPike.js";
import DyingLights from "../dyingLights.js";
import Snake from "../snake.js";
import Bubbles from "../bubbles.js";
import Animation from "../animation.js";
import { hexToRgb } from "../basics/convertRgbHex.js";
import setAll from "../basics/setAll.js";

class Manager {
  constructor(options) {
    this.intervals = [];
    this.runningEffects = [];
    this.emitters = [];
    this.configs = [];
    this.debounce = null;
    this.framerate = 9.8;
  }

  prepareBaseStipe(stripeFromUi) {
    return stripeFromUi.map((color) => color.replace("#", ""));
  }

  deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (const key of keys1) {
      const val1 = object1[key];
      const val2 = object2[key];
      const areObjects = this.isObject(val1) && this.isObject(val2);
      if (
        (areObjects && !this.deepEqual(val1, val2)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false;
      }
    }
    return true;
  }

  isObject(object) {
    return object != null && typeof object === "object";
  }

  setDebouncedConfigs(newConfigs) {
    if (this.debounce) {
      clearTimeout(this.debounce);
    }
    this.debounce = setTimeout(() => {
      this.setConfigs(newConfigs);
      this.debounce = null;
    }, 1000);
  }

  setConfigs(newConfigs) {
    if (!newConfigs) return;
    newConfigs.forEach((newConfig) => {
      const knownConfigIndex = this.configs.findIndex((config) => {
        return config.device.ip === newConfig.device.ip;
      });
      if (knownConfigIndex > -1) {
        if (!this.deepEqual(this.configs[knownConfigIndex], newConfig)) {
          this.configs[knownConfigIndex] = newConfig;
          this.setAnimation(knownConfigIndex, newConfig);
        }
      } else {
        this.configs.push(newConfig);
        this.setAnimation(knownConfigIndex, newConfig);
      }
    });
  }

  setAnimation(foundIndex, config) {
    const neopixelCount = config.device.neoPixelCount;
    const index = foundIndex === -1 ? this.runningEffects.length : foundIndex;
    clearInterval(this.intervals[index]);

    if (foundIndex === -1) {
      this.emitters.push(new DataEmitter(false, config.device.ip));
      this.runningEffects.push(null);
      this.intervals.push(setInterval(() => {}, 1000));
    }

    switch (config.task.taskCode) {
      case "meteorRain":
        const { meteorRain } = config;
        const {
          r: red,
          g: green,
          b: blue,
        } = hexToRgb(meteorRain.meteorColor.substring(1));
        this.runningEffects[index] = new MeteorRain({
          ...meteorRain,
          neopixelCount,
          red,
          green,
          blue,
        });
        break;

      case "bouncingBalls":
        const { bouncingBalls } = config;
        this.runningEffects[index] = new BouncingBalls({
          ...bouncingBalls,
          neopixelCount,
          baseStripe: this.prepareBaseStipe(bouncingBalls.baseStripe),
        });
        break;

      case "fireFlame":
        const { fireFlame } = config;
        this.runningEffects[index] = new FireFlame({
          ...fireFlame,
          neopixelCount,
        });
        break;

      case "colorWheel":
        const { colorWheel } = config;
        this.runningEffects[index] = new ColorWheel({
          ...colorWheel,
          neopixelCount,
        });
        break;

      case "frostyPike":
        const { frostyPike } = config;
        this.runningEffects[index] = new FrostyPike({
          ...frostyPike,
          neopixelCount,
          baseStripe: this.prepareBaseStipe(frostyPike.baseStripe),
        });
        break;

      case "dyingLights":
        const { dyingLights } = config;
        this.runningEffects[index] = new DyingLights({
          ...dyingLights,
          neopixelCount,
        });
        break;

      case "snake":
        const { snake } = config;
        this.runningEffects[index] = new Snake({
          ...snake,
          neopixelCount,
        });
        break;

      case "bubbles":
        const { bubbles } = config;
        this.runningEffects[index] = new Bubbles({
          ...bubbles,
          neopixelCount,
        });
        break;

      case "animation":
        const { animation } = config;
        this.runningEffects[index] = new Animation({
          ...animation,
          neopixelCount,
        });
        break;

      case "chaser":
        this.runningEffects[index] = null;
        return;

      case "staticLight":
        const { staticLight } = config;
        this.runningEffects[index] = null;
        this.emitters[index].emit(
          this.prepareBaseStipe(staticLight.baseStripe)
        );
        return;

      default:
        break;
    }

    this.start(index);
  }

  startAll() {
    this.runningEffects.forEach((effect, index) => {
      this.start(index);
    });
  }

  sendChasingStripe(stripe, ip) {
    this.configs.findIndex((conf, index, array) => {
      if (conf.device.ip === ip) {
        if (conf.task.taskCode === "chaser") this.emitters[index].emit(stripe);
      }
    });
  }

  start(index) {
    const that = this;
    if (this.runningEffects[index] !== null) {
      this.intervals[index] = setInterval(() => {
        that.emitters[index].emit(that.runningEffects[index].render());
      }, this.calculateMillis());
    } else if (this.configs[index].task.taskCode === "staticLight") {
      const { staticLight } = this.configs[index];
      this.emitters[index].emit(this.prepareBaseStipe(staticLight.baseStripe));
    }
  }

  calculateMillis() {
    return parseInt(1000 / this.framerate);
  }

  stopAll() {
    this.intervals.forEach((interval) => clearInterval(interval));
  }

  lightsOff() {
    this.stopAll();
    this.emitters.forEach((emitter, i) => {
      const neoPixelCount = this.configs[i].device.neoPixelCount;
      emitter.emit(setAll(0, 0, 0, neoPixelCount));
    });
  }
}

export default Manager;
