import Match from "./Match";

import { v4 as uuidv4 } from "uuid";

const MATCH_SIZE_TO_SCALE = {
  s: 1,
  m: 2,
  l: 4,
};

const MATCH_BASE_ALPHA = 0.65;
const MATCH_BASE_WIDTH = 10;
const MATCH_BASE_MARGIN = 5;

const SWAP_BASE_SPEED = 3500;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Matchbox {
  constructor(canvasWidth, canvasHeight, matchSize, matchColor) {
    this._matchBaseColor = matchColor;
    this._matchWidth = MATCH_BASE_WIDTH * MATCH_SIZE_TO_SCALE[matchSize];
    this._matches = [];
    this._matchSchedulers = [];
    this._schedulers = [];

    const nrOfMatches = Math.floor(
      canvasWidth / (this._matchWidth + MATCH_BASE_MARGIN)
    );
    for (let i = 0; i < nrOfMatches; i++) {
      const matchValue = getRandomInt(1, canvasHeight - 30);
      const m = new Match(
        i * this._matchWidth + i * MATCH_BASE_MARGIN,
        0,
        this._matchWidth,
        matchValue,
        this._matchBaseColor,
        MATCH_BASE_ALPHA,
        uuidv4(),
        matchValue,
        this.addMatchScheduler.bind(this)
      );
      this._matches.push(m);
    }
  }

  addMatchScheduler(type, handle) {
    this._matchSchedulers.push({ type, handle, id: uuidv4() });
  }

  clearMatchSchedulers() {
    this._matchSchedulers.forEach((ms) => {
      const { type, handle } = ms;
      if (type === "interval") clearInterval(handle);
      else if (type === "timeout") clearTimeout(handle);
    });
    this._matchSchedulers = [];
  }

  hasSchedulers() {
    return this._schedulers.length > 0;
  }

  addScheduler(type, args, i1, i2) {
    const sId = uuidv4();
    this._schedulers.push({ type, args, id: sId, i1, i2 });
    return sId;
  }

  removeScheduler(id) {
    const sId = this._schedulers.findIndex((s) => s.id === id);
    if (sId !== 1) {
      this._schedulers.splice(sId, 1);
      return true;
    }
    return false;
  }

  async initPastSchedulers() {
    const pastSchedulers = [...this._schedulers];
    for (const pastScheduler of pastSchedulers) {
      const { type, args, id, i1, i2 } = pastScheduler;
      if (type === "animateSwap") {
        const [match1X, match1Y] = i1;
        const [match2X, match2Y] = i2;
        const m1 = this.getMatch(args[0]);
        const m2 = this.getMatch(args[1]);
        const completeSwapPromises = [
          this.animateMatchSwap(m1, [match2X, match2Y], args[3]),
          this.animateMatchSwap(m2, [match1X, match1Y], args[3]),
        ];
        await Promise.all(completeSwapPromises);
      }
      this.removeScheduler(id);
    }
    return true;
  }

  getMatch(matchId) {
    const matchIdx = this._matches.findIndex(
      (match) => match.getId() === matchId
    );
    if (matchId !== -1) return this._matches[matchIdx];

    return null;
  }

  getMatchValues() {
    return this._matches.map((match) => match.getValue());
  }

  getMatchIds() {
    return this._matches.map((match) => match.getId());
  }

  getMatchPositions() {
    return this._matches.map((match) => match.getBoundingRect());
  }

  getBaseColor() {
    return this._matchBaseColor;
  }

  setBaseColor(matchColor) {
    this._matchBaseColor = matchColor;
    this._matches.forEach((match) => match.setColor(this._matchBaseColor));
  }

  async styleMatchColor(match, color, colorTimeout = 0) {
    const currMatchColor = match.getColor();
    if (currMatchColor !== color) {
      await match.setColor(color, colorTimeout);
      return true;
    }
    return false;
  }

  async styleMatchAlpha(match, alpha, alphaInterval = 0) {
    const currMatchAlpha = match.getAlpha();
    if (currMatchAlpha !== alpha) {
      await match.setAlpha(alpha, alphaInterval);
      return true;
    }
    return false;
  }

  async animateMatchSwap(match, swapDest, animationSpeedScale) {
    const { left: x, top: y } = match.getBoundingRect();
    const [swapX, swapY] = swapDest;
    console.log(`x: ${x}            y: ${y}`);
    console.log(`swapX: ${swapX}    swapY: ${swapY}`);

    if (x !== swapX || y !== swapY) {
      const yMovement = 10;
      // go through each swap step
      // simultaneously check if the step has already been completed
      // since match current position might be at an intermediary point to reach swapDest
      let swapStep;
      if (x !== swapX && y < swapY + yMovement) swapStep = 0;
      else if (x !== swapX && y === swapY + yMovement) swapStep = 1;
      else if (x === swapX && y < swapY + yMovement) swapStep = 2;

      console.log(`swapStep: ${swapStep}`);
      let animationSpeed = SWAP_BASE_SPEED / animationSpeedScale;
      if (swapStep === 0) {
        await match.goTo([x, swapY + yMovement], animationSpeed);
        await match.goTo([swapX, swapY + yMovement], animationSpeed);
        await match.goTo([swapX, swapY], animationSpeed);
      } else if (swapStep === 1) {
        await match.goTo([swapX, swapY + yMovement], animationSpeed);
        await match.goTo([swapX, swapY], animationSpeed);
      } else {
        await match.goTo([swapX, swapY], animationSpeed);
      }

      return true;
    }
    return false;
  }

  async animateSwap(matchId1, matchId2, swapColor, animationSpeedScale) {
    const match1 = this.getMatch(matchId1);
    const match2 = this.getMatch(matchId2);

    if (match1 && match2) {
      const { left: match1X, top: match1Y } = match1.getBoundingRect();
      const { left: match2X, top: match2Y } = match2.getBoundingRect();
      const sId = this.addScheduler(
        "animateSwap",
        Array.from(arguments),
        [match1X, match1Y],
        [match2X, match2Y]
      );

      const swapAlpha = 1;

      const swapStylingPromises = [];
      for (const match of [match1, match2]) {
        if (match.getColor() !== swapColor)
          swapStylingPromises.push(match.setColor(swapColor));
        if (match.getAlpha() !== swapAlpha)
          swapStylingPromises.push(match.setAlpha(swapAlpha));
      }
      await Promise.all(swapStylingPromises);

      const swapAnimationPromises = [];

      swapAnimationPromises.push(
        this.animateMatchSwap(match1, [match2X, match2Y], animationSpeedScale)
      );
      swapAnimationPromises.push(
        this.animateMatchSwap(match2, [match1X, match1Y], animationSpeedScale)
      );
      await Promise.all(swapAnimationPromises);

      const baseStylingPromises = [
        match1.setColor(this._matchBaseColor),
        match2.setColor(this._matchBaseColor),
        match1.setAlpha(MATCH_BASE_ALPHA),
        match2.setAlpha(MATCH_BASE_ALPHA),
      ];
      await Promise.all(baseStylingPromises);
      this.removeScheduler(sId);
      return true;
    }
    return false;
  }

  styleMatch(matchId, color, alpha, colorTimeout = 0, alphaInterval = 0) {
    return new Promise(async (resolve, reject) => {
      const match = this.getMatch(matchId);
      if (match) {
        const stylePromises = [
          match.setColor(color, colorTimeout),
          match.setAlpha(alpha, alphaInterval),
        ];
        await Promise.all(stylePromises);
        resolve(`${matchId} set color to ${color} and alpha to ${alpha}`);
      }
      reject(`${matchId} not found!`);
    });
  }

  draw(ctx) {
    for (let i = 0; i < this._matches.length; i++) {
      this._matches[i].draw(ctx);
    }
  }
}

export default Matchbox;
