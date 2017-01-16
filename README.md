# Komada

[![Discord](https://discordapp.com/api/guilds/260202843686830080/embed.png)](https://discord.gg/dgs8263)
[![npm](https://img.shields.io/npm/v/komada.svg?maxAge=3600)](https://www.npmjs.com/package/komada)
[![npm](https://img.shields.io/npm/dt/komada.svg?maxAge=3600)](https://www.npmjs.com/package/komada)
[![Build Status](https://travis-ci.org/dirigeants/komada.svg?branch=indev)](https://travis-ci.org/dirigeants/komada)
[![David](https://img.shields.io/david/dirigeants/komada.svg?maxAge=3600)](https://david-dm.org/dirigeants/komada)

> "Stay a while, and listen!"

Komada is a modular framework for bots built on top of [Discord.js](https://github.com/hydrabolt/dicord.js). It offers an extremely easy installation, downloadable commands, and a framework to build your own commands, modules, and functions.

## Installing Komada

Time to take the plunge! Komada is on NPM and can be easily installed.

> I assume you know how to open a command prompt in a folder where you want to install this. Please don't prove me wrong.

```
npm install --save komada
```

Create a file called `app.js` (or whatever you prefer) which will initiate and configure Komada.

```js
const komada = require('komada');
komada.start({
  "botToken": "your-bot-token",
  "ownerID" : "your-user-id",
  "clientID": "the-invite-app-id",
  "prefix": "+",
  "clientOptions": {
    "fetchAllMembers": true
  }
});
```

> For all you selfbot users out there, you can add a option ('selfbot': true) to have Komada enabled for selfbot usage. i.e. only respond to commands from you.

Then, run the following in your folder:

```
npm install
node app.js
```

> Requires Node 6 or higher (because Discord.js requires that), also requires Discord.js v11, installed automatically with `npm install`.

## Quick & Dirty Reference Guide
> For creating your own pieces

Essentially, the way Komada works is that we have *core* pieces (functions, events, commands, etc.) loaded automatically.
But you can add your own pieces easily by adding files to your *local* folders (which are created on first load).

These pieces are:
- **commands** which add in-chat functionality to your bot.
- **functions** which can be used by other pieces or anywhere in the bot.
- **inhibitors** which are used to check if a command should be run or not.
- **monitors** which are used to check a message before it's a command.
- **events** which are triggered based on what happens in Discord.
- **dataProviders** which are database connectors (in progress at the moment).
- **methods** which are native Discord.js functions

### Creating a new command

New commands are created in the `./commands/` folder, where subfolders are
the categories offered in the help command. For instance adding `./commands/Misc/test.js`
will create a command named `test` in the `Misc` category. Subcategories can
also be created by adding a second folder level.

> If a command is present both in the *core* folders and your client folders,
your command will override the core one. This can let you modify the core
behavior. Note also that you cannot have more than one command with the same name.

```js
exports.run = (client, msg, [...args]) => {
  // Place Code Here
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: [],
  permLevel: 0,
  botPerms: [],
  requiredFuncs: []
};

exports.help = {
  name: "name",
  description: "Command Description",
  usage: "",
  usageDelim: ""
};
```
> Tip: If you need something created before the command is ever ran, you can specify
exports.init = (client) => {...} to make Komada run that portion of code beforehand.

`[...args]` represents a variable number of arguments give when the command is
run. The name of the arguments in the array (and their count) is determined
by the `usage` property and its given arguments.

**Non-obvious options**:
- **enabled**: Set to false to completely disable this command, it cannot be forcefully enabled.
- **aliases**: Array of aliases for the command, which will *also* trigger it.
- **permLevel**: Permission level, controlled via `./functions/permissionLevel.js`.
- **selfbot**: Set to true to only load this command if the bot is configured to be a selfbot.
- **botPerms**: An array of permission strings (such as `"MANAGE_MESSAGES"`) required for the command to run.
- **requiredFuncs**: An array of function names required for this command to execute (dependency).
- **usage**: The usage string as determined by the Argument Usage (see below).

#### Command Arguments

**Usage Structure**

`<>` required argument, `[]` optional argument
`<Name:Type{min,max}>`

- **Name** Mostly used for debugging message, unless the type is Literal in which it compares the argument to the name.
- **Type** The type of variable you are expecting.
- **Min, Max** Minimum or Maximum for a giving variable (works on strings in terms of length, and on all types of numbers in terms of value) You are allowed to define any combination of min and max. Omit for none, `{min}` for min, `{,max}` for max.
- **Special Repeat Tag** `[...]` will repeat the last usage optionally until you run out of arguments. Useful for doing something like `<SearchTerm:str> [...]` which will allow you to take as many search terms as you want, per your Usage Delimiter.

**Usage Types**

- `literal` : Literally equal to the Name. This is the default type if none is defined.
- `str`, `string` : Strings.
- `int`, `integer` : Integers.
- `num`, `number`, `Float` : Floating point numbers.
- `boolean`, : A true or false statement.
- `url` : A URL.
- `msg`, `message` : A message object returned from the message ID (now using fetchMessage as of d3d498c99d5eca98b5cbcefb9838fa7d96f17c93).
- `role` : A role object returned from the role ID or mention.
- `channel` : A channel object returned from the channel ID or channel tag.
- `guild` : A guild object returned from the guild ID.
- `user`, `mention` : A user object returned from the user ID or mention.

### Creating an event

Events are placed in `./events/` and their filename must be `eventName.js`.
If a conflicting event is present in both the core and your client, *both* are
loaded and will run when that event is triggered.

Their structure is the following :

```js
exports.run = (client, [...args]) => {
  // event contents
};
```

Where `[...args]` are arguments you would *normally* get from those events.
For example, while the `ready` event would only have `(client)`, the
`guildMemberAdd` event would be `(guild, member)`.

### Creating a function

Functions are available throughout the system, from anywhere. Since they are the
first thing loaded, every other piece can access them. Functions are loaded as
core first, and if your code contains a function of the same name it overrides
the core function.

Their structure is somewhat freeform, in that they can contain a single function,
or they may be a module composed of more than one functions as a module. It's
not supposed to, but let's keep it between you and me, alright?

```js
module.exports = (str) => {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};
```

The arguments are arbitrary - just like a regular function. It may, or may not,
return anything. Basically any functions. You know what I mean.

### Creating Inhibitors

Inhibitors are only ran on commands. They are used to check a variety of conditions
before a command is ever ran, such as checking if a user has the right amount of permissions
to use a command. Inhibitors are loaded as core first, and if your code contains a inhibitor
of the same name it overrides the core inhibitor.

Their structure is restricted, meaning to work they must be defined exactly like this.

```js
exports.conf = {
  enabled: true,
  spamProtection: false,
};

exports.run = (client, msg, cmd) => {
  // code here
}
```

> Note: The order does not matter.

### Creating Monitors

Monitors are special in that they will always run on any message. This is particularly
useful when you need to do checking on the message, such as checking if a message
contains a vulgar word (profanity filter). They are almost completely identical to
inhibitors, the only difference between one is ran on the message, and the other
is ran on the command. Monitors are loaded as core first, and if your code contains
a monitor of the same name it overrides the core monitor.

Their structure is identical to inhibitors, being the only difference is that you
don't pass a command parameter to them.

```js
exports.conf = {
  enabled: true,
  spamProtection: false,
};

exports.run = (client, msg) => {
  // code here
};
```

> Note: Technically, this means that monitors are message events. You can use this trick
to get around the normal amount of message events in Komada.. *cough*

### Using Methods

Methods are just Discord.js native functions added to Komada, so that we may
export them to any other piece that we may need them in. For example, if your bot
a larger bot and you need to make use of the shardingManager, but can't do since
it's a native Discord.js function, well now you can.

Current Methods are:
Collections => `client.methods.Collection`
Rich Embed Builder => `client.methods.Embed`
Message Collector => `client.methods.MessageCollector`
WebhookClient => `client.methods.Webhook`

To use any of the methods, you follow this same structure:
```js
let method = new client.methods.<MethodName>(OptionalMethodProperties);
```

So if you need to create a Message Collector, you will do:
```js
let messageCollector = new client.methods.MessageCollector(channelid, filter, options);
```
