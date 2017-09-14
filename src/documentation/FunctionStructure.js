/**
 * Function pieces are exactly what they are... they're functions. This can range from a single function, to a group of functions.
 * Their structure can be almost anything, the only requirement is that you have to assign it as a module for Komada to understand what it is.
 * @module Functions
 * @example <caption> An example of a single function saved as "add.js". </caption>
 * module.exports = (var, var2) => var + var2; // accessed via 'client.funcs.add'
 * @example <caption> An example of multiple functions in one file, named math.js, and accessed via 'client.funcs.group["exportName"]' </caption>
 * exports.add = (var, var2) => var + var2; // accessed via 'client.funcs.math.add'
 * exports.subtract = (var, var2) => var - var2; // accessed via 'client.funcs.math.subtract'
 * exports.mutliply = (var, var2) => var * var2; // accessed via 'client.funcs.math.multiply'
 * exports.divide = (var, var2) => var / var2; // accessed via 'client.funcs.math.divide'
 */
