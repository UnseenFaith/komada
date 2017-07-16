exports.conf = {
  type: "method",
  method: "arguments",
  appliesTo: ["Message"],
};

exports.extend = function () {
  if (!this.prefix || !this.cmd) return null;
  const args = this.content.slice(this.prefixLength).trim().split(" ").slice(1)
    .join(" ")
    .split(this.cmd.help.usageDelim !== "" ? this.cmd.usageDelim : undefined);
  if (args[0] === "") return []; return args;
}
