# Komada

> "Stay a while, and listen!"

Komada is a very simple bot that I'm using on the
[Discord.js Official](https://discord.gg/bRCvFy9) server to provide links to my
[Discord.js Bot Guide](https://www.gitbook.com/book/eslachance/discord-js-bot-guide/details).

## Installing this

There's not "installation" per se, this isn't a module but really just an example code. To get it, run this:

```
git clone https://github.com/eslachance/komada.git
```

Create a file called `config.json` with the following content (adjusted to your needs of course):

```json
{
  "botToken": "Your-Bot-Token-Here",
  "ownerid" : "your-user-id",
  "prefix": "?"
}
```

> you can copy `config.json.example` to `config.json` and modify that instead, too!

Then, run the following in your folder:

```
npm install
node app.js
```

> Requires Node 6 or higher (because discord.js requires that), also requires Discord.js v10 (currently #indev), installed automatically with `npm install`.

**DOCUMENTATION IS UPCOMING FOR COMMAND PARSERS AND MORE**
