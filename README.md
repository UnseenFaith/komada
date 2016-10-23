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
    forceFetchUsers: true
  }
});
```

Then, run the following in your folder:

```
npm install
node app.js
```

> Requires Node 6 or higher (because discord.js requires that), also requires Discord.js v10 (currently #indev), installed automatically with `npm install`.
