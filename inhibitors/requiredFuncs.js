exports.conf = {
  enabled: true,
  spamProtection: false,
};

exports.run = (client, msg, cmd) =>
   new Promise((resolve, reject) => {
     cmd.conf.requiredFuncs.forEach((func) => {
       if (!client.funcs.hasOwnProperty(func)) reject(`The client is missing **${func}**, and cannot run.`);
     });
     resolve();
   })
;
