/* eslint-disable no-underscore-dangle, no-use-before-define */
const EventEmitter = require("events").EventEmitter;
const Collection = require("discord.js").Collection;

class ReactionCollector extends EventEmitter {
  constructor(message, filter, options = {}) {
    super();

    this.message = message;
    this.filter = filter;
    this.options = options;
    this.ended = false;
    this.collected = new Collection();
    this.listener = reaction => this.verify(reaction);
    this.message.client.on("messageReactionAdd", this.listener);
    if (options.time) this.message.client.setTimeout(() => this.stop("time"), options.time);
  }

  verify(reaction) {
    if (this.message ? this.message.id !== reaction.message.id : false) return false;
    if (this.filter(reaction, this)) {
      this.collected.set(reaction._emoji.name, reaction);
      this.emit("messageReactionAdd", reaction, this);
      if (this.collected.size >= this.options.maxMatches) this.stop("matchesLimit");
      else if (this.options.max && this.collected.size === this.options.max) this.stop("limit");
      return true;
    }
    return false;
  }

  get next() {
    return new Promise((resolve, reject) => {
      if (this.ended) {
        reject(this.collected);
        return;
      }

      const cleanup = () => {
        this.removeListener("message", onMessage);
        this.removeListener("end", onEnd);
      };

      const onMessage = (...args) => {
        cleanup();
        resolve(...args);
      };

      const onEnd = (...args) => {
        cleanup();
        reject(...args);
      };

      this.once("message", onMessage);
      this.once("end", onEnd);
    });
  }

  stop(reason = "user") {
    if (this.ended) return;
    this.ended = true;
    this.message.client.removeListener("message", this.listener);
    this.emit("end", this.collected, reason);
  }
}

module.exports = ReactionCollector;
