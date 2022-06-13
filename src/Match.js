class Match {
  constructor(
    posX,
    posY,
    width,
    height,
    color,
    alpha,
    id,
    value,
    trackScheduler
  ) {
    this._posX = posX;
    this._posY = posY;
    this._width = width;
    this._height = height;
    this._color = color;
    this._alpha = alpha;
    this._id = id;
    this._value = value;
    this.trackScheduler = trackScheduler;
  }

  draw(ctx) {
    ctx.fillStyle = this._color;
    ctx.globalAlpha = this._alpha;
    ctx.fillRect(this._posX, this._posY, this._width, this._height);
  }
  /**
   * go to a new point within a specific interval
   * @param {Array} newPos of form [newPosX, newPosY]
   * @param {Number} interval milliseconds to complete op
   */
  goTo(newPos, interval = 0) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(newPos) || newPos.length !== 2)
        reject(`newPos arg must obey form [posX, posY]!`);

      const prevX = this._posX;
      const prevY = this._posY;
      if (interval === 0) {
        this._posX = newPos[0];
        this._posY = newPos[1];
        resolve(
          `match with ${this._id} moved to X: ${this._posX}   Y: ${this._posY}`
        );
      }
      const [newPosX, newPosY] = newPos;
      const distToTravelX = newPosX - this._posX;
      const distToTravelY = newPosY - this._posY;
      let reachedX = false,
        reachedY = false;

      const goToInt = setInterval(() => {
        if (reachedX && reachedY) {
          this._posX = newPosX; // correct undesired floating-point precision margins
          this._posY = newPosY;
          resolve(
            `match with ${this._id} moved to X: ${this._posX}   Y: ${this._posY} from X: ${prevX}   Y:${prevY}`
          );
          clearInterval(goToInt);
        }

        if (
          distToTravelX === 0 ||
          (distToTravelX > 0 && this._posX >= newPosX) ||
          (distToTravelX < 0 && this._posX <= newPosX)
        ) {
          reachedX = true;
        }

        if (
          distToTravelY === 0 ||
          (distToTravelY > 0 && this._posY >= newPosY) ||
          (distToTravelY < 0 && this._posY <= newPosY)
        ) {
          reachedY = true;
        }

        if (!reachedX) this._posX += distToTravelX / 100;

        if (!reachedY) this._posY += distToTravelY / 100;
      }, interval / 100);
      this.trackScheduler("interval", goToInt);
    });
  }

  // setters

  setColor(newColor, timeout = 0) {
    return new Promise((resolve, reject) => {
      if (timeout === 0) {
        this._color = newColor;
        resolve(`match with ${this._id} set color to ${this._color}`);
      }

      const colorTimeout = setTimeout(() => {
        this._color = newColor;
        resolve(`match with ${this._id} set color to ${this._color}`);
      }, timeout);
      this.trackScheduler("timeout", colorTimeout);
    });
  }

  setAlpha(newAlpha, interval = 0) {
    return new Promise((resolve, reject) => {
      if (interval === 0) {
        this._alpha = newAlpha;
        resolve(`match with ${this._id} set alpha to ${this._alpha}`);
      }

      const alphaDiff = newAlpha - this._alpha;
      const alphaInt = setInterval(() => {
        if (
          alphaDiff === 0 ||
          (alphaDiff > 0 && this._alpha >= newAlpha) ||
          (alphaDiff < 0 && this._alpha <= newAlpha)
        ) {
          resolve(`match with ${this._id} set alpha to ${this._alpha}`);
          clearInterval(alphaInt);
        }

        this._alpha += alphaDiff / 100;
      }, interval / 100);
      this.trackScheduler("interval", alphaInt);
    });
  }

  setPosX(newPosX) {
    this._posX = newPosX;
  }

  setPosY(newPosY) {
    this._posY = newPosY;
  }

  // getters

  getId() {
    return this._id;
  }
  getValue() {
    return this._value;
  }

  getPosX() {
    return this._posX;
  }

  getPosY() {
    return this._posY;
  }

  getColor() {
    return this._color;
  }

  getAlpha() {
    return this._alpha;
  }

  getBoundingRect() {
    return {
      top: this._posY,
      left: this._posX,
      right: this._posX + this._width,
      bottom: this._posY + this._height,
      width: this._width,
      height: this._height,
    };
  }
}

export default Match;
