/* eslint-disable no-underscore-dangle */

exports.conf = {
  type: "method",
  method: "multiPossibles",
  appliesTo: ["Message"],
};

exports.extend = async function (possible, validated) {
  if (validated) {
    return this.validateArgs();
  } else if (possible >= this._currentUsage.possibles.length) {
    if (this._currentUsage.type === "optional" && !this._repeat) {
      this.args.splice(this.params.length, 0, undefined);
      this.params.push(undefined);
      return this.validateArgs();
    }
    this.args.splice(this.params.length, 1, null);
    throw this.client.funcs.newError(`Your option didn't match any of the possibilities: (${this._currentUsage.possibles.map(poss => poss.name).join(", ")})`, 1);
  } else if (this.client.argResolver[this._currentUsage.possibles[possible].type]) {
    return this.client.argResolver[this._currentUsage.possibles[possible].type](this.args[this.params.length], this._currentUsage, possible, this._repeat, this.msg)
      .then((res) => {
        if (res !== null) {
          this.params.push(res);
          return this.multiPossibles(++possible, true);
        }
        return this.multiPossibles(++possible, validated);
      })
      .catch(() => this.multiPossibles(++possible, validated));
  } else {
    this.client.emit("log", "Unknown Argument Type encountered", "warn");
    return this.multiPossibles(++possible, validated);
  }
}
