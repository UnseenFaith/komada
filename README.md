# GuideBot

> "Stay a while, and listen!"

Guidebot is a very simple bot that I'm using on the 
[Discord.js Official](https://discord.gg/bRCvFy9) server to provide links to my 
[Discord.js Bot Guide](https://www.gitbook.com/book/eslachance/discord-js-bot-guide/details).

## Installing this

There's not "installation" per se, this isn't a module but really just an example code. To get it, run this: 

```
git clone https://github.com/eslachance/guidebot.git
```


## Command Handler Explainer

It's also used as one of the most basic examples of a "proper" command handler where each command is in a separate file. 
There are 3 parts to the command handler. 

### 1: Making a Command:
The very basic code for making a command is this (you may use it as a template):

```js
exports.run = (bot, msg, params = []) => {
  // do stuff
};

exports.help = {
  name : "command",
  description: "Command Description",
  usage: "command <argument>"
};
```

Currently, the `//do stuff` code is *the same* as you would normally use inside a normal message handler, 
so you can use `msg.channel.sendMessage("blah")`, check `msg.author.id`, etc. The `help` object is used by
the `help` command provided in this repository.

There are a few commands also provided as an example, for instance `ping`. `guide` is a command I personally use for this
bot, obviously there's no need to use it yourself but it shows a way to add some external data in the form of an object added
at the top of the file.

### 2: How the code loads the commands

This is the part that actually loads the commands in memory: 

```js
// Uses Discord.Collection() mostly for the helpers like `map()`, to be honest.
bot.commands = new Discord.Collection();
// Load the contents of the `/cmd/` folder and each file in it.
fs.readdir(`./cmd/`, (err, files) => {
  if(err) console.error(err);
  console.log(`Loading a total of ${files.length} commands.`);
  // Loops through each file in that folder
  files.map(f=> {
    // require the file itself in memory
    let props = require(`./cmd/${f}`);
    console.log(`Loading Command: ${props.help.name}. :ok_hand:`);
    // add the command to the Collection
    bot.commands.set(props.help.name, props);
  });
});
```

Keen eyes may realize that I'm adding the commands straight into `bot.commands` which literally extends the `bot` object.
The reason I'm doing this is to prevent overloading the function calling the commands with a whole lot of arguments. 
Otherwise, `exports.run = (bot, msg, params = []) => {` might look more like `exports.run = (bot, msg, params = [], reload, 
commands, etc, something else, blah, whatever) => {`

It's a question of readability to be honest, and as far as know, will not cause any issues unless you decide to run `bot.destroy()`...

### 3: How the bot runs the commands

The `message` handler is often the bigget part of a discord.js bot file... but here it's small, and elegant: 

```js
bot.on('message', msg => {
  // Ignore message with no prefix for performance reasons
  if(!msg.content.startsWith(config.prefix)) return;
  // Get the command by getting the first part of the message and removing  the prefix.
  var command = msg.content.split(" ")[0].slice(config.prefix.length);
  // Get the params in an array of arguments to be used in the bot
  var params = msg.content.split(" ").slice(1);

  if(bot.commands.has(command)) {
    var cmd = bot.commands.get(command);
    // restricted commands (with ID for now). If ID is wrong, exit and return
    if(cmd.help.restrict && !cmd.help.restrict(msg.author.id)) return;
    // Run the `exports.run()` function defined in each command.
    cmd.run(bot, msg, params);
  }
});
```

The rest of the bot file is pretty much your standard stuff. Require some files, log some events, login with the token and stuff.
