/* eslint-disable no-unused-expressions, no-bitwise */

class Colors {

  constructor() {
    this.CLOSE = {
      normal: 0,
      bold: 22,
      dim: 22,
      italic: 23,
      underline: 24,
      inverse: 27,
      hidden: 28,
      strikethrough: 29,
      color: 39,
      background: 49,
    };

    this.STYLES = {
      normal: 0,
      bold: 1,
      dim: 2,
      italic: 3,
      underline: 4,
      inverse: 7,
      hidden: 8,
      strikethrough: 9,
    };

    this.COLORS = {
      black: 30,
      red: 31,
      green: 32,
      yellow: 33,
      blue: 34,
      magenta: 35,
      cyan: 36,
      brightgray: 37,
      brightgrey: 37,
      gray: 90,
      grey: 90,
      brightred: 91,
      brightgreen: 92,
      brightyellow: 93,
      brightblue: 94,
      brightmagenta: 95,
      brightcyan: 96,
      white: 97,
    };

    this.BACKGROUNDS = {
      black: 40,
      red: 41,
      green: 42,
      yellow: 43,
      blue: 44,
      magenta: 45,
      cyan: 46,
      gray: 47,
      grey: 47,
      brightgray: 100,
      brightgrey: 100,
      brightred: 101,
      brightgreen: 102,
      brightyellow: 103,
      brightblue: 104,
      brightmagenta: 105,
      brightcyan: 106,
      white: 107,
    };
  }

  static hexToRGB(hex) {
    let string = hex[0];
    if (string.length === 3) string = string.split("").map(char => char + char).join("");
    const integer = parseInt(string, 16);
    return [(integer >> 16) & 0xFF, (integer >> 8) & 0xFF, integer & 0xFF];
  }

  static formatRGB([red, green, blue]) {
    return `\u001B[38;2;${red};${green};${blue}m`;
  }

  format(string, { style, background, text } = {}) {
    const opening = [];
    const closing = [];
    const backgroundMatch = background ? background.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i) : null;
    const textMatch = text ? text.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i) : null;
    if (backgroundMatch) background = Colors.hexToRGB(backgroundMatch);
    if (textMatch) text = Colors.hexToRGB(textMatch);
    if (style) {
      if (Array.isArray(style)) style.forEach(sty => (sty in this.STYLES ? opening.push(`\u001B[${this.STYLES[sty.toLowerCase()]}m`) && closing.push(`\u001B[${this.CLOSE[sty.toLowerCase()]}m`) : null));
      else if (style in this.STYLES) opening.push(`\u001B[${this.STYLES[style.toLowerCase()]}m`) && closing.push(`\u001B[${this.CLOSE[style.toLowerCase()]}m`);
    }
    if (background) {
      if (Array.isArray(background)) opening.push(Colors.formatRGB(background)) && closing.push(`\u001B[${this.CLOSE.background}`);
      else if (background.toLowerCase() in this.BACKGROUNDS) opening.push(`\u001B[${this.BACKGROUNDS[background.toLowerCase()]}m`) && closing.push(`\u001B[${this.CLOSE.background}m`);
    }
    if (text) {
      if (Array.isArray(text)) opening.push(Colors.formatRGB(text)) && closing.push(`\u001B[${this.CLOSE.color}m`);
      else if (text.toLowerCase() in this.COLORS) opening.push(`\u001B[${this.COLORS[text.toLowerCase()]}m`) && closing.push(`\u001B[${this.CLOSE.color}m`);
    }
    return `${opening.join("")}${string}${closing.join("")}`;
  }

}

module.exports = new Colors();
