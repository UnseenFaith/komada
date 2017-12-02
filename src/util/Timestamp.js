/**
 * Simple class for formatting epoch milliseconds into a short-handed format.
 */

class Timestamp {

/**
 * Formats a Date Object into a shorthand date/time format.
 * @param  {Date} date A Javascript Date Objected, created by doing new Date()
 * @return {string} The newly created titmestamp for this date object.
 */
  static format(date) {
    if (!(date instanceof Date)) throw "Date object not passed.";
    const year = date.getYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const output = [];
    output.push([
      year.toString().length < 4 ? year + 1900 : year,
      month < 10 ? `0${month}` : month,
      day < 10 ? `0${day}` : day,
    ].join("-"));
    output.push(" ");
    output.push([
      hours < 10 ? `0${hours}` : hours,
      minutes < 10 ? `0${minutes}` : minutes,
      seconds < 10 ? `0${seconds}` : seconds,
    ].join(":"));
    return output.join("");
  }

}

module.exports = Timestamp;
