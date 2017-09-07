const { Console } = require("console");
const Colors = require("./Colors");
const moment = require("moment");
const { inspect } = require("util");

/**
 * Komada's console class, extends NodeJS Console class.
 *
 */
class KomadaConsole extends Console {

  /**
   * Constructs our KomadaConsole instance
   * @param  {boolean}  [stdout=process.stdout] The location of standard output. Must be a writable stream.
   * @param  {boolean}  [stderr=process.stderr] The location of standrad error outputt. Must be a writable stream.
   * @param  {boolean} [colors=false] Whether or not colors should be enabled.
   * @param  {boolean}  [timestamps=false] Whether or not Timestamps should be enabled.
   */
  constructor({ stdout, stderr, colors = false, timestamps = false }) {
    super(stdout, stderr);
    /**
     * The standard output stream for this console, defaulted to process.stderr.
     * @name KomadaConsole#stdout
     * @type {WritableStream}
     */
    Object.defineProperty(this, "stdout", { value: stdout });

    /**
     * The standard error output stream for this console, defaulted to process.stderr.
     * @name KomadaConsole#stderr
     * @type {WritableStream}
     */
    Object.defineProperty(this, "stderr", { value: stderr });

    /**
     * Whether or not timestamps should be enabled for this console.
     * @type {boolean}
     */
    this.timestamps = timestamps;

    /**
     * Whether or not colors should be enabled for this console.
     * @name KomadaConsole#colors
     * @type  {boolean|Colors}
     */

    if (!colors) {
      this.colors = false;
    } else {
      this.colors = {
        debug: colors.debug || { message: { background: null, text: null, style: null }, time: { background: null, text: "magenta", style: null } },
        error: colors.error || { message: { background: null, text: null, style: null }, time: { background: "red", text: null, style: null } },
        log: colors.log || { message: { background: null, text: null, style: null }, time: { background: null, text: "blue", style: null } },
        verbose: colors.verbose || { message: { background: null, text: null, style: null }, time: { background: null, text: "gray", style: null } },
        warn: colors.warn || { message: { background: null, text: null, style: null }, time: { background: "brightyellow", text: "black", style: null } },
        wtf: colors.wtf || { message: { background: "red", text: null, style: ["bold", "underline"] }, time: { background: "red", text: null, style: ["bold", "underline"] } },
      };
    }
  }

  /**
   * @memberof KomadaConsole
   * @typedef {object} Colors - Time is for the timestamp of the log, message is for the actual output.
   * @property {ColorObjects} debug An object containing a message and time color object.
   * @property {ColorObjects} error An object containing a message and time color object.
   * @property {ColorObjects} log An object containing a message and time color object.
   * @property {ColorObjects} verbose An object containing a message and time color object.
   * @property {ColorObjects} warn An object containing a message and time color object.
   * @property {ColorObjects} wtf An object containing a message and time Color Object.
   */

  /**
   * @memberof KomadaConsole
   * @typedef {object} ColorObjects
   * @property {MessageObject} message A message object containing colors and styles.
   * @property {TimeObject} time A time object containing colors and styles.
   */

  /**
   * @memberof KomadaConsole
   * @typedef {object} MessageObject
   * @property {BackgroundColorTypes} background The background color. Can be a basic string like "red", a hex string, or a RGB array.
   * @property {TextColorTypes} text The text conolor. Can be a basic string like "red", a hex string, or a RGB array.
   * @property {StyleTypes} style A style string from StyleTypes.
   */

  /**
    * @memberof KomadaConsole
    * @typedef {object} TimeObject
    * @property {BackgroundColorTypes} background The background color. Can be a basic string like "red", a hex string, or a RGB array.
    * @property {TextColorTypes} text The text conolor. Can be a basic string like "red", a hex string, or a RGB array.
    * @property {StyleTypes} style A style string from StyleTypes.
    */

  /**
    * @memberof KomadaConsole
    * @typedef {*} TextColorTypes - All the valid color types.
    * @property {string} black
    * @property {string} red
    * @property {string} green
    * @property {string} yellow
    * @property {string} blue
    * @property {string} magenta
    * @property {string} cyan
    * @property {string} gray
    * @property {string} grey
    * @property {string} brightgray
    * @property {string} brightgrey
    * @property {string} brightred
    * @property {string} brightgreen
    * @property {string} brightyellow
    * @property {string} brightblue
    * @property {string} brightmagenta
    * @property {string} brightcyan
    * @property {string} white
    */

  /**
    * @memberof KomadaConsole
    * @typedef {*} BackgroundColorTypes - All the valid background color types.
    * @property {string} black
    * @property {string} red
    * @property {string} green
    * @property {string} blue
    * @property {string} magenta
    * @property {string} cyan
    * @property {string} gray
    * @property {string} grey
    * @property {string} brightgray
    * @property {string} brightgrey
    * @property {string} brightred
    * @property {string} brightgreen
    * @property {string} brightyellow
    * @property {string} brightblue
    * @property {string} brightmagenta
    * @property {string} brightcyan
    * @property {string} white
    */

  /**
    * @memberof KomadaConsole
    * @typedef {*} StyleTypes
    * @property {string} normal
    * @property {string} bold
    * @property {string} dim
    * @property {string} italic
    * @property {string} underline
    * @property {string} inverse
    * @property {string} hidden
    * @property {string} strikethrough
    */

  /**
   * Logs everything to the console/writable stream.
   * @param  {*} stuff The stuff we want to print.
   * @param  {string} [type="log"] The type of log, particularly useful for coloring.
   */
  log(stuff, type = "log") {
    stuff = KomadaConsole.flatten(stuff, this.colors);
    const message = this.colors ? this.colors[type.toLowerCase()].message : {};
    const time = this.colors ? this.colors[type.toLowerCase()].time : {};
    const timestamp = this.timestamps ? `[${moment().format("YYYY-MM-DD HH:mm:ss")}]` : null;
    if (super[type]) {
      super[type](stuff.split("\n").map(str => (timestamp ? `${this.timestamp(timestamp, time)} ${this.messages(str, message)}` : `${this.messages(str, message)}`)).join("\n"));
    } else {
      super.log(stuff.split("\n").map(str => (timestamp ? `${this.timestamp(timestamp, time)} ${this.messages(str, message)}` : `${this.messages(str, message)}`)).join("\n"));
    }
  }

  timestamp(timestamp, time) {
    if (!this.stdout.isTTY || !this.stderr.isTTY) return timestamp;
    return Colors.format(timestamp, time);
  }

  messages(string, message) {
    if (!this.colors || !this.stdout.isTTY || !this.stderr.isTTY) return string;
    return Colors.format(string, message);
  }

  /**
   * Flattens our data into a readable string.
   * @param  {*} data Some data to flatten
   * @param {boolean} color Whether or not the inspection should color the output
   * @return {string}
   */
  static flatten(data, color) {
    data = data.stack || data.message || data;
    if (typeof data === "object" && typeof data !== "string" && !Array.isArray(data)) data = inspect(data, { depth: 0, colors: !!color });
    if (Array.isArray(data)) data = data.join["\n"];
    return data;
  }

}

module.exports = KomadaConsole;
