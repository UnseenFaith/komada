module.exports = (text, client) => {
  if (typeof(text) === "string") {
    return text.replace(sensitivePattern(client), "「ｒｅｄａｃｔｅｄ」").replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  } else {
    return text;
  }
};

function sensitivePattern(client) {
  if (!this._sensitivePattern) {
    let pattern = '';
    if (client.token) pattern += client.token;
    if (client.token) pattern += (pattern.length > 0 ? '|' : '') + client.token;
    if (client.email) pattern += (pattern.length > 0 ? '|' : '') + client.email;
    if (client.password) pattern += (pattern.length > 0 ? '|' : '') + client.password;
    this._sensitivePattern = new RegExp(pattern, 'gi');
  }
  return this._sensitivePattern;
};
