const profanityFinder = require("profanity-finder");

const findProfanity = profanityFinder.findprofanity;

exports.conf = {
  enabled: false,
};

exports.run = (client, msg) => {
  return new Promise((resolve, reject) => {
    const bool = findProfanity(msg.content);
    if (bool) {
      msg.delete();
      reject("You're not allowed to use profanity in your messages!");
    } else {
      resolve();
    }
  });
};
