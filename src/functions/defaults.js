exports.command = (cmd, file) => {
  const name = file.slice(-1)[0].slice(0, -3);
  const fullCategory = file.slice(0, -1);
  cmd.conf = {
    enabled: cmd.conf.enabled || true,
    runIn: cmd.conf.runIn || ["text", "dm", "group"],
    aliases: cmd.conf.aliases || [],
    permLevel: cmd.conf.permLevel || 0,
    botPerms: cmd.conf.botPerms || [],
    requiredFuncs: cmd.conf.requiredFuncs || [],
    requiredSettings: cmd.conf.requiredSettings || [],
  };
  cmd.help = {
    name: cmd.help.name || name,
    description: cmd.help.description || "No Description provided.",
    usage: cmd.help.usage || "",
    usageDelim: cmd.help.usageDelim || "",
    extendedHelp: cmd.help.extendedHelp || "",
    fullCategory,
    category: fullCategory[0] || "General",
    subCategory: fullCategory[1] || "General",
  };
  return cmd;
};
