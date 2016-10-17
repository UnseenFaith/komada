const base_url = "https://eslachance.gitbooks.io/discord-js-bot-guide/content";
const guides = {
  "roles": { url: "/coding-walkthroughs/understanding_roles.html", snippet: "Roles are a powerful feature in Discord, and admittedly have been one of the hardest parts to master in discord.js. This walkthrough aims at explaining how roles and permissions work. We'll also explore how to use roles to protect your commands." },
  "args": { url: "/samples/command_with_arguments.html", snippet: "In Your First Bot, we explored how to make more than one command. These commands all started with a prefix, but didn't have any *arguments* : extra parameters used to vary what the command actually does." },
  "selfbot": { url: "/samples/selfbots_are_awesome.html", snippet: "So, my friend, you are wondering what is a selfbot? Well let me tell you a little story. Stay a while, and listen!" },
  "collection": { url: "/coding-walkthroughs/understanding_collections.html", snippet: "In this page we will explore Collections, and how to use them to grab data from various part of the API." },
  "eval": { url: "/samples/making-an-eval-command.html", snippet: "Eval bots are AWESOME. But eval bots are DANGEROUS. Read up on them here." },
  "gslong": { url: "/getting-started/the-long-version.html", snippet: "So, you want to write a bot and you know some JavaScript, or maybe even node.js. You want to do cool things like a music bot, tag commands, random image searches, the whole shebang. Well you're at the right place!" },
  "gswin": { url: "/getting-started/windows-tldr.html", snippet: "**Windows TL;DR** version of the getting started guide. When you have exactly 0 time to lose and no desire to fuck around." },
  "gslinux": { url: "/getting-started/linux-tldr.html", snippet: "**Linux TL;DR** version of the getting started guide. When you have exactly 0 time to lose and no desire to fuck around." },
  "home": { url: "/", "snippet": "Some technical details about the bot guide, and a donation link if you're inclined to be as generous with your petty cash as I was with my time writing this!" },
  "firstbot": { url: "/coding-walkthroughs/your_basic_bot.html", snippet: "In this chapter I'll guide you through the development of a simple bot with some useful commands. We'll start with the example we created in the first chapter and expand upon it." }
};

exports.run = (client, msg, [keyword]) => {
  if (guides[keyword]) {
    let details = guides[keyword];
    msg.channel.sendMessage(`${details.snippet}\n**Read More**: <${base_url}${details.url}>`);
  } else if (keyword === "list") {
    msg.channel.sendMessage(`Available keywords for this command:\n${Object.keys(guides).join(", ")}`);
  } else {
    let details = guides["home"];
    msg.channel.sendMessage(`${details.snippet}\n**Read More**: <${base_url}${details.url}>`);
  }
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "guide",
  description: "Returns page details from root's awesome bot guide.",
  usage: "[list:literal|keyword:str]",
  usageDelim: ""
};
