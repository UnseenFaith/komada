module.exports = str => str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
