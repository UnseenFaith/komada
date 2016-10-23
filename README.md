# Komada

> "Stay a while, and listen!"

Komada is a very simple bot that I'm using on the
[Discord.js Official](https://discord.gg/bRCvFy9) server to provide links to my
[Discord.js Bot Guide](https://www.gitbook.com/book/eslachance/discord-js-bot-guide/details).

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
