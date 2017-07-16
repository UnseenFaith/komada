/* eslint-disable no-underscore-dangle */

exports.conf = {
  type: "method",
  method: "validateArgs",
  appliesTo: ["Message"],
};

exports.extend = async function () {
  if (!this.prefix || !this.cmd) return null;
  if (this.params.length >= this.cmd.usage.parsedUsage.length && this.params.length >= this.args.length) {
    return this.params;
  } else if (this.cmd.usage.parsedUsage[this.params.length]) {
    if (this.cmd.usage.parsedUsage[this.params.length].type !== "repeat") {
      this._currentUsage = this.cmd.usage.parsedUsage[this.params.length];
    } else if (this.cmd.usage.parsedUsage[this.params.length].type === "repeat") {
      this._currentUsage.type = "optional";
      this._repeat = true;
    }
  } else if (!this._repeat) {
    return this.params;
  }
  if (this._currentUsage.type === "optional" && (this.args[this.params.length] === undefined || this.args[this.params.length] === "")) {
    if (this.cmd.usage.parsedUsage.slice(this.params.length).some(usage => usage.type === "required")) {
      this.args.splice(this.params.length, 0, undefined);
      this.args.splice(this.params.length, 1, null);
      throw this.client.funcs.newError("Missing one or more required arguments after end of input.", 1);
    } else {
      return this.params;
    }
  } else if (this._currentUsage.type === "required" && this.args[this.params.length] === undefined) {
    this.args.splice(this.params.length, 1, null);
    throw this.client.funcs.newError(this._currentUsage.possibles.length === 1 ?
      `${this._currentUsage.possibles[0].name} is a required argument.` :
      `Missing a required option: (${this._currentUsage.possibles.map(poss => poss.name).join(", ")})`, 1);
  } else if (this._currentUsage.possibles.length === 1) {
    if (this.client.argResolver[this._currentUsage.possibles[0].type]) {
      return this.client.argResolver[this._currentUsage.possibles[0].type](this.args[this.params.length], this._currentUsage, 0, this._repeat, this.msg)
        .catch((err) => {
          this.args.splice(this.params.length, 1, null);
          throw this.client.funcs.newError(err, 1);
        })
        .then((res) => {
          if (res !== null) {
            this.params.push(res);
            return this.validateArgs();
          }
          this.args.splice(this.params.length, 0, undefined);
          this.params.push(undefined);
          return this.validateArgs();
        });
    }
    this.client.emit("log", "Unknown Argument Type encountered", "warn");
    return this.validateArgs();
  } else {
    return this.multiPossibles(0, false);
  }
};
