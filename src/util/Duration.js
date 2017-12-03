
/**
 * Simple class used to turn durations into a human readable format.
 */
class Duration {

  /**
   * Constructs our duration class so that we can start formatting.
   */
  constructor() {
    /**
     * The number of milliseconds in one second.
     * @type {number}
     */
    this.second = 1000;

    /**
     * The number of milliseconds in one minute.
     * @type {number}
     */
    this.minute = this.second * 60;

    /**
     * The number of milliseconds in one hour.
     * @type {number}
     */
    this.hour = this.minute * 60;

    /**
     * The number of milliseconds in one day.
     * @type {number}
     */
    this.day = this.hour * 24;

    /**
     * The number of milliseconds in one week.
     * @type {number}
     */
    this.week = this.day * 7;
  }

  /**
   * Formats a time that is given in milliseconds.
   * @param  {number} time The number of milliseconds we want to convert to a readable time.
   * @return {string} A human readable string of the time.
   */
  static format(time) {
    const output = [];
    const weeks = `${Math.floor(time / this.week)}`;
    const days = `${Math.floor((time - (weeks * this.week)) / this.day)}`;
    const hours = `${Math.floor((time - (weeks * this.week) - (days * this.day)) / this.hour)}`;
    const minutes = `${Math.floor((time - (weeks * this.week) - (days * this.day) - (hours * this.hour)) / this.minute)}`;
    const seconds = `${Math.floor((time - (weeks * this.week) - (days * this.day) - (hours * this.hour) - (minutes * this.minute)) / this.second)}`;
    if (weeks > 0) output.push(`${weeks} weeks`);
    if (days > 0) output.push(`${days.substr(-2)} days`);
    if (hours > 0) output.push(`${hours.substr(-2)} hours`);
    if (minutes > 0) output.push(`${minutes.substr(-2)} minutes`);
    if (seconds > 0) output.push(`${seconds.substr(-2)} seconds`);
    return output.join(", ");
  }

}

module.exports = Duration;
