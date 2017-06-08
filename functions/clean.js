const zws = String.fromCharCode(8203);
let sensitivePattern;

module.exports = (client, text) => {
  if (!sensitivePattern) this.init(client);
  if (typeof text === "string") {
    return text.replace(sensitivePattern, "「ｒｅｄａｃｔｅｄ」").replace(/`/g, `\`${zws}`).replace(/@/g, `@${zws}`);
  }
  return text;
};

exports.init = (client) => {
  let pattern = "";
  if (client.token) pattern += client.token;
  if (client.token) pattern += (pattern.length > 0 ? "|" : "") + client.token;
  if (client.user.email) pattern += (pattern.length > 0 ? "|" : "") + client.user.email;
  if (client.password) pattern += (pattern.length > 0 ? "|" : "") + client.password;
  sensitivePattern = new RegExp(pattern, "gi");
};
