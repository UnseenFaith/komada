const Config = require("../Config.js");

class Array {
  constructor(conf, data) {
    Object.defineProperty(this, "_guild", { value: conf._guild });
    Object.defineProperty(this, "_dataDir", { value: conf._dataDir });
    Object.defineProperty(this, "_client", { value: conf._client });
    this.type = "Array";
    if (!(data instanceof Array)) this._data = [];
    else this._data = data;
  }

  get data() {
    return this._data;
  }

  set data(data) {
    if (data === undefined || (!(data instanceof Array) || typeof data !== "string")) throw "Please supply a valid array or string.";
    if (data instanceof Array) {
      data.forEach((dat) => {
        if (this._data.includes(data)) this.del(dat);
        else this.add(dat);
      });
    } else if (this._data.includes(data)) {
      this.del(data);
    } else { this.add(data); }
    Config.save(this._dataDir, this._guild.id);
    return this;
  }

  add(value) {
    if (!value === undefined || (!(value instanceof Array) && typeof value !== "string")) throw "Please supply a valid value (array, or string) to add to the possibles array.";
    if (value instanceof Array) {
      value.forEach((val) => {
        if (!this._datas.includes(val)) this._data.push(val);
      });
    } else {
      if (this._data.includes(value)) throw "That value already exists in the possibles array.";
      this._data.push(value);
    }
    Config.save(this._dataDir, this._guild.id);
    return this;
  }

  del(value) {
    if (!value === undefined || (!(value instanceof Array) && typeof value !== "string")) throw "Please supply a valid value (array, or string) to add to the possibles array.";
    if (value instanceof Array) {
      value.forEach((val) => {
        if (this._data.includes(val)) this._data.splice(this._data.indexOf(val), 1);
      });
    } else {
      if (!this._data.includes(value)) throw "That value does not already exist in the possibles array.";
      this._data.splice(this._data.indexOf(value), 1);
    }
    Config.save(this._dataDir, this._guild.id);
    return this;
  }
}

module.exports = Array;
