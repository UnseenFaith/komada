module.exports = (bot, msg, cmd, notSpam = false) => {
  return new Promise ((resolve, reject) => {
    let mps = [true];
    bot.commandInhibitors.forEach(mProc => {
      if (!mProc.conf.spamProtection || !notSpam) {
        mps.push(mProc.run(bot, msg, cmd));
      }
    });
    Promise.all(mps)
    .then(value => {
      resolve(value);
    }, reason => {
      reject(reason);
    });
  });
};
