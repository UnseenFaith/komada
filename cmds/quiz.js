const quiz = [
  { q: "What colour is the sky?", a: ["blue"]},
  { q: "Name a soft drink brand", a: ["pepsi", "coke", "rc", "7up", "sprite", "mountain dew"]},
  { q: "Name a programming language", a: ["actionscript", "coffeescript", "c", "c++", "basic", "python", "perl", "javascript", "dotnet", "lua", "crystal", "go", "d", "php", "ruby", "rust", "dart"]},
  { q: "Who's your favourite server owner?", a: ["root", "luckyevie", "evie", "eslachance"]},
  { q: "Who's a good boy? **Who's a good boy???**", a: ["you are", "i am"]}
];

exports.run = (bot, msg, params = []) => {
  let item =  quiz[Math.floor(Math.random() * quiz.length)];
  msg.channel.sendMessage(item.q)
  .then( () => {
    msg.channel.awaitMessages( answer => item.a.includes(answer.content.toLowerCase()), {
      max: 1,
      time: 30000,
      errors: ["time"]
    })
    .then(collected => {
      bot.functions.optn.points(bot, collected.first(), "add").catch(console.error);
      msg.channel.sendMessage(`We have a winner! *${collected.first().author.username}* had a right answer with \`${collected.first().content}\`!`);
    })
    .catch((collected) => msg.channel.sendMessage("Seems no one got it! Oh well."));
  });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: []
};

exports.help = {
  name: "quiz",
  description: "Sends a quiz and expects a correct answer.",
  usage: "quiz"
};
