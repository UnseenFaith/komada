/* eslint-disable consistent-return */

const { Structures, Message } = require("discord.js");

class KomadaMessage extends Message {

  constructor(...args) {
    super(...args);

    /**
     * The command attempting to be ran, is currently running, or has already been ran.
     * @type {?Command}
     */
    this.command = null;

    /**
     * The prefix used to run the said command.
     * @type {?RegExp}
     */
    this.prefix = null;

    /**
     * The length of the prefix for this message.
     * @type {?number}
     */
    this.prefixLength = null;

    /**
     * An array of string arguments contained in the message, split by the usageDelim for the command.
     * @type {string[]}
     */
    this.args = [];

    /**
     * An array of resolved arguments for this command.
     * @type {any[]}
     */
    this.params = [];

    // TODO: Create a better prompting system.
    /**
     * Whether or not this message was reprompted for additional arguments.
     * @type {boolean}
     */
    this.reprompted = false;

  /**
   * Whether or not the ClientUser can add reactions to this message.
   * @readonly
   * @type {boolean}
   */

  get reactable() {
    return this.guild ? this.readable && this.permissionsFor(this.guild.me).has("ADD_REACTIONS") : true;
  }

  /**
   * Runs all Monitors from the bot on this message. This is called automatically and shouldn't need to be invoked again.
   * @private
   */

  runMonitors() {
    this.client.messageMonitors.forEach((monit) => {
      const { enabled, ignoreBots, ignoreSelf } = monit.conf;
      if (enabled) {
        if (ignoreBots && this.author.bot) return;
        if (ignoreSelf && this.client.user === this.author) return;
        monit.run(this.client, this);
      }
    });
  }

  /**
   * Transforms a Regular KomadaMessage into a Command KomadaMessage.
   * @private
   * @param  {Command} command The command for this message.
   * @param  {[type]} prefix  The prefix used for this message.
   * @param  {[type]} length  The length of the prefix used for this message.
   */
  _registerCommand({ command, prefix, length }) {
    this.command = command;
    this.prefix = prefix;
    this.prefixLength = length;
    this.args = this.constructor.getArgs(this);
  }

  /**
   * Whether or not Komada should handle the incoming message for commands.
   * @private
   * @readonly
   * @returns {boolean}
   */
  get _handle() {
    const { ignoreBots, ignoreSelf } = this.client.config;
    if (ignoreBots && this.author.bot) return false;
    if (ignoreSelf && this.client.user === this.author) return false;
    if (!this.client.user.bot && this.author !== this.client.user) return false;
    if (this.client.user.bot && this.author === this.client.user) return false;
    return true;
  }

  /**
   * Shortcut to command.usage._parsedUsage
   * @readonly
   * @private
   * @return {ParsedUsage}
   */
  get parsedUsage() {
    return this.command.usage.parsedUsage;
  }

  /**
   * Validates and resolves args into parameters
   * @private
   * @returns {any[]} The resolved parameters
   */
  async validateArgs() {
    let currentUsage;
    let repeat;
    let arg;
    let possibles = 0;
    const noRepeats = this.parsedUsage.slice(0).filter(u => u.type !== "repeat");
    const parsedUsage = this.parsedUsage.slice(0);
    if (this.args.length > this.parsedUsage.length && this.parsedUsage[this.parsedUsage.length - 1].type === "repeat") {
      for (let i = 0; i <= (this.args.length - parsedUsage.length); i++) parsedUsage.push(this.parsedUsage[this.parsedUsage.length - 1]);
    }
    this.params = await Promise.all(parsedUsage.map(async (usage, i) => {
      arg = i;
      currentUsage = parsedUsage[i];
      if (currentUsage.type === "repeat") {
        currentUsage = noRepeats[noRepeats.length - 1];
        currentUsage.type = "optional";
        repeat = true;
      }
      if (currentUsage.type === "optional" && (this.args[i] === undefined || this.args[i] === "")) {
        if (parsedUsage.slice(this.args.length).some(u => u.type === "required")) {
          throw "Missing one or more required arguments after the end of user input.";
        } else {
          return undefined;
        }
      }
      if (currentUsage.type === "required" && this.args[i] === undefined) {
        throw currentUsage.possibles.length === 1 ?
          `${currentUsage.possibles[0].name} is a required argument.` :
          `Missing a required option: (${currentUsage.possibles.map(poss => poss.name).join(", ")})`;
      }
      if (currentUsage.possibles.length === 1) {
        if (this.client.argResolver[currentUsage.possibles[0].type]) {
          return this.client.argResolver[currentUsage.possibles[0].type](this.args[i], currentUsage, 0, repeat, this.msg)
            .catch((err) => { throw err; })
            .then(res => (res !== null ? res : undefined));
        }
        throw `Unknown Argument type "${currentUsage.possibles[0].type}" encountered. There might be a typo in your usage string.`;
      } else {
        let poss = await Promise.all(currentUsage.possibles.map((possible, k) => {
          if (possibles >= currentUsage.possibles.length && !repeat) {
            if (currentUsage.type === "optional" && !repeat) {
              return undefined;
            }
            throw `Your option didn't match any of the possibilities (${currentUsage.possibles.map(p => p.name).join(", ")})`;
          } else if (this.client.argResolver[possible.type]) {
            return this.client.argResolver[possible.type](this.args[arg], currentUsage, k, repeat, this.msg)
              .then((res) => {
                if (res !== null) {
                  return res;
                }
                ++possibles;
              })
              .catch(() => { ++possibles; }); // eslint-disable-line
          } else {
            throw "Unknown Argument type encountered.";
          }
        }));
        poss = poss.filter(v => v);
        return poss[0];
      }
    }));
    if (this.params.length >= this.parsedUsage.length && this.params.length >= this.args.length) return this.params;
  }

  /**
   * Parses a message into string args
   * @param {KomadaMessage} msg this command message
   * @private
   * @returns {string[]}
   */
  static getArgs(msg) {
    const args = msg.content.slice(msg.prefixLength).trim().split(" ").slice(1)
      .join(" ")
      .split(msg.command.help.usageDelim !== "" ? msg.command.help.usageDelim : undefined);
    if (args[0] === "") return [];
    return args;
  }

}

Structures.extend("Message", () => KomadaMessage);

module.exports = KomadaMessage;
