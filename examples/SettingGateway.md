# SettingGateway

SettingGateway is an object-oriented and highly dynamic settings system designed to provide a full interface of settings, which works in a NoSQL environment but that it is also able to work with SQL.

The concept of SettingGateway is designed to provide users a very useful interface for most things, for example, as in 0.20.6, you can create new instances of it, in which, each instance is able to handle a completely different schema and database.

This system has been implemented in Komada **0.20.3**, after the PR [#255](https://github.com/dirigeants/komada/pull/255), still far from its concept level, it has been able to provide users a fully functional system that is able to work with any provider from [komada-pieces](https://github.com/dirigeants/komada-pieces), check the [Providers](https://dirigeants.github.io/komada/module-Provider.html) page for further information about them, and [SettingGateway](https://dirigeants.github.io/komada/SettingGateway.html)'s documentation.

By default, Komada uses the [json](https://github.com/dirigeants/komada/blob/master/src/providers/json.js) provider by default, do not scream about it and insta-replace with SQLite, Komada's JSON provider writes the data [**atomically**](https://en.wikipedia.org/wiki/Atomicity_(database_systems)), in other words, it is very rare for the data to corrupt.

However, as Komada works on a [**NoSQL**](https://en.wikipedia.org/wiki/NoSQL) environment, the data cannot be used directly, for that, you need a special set of methods that defines a [ProviderSQL](https://dirigeants.github.io/komada/module-ProviderSQL.html) which is required for the [SQL](https://dirigeants.github.io/komada/SQL.html) engine to work.

## Change the *provider's engine*.

For example, let's say I have downloaded the *levelup* provider and I want to work with it, then we go to your main script file (`app.js`, `bot.js`..., wherever you declare the new Komada.Client), and write the following code:
```js
provider: { engine: "levelup" }
```

Your Komada's configuration will look something like this:
```js
const client = new Komada.Client({
  ownerID: "",
  prefix: "k!",
  clientOptions: {},
  provider: { engine: "levelup" },
});

client.login("...");
```
And now, you're using levelup's provider to store the data from SettingGateway.

What happens when I use an engine that does not exist as a provider? Simply, SettingGateway will throw an error, it is enough user-friendly and readable, if that happens, make sure you wrote the provider's name correctly.

## Add new 'keys' to the guild settings.

As [`SettingGateway`](https://dirigeants.github.io/komada/SettingGateway.html) extends [`SchemaManager`](https://dirigeants.github.io/komada/SchemaManager.html), you can easily add new keys to your schema by simply calling `SettingGateway#add` (inherited from [`SchemaManager#add`](https://dirigeants.github.io/komada/SchemaManager.html#add)) by running this:

```js
client.settings.guilds.add(key, options, force?);
```

Where:
- `key` is the key's name to add, `String` type.
- `options` is an object containing the options for the key, such as `type`, `default`, `sql`, `array`...
- `force` (defaults to `true`) is whether SchemaManager should update all documents/rows to match the new schema, using the `options.default` value.

For example, let's say I want to add a new settings key, called `modlogs`, which takes a channel.

```js
client.settings.guilds.add("modlogs", { type: "TextChannel" });
```

This will create a new settings key, called `modlogs`, and will take a `TextChannel` type.

> The `TextChannel` type has been implemented in `0.20.7` as a critical security measurement to avoid server administrators to set up channels in the wrong type, for example, configuring the modlogs channels in a `VoiceChannel` one. 

> As in `0.20.7`, the force parameter defaults to `true` instead to `false`. It is also recommended to use it as it can avoid certain unwanted actions.

But now, I want to add another key, with name of `users`, *so I can set a list of blacklisted users who won't be able to use commands*, which will take an array of Users.

```js
client.settings.guilds.add("users", { type: "User", array: true });
```

> `options.array` defaults to `false`, and when `options.default` is not specified, it defaults to `null`, however, when `options.array` is `true`, `options.default` defaults to `[]` (empty array).

# Editing keys from the guild settings.

Now that I have a new key called `modlogs`, I want to configure it outside the `conf` command, how can we do this?

```js
client.settings.guilds.update(msg.guild, { modlogs: "267727088465739778" });
```

Check: [SettingGateway#update](https://dirigeants.github.io/komada/SettingGateway.html#update)

> You can use a Channel instance, [SettingResolver](https://dirigeants.github.io/komada/SettingResolver.html) will make sure the input is valid and the database gets an **ID** and not an object.

Now, I want to **add** a new user user to the `users` key, which takes an array.

```js
client.settings.guilds.updateArray(msg.guild, "add", "users", "146048938242211840");
```

That will add the user `"146048938242211840"` to the `users` array. To remove it:

```js
client.settings.guilds.updateArray(msg.guild, "remove", "users", "146048938242211840");
```

Check: [SettingGateway#updateArray](https://dirigeants.github.io/komada/SettingGateway.html#updateArray)

# Removing a key from the guild settings.

I have a key which is useless for me, so I *want* to remove it from the schema.

```js
client.settings.guilds.remove("users");
```

> Do not confuse `SchemaManager#remove` and `SchemaManager#delete`, the first one deletes an entry from the schema, whereas the second deletes an entry for the selected key from the database.

# Add a key to the guild settings if it doesn't exist.

In [Komada-Pieces](https://github.com/dirigeants/komada-pieces/), specially, some pieces require a key from the settings to work, however, the creator of the pieces does not know if the user who downloads the piece has it, so this function becomes is useful in this case.

```js
async function() {
  if (!client.settings.guilds.schema.modlog) {
    await client.settings.guilds.add("modlog", { type: "TextChannel" });
  }
}
```

# How can I create new SettingGateway instances?

**1.** By using [SettingsCache](https://dirigeants.github.io/komada/SettingsCache.html), (available from `client.settings`).

Let's say I want to add a new SettingGateway instance, called `users`, which input takes users, and stores a quote which is a string between 2 and 140 characters.

```js
async function validate(resolver, user) {
  const result = await resolver.user(user);
  if (!result) throw "The parameter <User> expects either a User ID or a User Object.";
  return result;
};

const schema = {
  quote: {
    type: "String",
    default: null,
    array: false,
    min: 2,
    max: 140,
  },
};

client.settings.add("users", validate, schema);
```

> The `validate` function must be a [**function**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function), not a [**Arrow Function**](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions), the difference between them is that an arrow function binds `this` to wherever the function has been created (for example, the `exports` from your eval command, if you are doing this with eval), while the normal functions does not do this.

> If the `validate` function does not resolve **Guild** type, you might want to use the third argument of `SettingGateway#update`, which takes a Guild resolvable.

And then, you can access to it by:

```js
client.settings.users;
``` 

**2.** By extending SettingGateway (you can use it in `require("komada").SettingGateway`), which is a bit hacky but gives you total freedom and customization, this method may not completely work and needs some knowledge, however, as this practise is not completely supported, nothing stops you from doing this.
