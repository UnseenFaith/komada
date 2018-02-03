# Permission Levels (aka PermStructure or Permission Structure)

Permission levels allow you to tailor your bot to only run commands for whomever you want. This structure is always ran when checking for commands, and is also ran when checking for things like: "Should this command that the user can't use be displayed
in the help menu?". Permission levels can do almost anything you want as long as you follow the structure correctly.

By default Komada comes with the following permission levels:

```js
const defaultPermStructure = new PermissionLevels()
  .addLevel(0, false, () => true)
  .addLevel(2, false, (client, msg) => {
    if (!msg.guild || !msg.guild.settings.modRole) return false;
    const modRole = msg.guild.roles.get(msg.guild.settings.modRole);
    return modRole && msg.member.roles.has(modRole.id);
  })
  .addLevel(3, false, (client, msg) => {
    if (!msg.guild || !msg.guild.settings.adminRole) return false;
    const adminRole = msg.guild.roles.get(msg.guild.settings.adminRole);
    return adminRole && msg.member.roles.has(adminRole.id);
  })
  .addLevel(4, false, (client, msg) => msg.guild && msg.author.id === msg.guild.owner.id)
  .addLevel(9, true, (client, msg) => msg.author.id === client.config.ownerID)
  .addLevel(10, false, (client, msg) => msg.author.id === client.config.ownerID);
  ```

  Basically, this means that Commands with the permission level:
  - 0, Everyone can use.
  - 2, Only those with the modRole can use
  - 3, Only those with the adminRole can use.
  - 4, Only those who are the GuildOwner can use.
  - 9-10, Only the bot owner can use these.

  > Permission Level 9 is a very special one. The difference between 9 and 10 is that we break on 9. Basically, breaking means that if you don't have the required permission level, Komada should respond back to you telling you that you can't use the command.
  > This allows you to have special interactions when certain people use the commands, such as silent admin commands.

# Completely new Permission structure
If you want to completely get rid of the default permStructure and create your own, you will do this in the file that you declare a new Komada client. Here's a starting point that you can use.
```js
const { Client, PermissionLevels } = require("komada");

const client = new Client({
  ownerID : "your-user-id",
  prefix: "+",
  clientOptions: {
    fetchAllMembers: false,
  },
});

client.login("your-bot-token");
```

You'll notice we destructured Komada since we only need access to Client and PermissionLevels. To get started with PermissionLevels you'll first create a new class and set it to a variable.
```js
const { Client, PermissionLevels } = require("komada");

const permStructure = new PermissionLevels();

const client = new Client({
  ownerID : "your-user-id",
  prefix: "+",
  clientOptions: {
    fetchAllMembers: false,
  },
});

client.login("your-bot-token");
```

Now that you've created your new PermissionLevels and assigned it to a variable, there are two ways you can add to this new structure. Both of these are valid and supported ways of adding levels.

```js
const { Client, PermissionLevels } = require("komada");

/** First Way */
const permStructure = new PermissionLevels();
permStructure.addLevel(0, false, () => true);
permStructure.addLevel(10, false, (client, msg) => msg.author === client.owner);

/** Second Way */
const permStructure = new PermissionLevels()
  .addLevel(0, false () => true)
  .addLevel(10, false, (client, msg) => msg.author === client.owner);

const client = new Client({
  ownerID : "your-user-id",
  prefix: "+",
  clientOptions: {
    fetchAllMembers: false,
  },
});

client.login("your-bot-token");
```

And now that you've created your new permStructure with your new levels, all you need to do is let Komada know you want to use this one instead, and we do this by simply passing it as a configuration option, like so:
```js
const { Client, PermissionLevels } = require("komada");

const permStructure = new PermissionLevels()
  .addLevel(0, false () => true)
  .addLevel(10, false, (client, msg) => msg.author === client.owner);

const client = new Client({
  ownerID : "your-user-id",
  prefix: "+",
  permStructure,
  clientOptions: {
    fetchAllMembers: false,
  },
});

client.login("your-bot-token");
```

And that's all you need to do. Now you have a new permStructure with just two levels.

# Edit the Existing Permission Structure
If you want to edit the existing permStructure in Komada you can do so after creating your client.

```js
const { Client } = require("komada");

const client = new Client({
  ownerID : "your-user-id",
  prefix: "+",
  clientOptions: {
    fetchAllMembers: false,
  },
});

client.permStructure.addLevel(8, false, (client, msg) => msg.author.username === "Faith");

client.login("your-bot-token");
```

> Please note that you will not be able to edit already existing permLevels in the default structure, so if you're looking to overwrite a default permission level you should check the other portion of this guide instead.

# Final Words
That about sums up permission levels. If you're having issues with this or don't quite understand whats happening, I encourage you to read the documentation on [PermissionLevels](https://dirigeants.github.io/komada/PermissionLevels.html). If you still don't understand after reading the documentation, then hop on our Discord server and we'll be more than happy to explain to you what you don't understand.
