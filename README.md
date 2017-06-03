# Komada Framework Documentation

[![Discord](https://discordapp.com/api/guilds/260202843686830080/embed.png)](https://discord.gg/dgs8263)
[![npm](https://img.shields.io/npm/v/komada.svg?maxAge=3600)](https://www.npmjs.com/package/komada)
[![npm](https://img.shields.io/npm/dt/komada.svg?maxAge=3600)](https://www.npmjs.com/package/komada)
[![Greenkeeper badge](https://badges.greenkeeper.io/dirigeants/komada.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/dirigeants/komada.svg?branch=indev)](https://travis-ci.org/dirigeants/komada)
[![David](https://img.shields.io/david/dirigeants/komada.svg?maxAge=3600)](https://david-dm.org/dirigeants/komada)

Komada is a modular framework for bots built on top of [Discord.js](https://github.com/hydrabolt/dicord.js). It offers an extremely easy installation, downloadable commands, and a framework to build your own commands, modules, and functions.

## What's with the name?

Komada is the Croatian word for "pieces", such as puzzle pieces. As usual to find my software name I just shove english words in a translator and see what comes out. But why "pieces"? Because Komada is modular, meaning each "piece" is a standalone part that can be easily replaced, enhanced, reloaded, removed.

## Installing Komada

Time to take the plunge! Komada is on NPM and can be easily installed.

> I assume you know how to open a command prompt in a folder where you want to install this. Please don't prove me wrong.

```
npm install --save komada
```

Create a file called `app.js` (or whatever you prefer) which will initiate and configure Komada.

```js
const komada = require("komada");

const client = new komada.Client({
  ownerID : "your-user-id",
  prefix: "+",
  clientOptions: {
    fetchAllMembers: true,
  },
});

client.login("your-bot-token");
```

### Configuration Options

- **botToken**: The MFA token for your bot. To get this, please see [This discord.js Getting Started Guide](https://anidiotsguide.gitbooks.io/discord-js-bot-guide/getting-started/the-long-version.html), which explains how to create the bot and get the token.
- **ownerID**: The User ID of the bot owner - you. This gives you the highest possible access to the bot's default commands, including eval! To obtain it, enable Developer Mode in Discord, right-click your name and do "Copy ID".
- **clientID**: The bot's client ID obtained from the same place you got the token. It's at the top of the page!
- **prefix**: The default prefix when the bot first boots up. This option becomes useless after first boot, since the prefix is written to the default configuration system.
- **clientOptions**: These are passed directly to the discord.js library. They are optional. For more information on which options are available, see [ClientOptions in the discord.js docs](https://discord.js.org/#/docs/main/stable/typedef/ClientOptions).
- **permStructure**: It allows you to configure the permission levels from Komada, with a range of 0-10. You can also use `Komada.PermLevels` constructor.

> Komada automatically detects selfbot mode, and takes appropriate precautions, such as not responding to anyone but yourself.

## Running the bot

Then, run the following in your folder:

```
npm install
node app.js
```

> **Requirements**: This version of Komada requires Node 7.6.0 or higher to run. Depends on Discord.js v11.1.0 or higher (the appropriate version is automatically installed).
