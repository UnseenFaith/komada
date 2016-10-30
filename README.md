# Komada

[![Discord](https://discordapp.com/api/guilds/234357395646578688/embed.png)](https://discord.gg/bRCvFy9)
[![npm](https://img.shields.io/npm/v/komada.svg?maxAge=3600)](https://www.npmjs.com/package/komada)
[![npm](https://img.shields.io/npm/dt/komada.svg?maxAge=3600)](https://www.npmjs.com/package/komada)
[![David](https://img.shields.io/david/eslachance/komada.svg?maxAge=3600)](https://david-dm.org/eslachance/komada)

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
  "ownerid" : "your-user-id",
  "clientID": "the-invite-app-id",
  "prefix": "+",
  "functions": [],
  "commandInhibitors": ["disable", "permissions", "missingBotPermissions"],
  "dataHandlers": [],
  "clientOptions": {
    "fetchAllMembers": true
  }
});
```

Then, run the following in your folder:

```
npm install
node app.js
```

> Requires Node 6 or higher (because Discord.js requires that), also requires Discord.js v10, installed automatically with `npm install`.

## Quick & Dirty Reference Guide
> For creating your own pieces

Essentially, the way Komada works is that we have *core* pieces (functions, events, commands, etc.) loaded automatically. 
But you can add your own pieces easily by adding files to your *local* folders (which are created on first load).

These pieces are: 
- **commands** which add in-chat functionality to your bot.
- **functions** which can be used by other pieces or anywhere in the bot.
- **dataHandlers** which are database connectors (in progress at the moment).

### Creating a new command

New commands are created in the `./commands/` folder, where subfolders are
the categories offered in the help command. For instance adding `./commands/Misc/test.js`
will create a command named `test` in the `Misc` category. Subcategories can
also be created by adding a second folder level.

> If a command is present both in the *core* folders and your client folders, 
your command will override the core one. This can let you modify the core
behaviour. Note also that you cannot have more than one command with the same name.

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

`[...args]` represents a variable number of arguments give when the command is
run. The name of the arguments in the array (and their count) is determined
by the `usage` property and its given arguments.

**Non-obvious options**: 
- **enabled**: Set to false to completely disable this command, it cannot be forecefully enabled.
- **aliases**: Array of aliases for the command, which will *also* trigger it.
- **permLevel**: Permission level, controlled via `./functions/permissionLevel.js`.
- **botPerms**: An array of permission strings (such as `"MANAGE_MESSAGES"`) required for the command to run.
- **requiredFuncs**: An array of function names required for this command to execute (dependency).
- **usage**: The usage string as determined by the Argument Usage (see below).

#### Command Arguments

**Usage Structure**

`<>` required argument, `[]` optional argument
`<Name:Type{min,max}>`

- **Name** Mostly used for debugging message, unless the type is Litteral in which it compares the argument to the name.
- **Type** The type of variable you are expecting.
- **Min, Max** Minimum or Maximum for a giving variable (works on strings in terms of length, and on all types of numbers in terms of value) You are allowed to define any combination of min and max. Omit for none, `{min}` for min, `{,max}` for max.
- **Special Repeat Tag** `[...]` will repeat the last usage optionally until you run out of arguments. Useful for doing something like `<SearchTerm:str> [...]` which will allow you to take as many search terms as you want, per your Usage Delimiter.

**Usage Types**

- `literal` : Literally equal to the Name. This is the default type if none is defined.
- `str`, `string` : Strings.
- `int`, `integer` : Integers.
- `num`, `number`, `Float` : Floating point numbers.
- `url` : A URL.
- `msg`, `message` : A message object returned from the message ID (now using fetchMessage as of d3d498c99d5eca98b5cbcefb9838fa7d96f17c93).
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