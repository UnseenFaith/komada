const Config = require("../Config.js");

/* eslint-disable no-underscore-dangle, no-throw-literal */
class Number {
  constructor(conf, data) {
    Object.defineProperty(this, "_guild", { value: conf._guild });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    this.type = "Number";
    if (typeof data !== "number") this._data = 0;
    else this._data = data;
    this.min = data.min || NaN;
    this.max = data.max || NaN;
  }

  get data() {
    return this._data;
  }

  set data(data) {
    if (data === undefined || !["number", "string"].includes(typeof data)) throw "Data must be a valid number or string that parses into a number.";
    data = parseFloat(data);
    if (isNaN(data)) throw "Provided value was not a number";
    if (this.min && !isNaN(this.min)) {
      if (data < this.min) throw `Value provided was lower then the minimum ${this.min}`;
    }
    if (this.max && !isNaN(this.max)) {
      if (data > this.max) throw `Value provided was higher than the maximum ${this.max}`;
    }
    this._data = data;
    Config.save(this._dataDir, this._guild.id);
    return this;
  }

  setMin(value) {
    this.min = value;
    Config.save(this._dataDir, this._guild.id);
    return this;
  }

  setMax(value) {
    this.max = value;
    Config.save(this._dataDir, this._guild.id);
    return this;
  }
}

module.exports = Number;
