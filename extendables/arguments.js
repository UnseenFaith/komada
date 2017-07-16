exports.conf = {
  type: "method",
  method: "arguments",
  appliesTo: ["Message"],
};

exports.extend = function () {
  if (!this.prefix || !this.cmd) return null;
  const args = this.content.slice(this.prefixLength).trim().split(" ").slice(1)
    .join(" ")
    .split(this.command.help.usageDelim !== "" ? this.command.usageDelim : undefined);
  if (args[0] === "") return []; return args;
}
