exports.conf = {
  enabled: true,
  spamProtection: false,
  priority: 6,
};

exports.run = (client, msg, cmd) => {
  if (!cmd.conf.requiredFuncs) return false;
  const funcs = [];
  cmd.conf.requiredFuncs.forEach((func) => {
    if (!client.funcs.hasOwnProperty(func)) funcs.push(func);
  });
  if (funcs.length > 0) return `The client is missing **${funcs.join(", ")}**, and cannot run.`;
  return false;
};
