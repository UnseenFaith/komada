exports.command = ({ conf, help, run }, file) => {
  const name = file.slice(-1)[0].slice(0, -3);
  const fullCategory = file.slice(0, -1);
  conf = {
    enabled: conf.enabled || true,
    runIn: conf.runIn || ["text", "dm", "group"],
    aliases: conf.aliases || [],
    permLevel: conf.permLevel || 0,
    botPerms: conf.botPerms || [],
    requiredFuncs: conf.requiredFuncs || [],
    requiredSettings: conf.requiredSettings || [],
  };
  help = {
    name: help.name || name,
    description: help.description || "No Description provided.",
    usage: help.usage || "",
    usageDelim: help.usageDelim || "",
    extendedHelp: help.extendedHelp || "",
    fullCategory,
    category: fullCategory[0] || "General",
    subCategory: fullCategory[1] || "General",
  };
  return { conf, help, run };
};
