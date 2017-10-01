# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- [[#364](https://github.com/dirigeants/komada/pull/364)] Command Defaulting
- [[#356](https://github.com/dirigeants/komada/pull/356)] New Logging && Console Class

### Changed
- [[#364](https://github.com/dirigeants/komada/pull/364)] Aliases now hold references to the command object instead of just the command name.
- [[#356](https://github.com/dirigeants/komada/pull/356)] Removed env var support. Auto-detect src folders etc. Allow users to provide a absolute/relative path to custom clientBaseDir
- [[#356](https://github.com/dirigeants/komada/pull/356)] D.JS moved to Peer Dependency. `npm i --production hydrabolt/discord.js` must be run as well now.

### Fixed
- [[a22b924](https://github.com/dirigeants/komada/commit/a22b924a72608309c7b386043b154ed062103e7b)] Fixes reloading pieces
- [[#356](https://github.com/dirigeants/komada/pull/356)] Fixes caching provider (Collection)
- [[#358](https://github.com/dirigeants/komada/pull/358)] Fixes SG Config Generation

### Removed
- [[#356](https://github.com/dirigeants/komada/pull/356)] dotenv is removed as a peerDependency
- [[#356](https://github.com/dirigeants/komada/pull/356)] Chalk removed as a dependency
- [[#356](https://github.com/dirigeants/komada/pull/356)] Package-Locks are no more.


## [0.20.10] - Classbased - 2017-09-07
### Added
- [[#347](https://github.com/dirigeants/komada/pull/347)] Merge Function for options.
- [[#343](https://github.com/dirigeants/komada/pull/343)] Komada extendables are now a thing.
- [[#323](https://github.com/dirigeants/komada/pull/323)] Documentation to all pieces.
- [[#323](https://github.com/dirigeants/komada/pull/323)] Added the types `TextChannel` and `VoiceChannel` to the
compatible types for `SchemaManager`, as a way to prevent security issues.
- [[#322](https://github.com/dirigeants/komada/pull/322)] SettingGateway is now capable to handle asynchronous cache for
internal parsing.
- [[#313](https://github.com/dirigeants/komada/pull/317)] Added `client.settings`, to handle multiple
instances of SettingGateway.
- [[#317](https://github.com/dirigeants/komada/pull/317)] `client.owner` is now a thing.
- [[#298](https://github.com/dirigeants/komada/pull/298)] `config.ownerID` is automatically detected now.
- [[#291](https://github.com/dirigeants/komada/pull/291)] `getResolved` method, which returns the resolved configuration
from a Guild.
- [[#289](https://github.com/dirigeants/komada/pull/289)] Added SQL compatibility.
- [[#289](https://github.com/dirigeants/komada/pull/289)] SQL property for Schema.
- [[#289](https://github.com/dirigeants/komada/pull/289)] SQL Class.
- [[#289](https://github.com/dirigeants/komada/pull/289)] `schema` getter for `SettingGateway`, as a shortcut of
`SettingGateway.SchemaManager.schema`.
- [[#289](https://github.com/dirigeants/komada/pull/289)] `schemaManager` getter for `Client`, as a shortcut of
`Client.SettingGateway.SchemaManager`.
- [[#289](https://github.com/dirigeants/komada/pull/289)] Added `SQL` and `settingResolver`classes to `index.js`.
- [[#284](https://github.com/dirigeants/komada/pull/284)] Added `Provider#shutdown()`, for providers that need to close
the connection before re-initing.
- [[#283](https://github.com/dirigeants/komada/pull/283)] Added `CMD.conf.requiredSettings`, to prevent commands from
being executed if the Guild's configuration misses a key.
- [[#258](https://github.com/dirigeants/komada/pull/258)] Added version - `require("komada").version`.
- [[#257](https://github.com/dirigeants/komada/pull/257)] Added `config.disableLogTimestamps`. If `true`, all logs from
Komada's logger will not longer print messages with timestamps.
- [[#257](https://github.com/dirigeants/komada/pull/257)] Added `config.disableLogColor`. If `true`, all logs from
Komada's logger will not longer print messages with colours.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[BREAKING]** Added... **SettingGateway**. A centralized
setting system which parses and handles everything. Relies on **Providers**.
- [[#255](https://github.com/dirigeants/komada/pull/255)] Added support to use any data provider as Setting's provider.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[BREAKING]** Added `schemaManager`.
- [[#255](https://github.com/dirigeants/komada/pull/255)] Added `CommandMessage`, `ArgResolver`, `Resolver`, `Loader`,
`parsedUsage`, `SettingsGateway`, `CacheManager` and `SchemaManager` classes to `index.js`.
- [[#255](https://github.com/dirigeants/komada/pull/255)] Added **json** provider.
- [[#254](https://github.com/dirigeants/komada/pull/254)] Added **finalizers** to the `download.js` command.
- [[#253](https://github.com/dirigeants/komada/pull/253)] Added a `client.emit("log", ...);` to the ready event to tell
the developer when the bot has fired the `ready` event.
- [[#253](https://github.com/dirigeants/komada/pull/253)] Added `config.readyMessage` to make the bot send a custom log
in the ready event.
- [[#236](https://github.com/dirigeants/komada/pull/236)] Added **extendables** pieces.
- [[#234](https://github.com/dirigeants/komada/pull/234)] Added aliases for `Message#sendMessage`.
- [[#231](https://github.com/dirigeants/komada/pull/231)] Added a helper class for generating permission levels. It can
be accessed via `require("komada").PermLevels`, and is used via `permlevels.addLevel(level, break, checkFunction)`. Once
you have all levels added, simply pass `permlevels.structure;` to your `client.config` as the **permStructure** property.
- [[#220](https://github.com/dirigeants/komada/pull/220)] Added `client.invite` getter.
- [[#218](https://github.com/dirigeants/komada/pull/218)] Added option to disable core functions. Now you can skip load
of core functions instead of override it.
- [[#197](https://github.com/dirigeants/komada/pull/197)] Command Editing is now possible via setting `config.cmdEditing`
to `true`. You will need to make a few changes to your code to make it work though:
- [[#197](https://github.com/dirigeants/komada/pull/197)] A new messageUpdate core event.
- [[#197](https://github.com/dirigeants/komada/pull/197)] New methods attached to the Discord.js message object to enable
command editing: `message.send`, `message.sendMessage`, `message.sendCode`, `message.sendEmbed`. These methods will cache
the command message and the response message, and edit the response message if the command message is found in the cache.
- [[#197](https://github.com/dirigeants/komada/pull/197)] With the new command cache, you also have access to
`commandMessage sweeping`. These are 2 new Komada configs as integers in seconds: `config.commandMessageLifetime` and
`config.commandMessageSweep`.
- [[#197](https://github.com/dirigeants/komada/pull/197)] Added a timer to the loading.
- [[#197](https://github.com/dirigeants/komada/pull/197)] Finalizers: Functions which are run on after a successful
command. Please Note: All command files must return an Object Promise. You can achieve that by adding the `async`
keyword. `exports.run = __async__ (client, msg, [...args])`.
- [[#197](https://github.com/dirigeants/komada/pull/197)] Command Cooldowns are now available through a new
**inhibitor/finalizer** combo. Simply set `command.conf.cooldown` to an integer in seconds to put a cooldown on that
command.

### Changed
- [[#323](https://github.com/dirigeants/komada/pull/323)] Made `this.provider` a getter in `SQL`, so it updates when
reloading the provider.
- [[#322](https://github.com/dirigeants/komada/pull/322)] **[BREAKING]** `SettingGateway#update`'s arguments are now `key`, `object` and `?guild`, allowing instances of SG which resolver aimed to non-Guild classes to parse correctly. The argument `object` can contain multiple keys. (So SG will update all keys from the object at once). Previously, you could update only a pair `key-value`.
- [[#322](https://github.com/dirigeants/komada/pull/322)] Safer editing when using SettingGateway, now ensuring the settings has been created before inserting the data. (Fixes an issue when the data was inserted without creating it before).
- [[#317](https://github.com/dirigeants/komada/pull/317)] **[BREAKING]** `client.settingGateway` has been changed to
`client.settings`, which is able to handle multiple instances of SettingGateway.
- [[#300](https://github.com/dirigeants/komada/pull/300)] **[Update]** `client.methods.Embed` changed to use Discord.js MessageEmbed.
- [[#297](https://github.com/dirigeants/komada/pull/297)] **[Update]** Abstraction of Settings and slight refactor so its easier to use.
- [[#296](https://github.com/dirigeants/komada/pull/296)] **[Update]** The JSON provider and schemaManager now uses atomics.
- [[#293](https://github.com/dirigeants/komada/pull/293)] **[Performance]** Faster prefix check and resolve for prefixes
stored inside an Array.
- [[#262](https://github.com/dirigeants/komada/pull/262)] **[Performance && Cleanup]** Refactored several pieces.
- [[#262](https://github.com/dirigeants/komada/pull/262)] **[Documentation]** Updated the information from the command
`info.js`.
- [[#259](https://github.com/dirigeants/komada/pull/259)] **[Performance && Cleanup]** The `checkPerms.js` function now
returns `false` if it finds a break. As opposed from breaking the loop and return it at the end of the function.
- [[#257](https://github.com/dirigeants/komada/pull/257)] **[Refactor && Cleanup]** Tweaked `package.json`, and
`requiredFuncs` inhibitor.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[BREAKING]** The way Komada handles configurations.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[BREAKING]** `Message#guildSettings` instead of
`Message#guildConfs`.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[BREAKING]** `Guild#settings` instead of `Guild#conf`.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[Refactor && Cleanup]** Modified `conf.js` command to work
with *SettingGateway*.
- [[#248](https://github.com/dirigeants/komada/pull/248)] **[Cleanup]** Download.js v2.
- [[#246](https://github.com/dirigeants/komada/pull/246)] **[Update]** The command `eval.js` now awaits promises.
- [[#244](https://github.com/dirigeants/komada/pull/244)] **[Dependencies]** Dropped support for `fs-extra-promise` in
favor to `fs-nextra`.
- [[#241](https://github.com/dirigeants/komada/pull/241)] **[Dependencies]** Dropped **Node.js v7.x** support in favor
to **8.x**.
- [[#239](https://github.com/dirigeants/komada/pull/239)] **[Update]** Automate the permLevel structure getter.
- [[#237](https://github.com/dirigeants/komada/pull/237)] **[Refactor && Cleanup]** Added `resolver.js`, cleaned up
`argResolver.js`.
- [[#225](https://github.com/dirigeants/komada/pull/225)] **[Update]** Changed fetchMessages to fetchMessage (backend
change).
- [[#223](https://github.com/dirigeants/komada/pull/223)] **[Update]** Move `handleError` out from the **message** event
to a function.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** Backend is now class based. Users main files
will need to be updated. The interface is the same as creating a discord.js client, only using Komada, and with komada
config. No more use of start, but `client.login(token);` is now required.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Performance]** Usage will no longer be calculated everytime
a command is run, but instead stored in `command.usage`.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Internal]** Usage has been refactored into a **ParsedUsage**
and an **argResolver** class.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Refactor]** The command loading and reload has been
completely refactored for speed. You should be able to load everything in approximately 10% of the time it used to take.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Refactor]** Disconnect, Error, Warn, Message; into core
events rather than in the `app.js` file.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** Changed core log func, into an event. You can
now log anything by running `client.emit("log", data, type);`
- [[#197](https://github.com/dirigeants/komada/pull/197)] **runMessageMonitors** has been moved into the new Message
core event.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Dependencies]** `dotenv` dependency has been changed to a
**peerdep**.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Internal]** Remaining **Utils** have been moved to the
**classes folder**.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[Internal]** Use Discord.Permissions to generate and keep
cached an implied permissions object, instead of generating a new object every time a command is run.

### Fixed
- [[#347](https://github.com/dirigeants/komada/pull/347)] **[BugFix]** Cache deletions corrected to work on failures or successes.
- [[#323](https://github.com/dirigeants/komada/pull/323)] **[BugFix]** `SettingGateway#getResolved` was not accepting
any other table than `guilds`.
- [[#323](https://github.com/dirigeants/komada/pull/323)] **[BugFix]** `CacheManager` was not accepting any other table
than `guilds`.
- [[#323](https://github.com/dirigeants/komada/pull/323)] **[BugFix]** `SQL` was not accepting any other table than
`guilds`.
- [[#322](https://github.com/dirigeants/komada/pull/322)] **[BugFix]** `SettingGateway#sync` not being running properly.
- [[#322](https://github.com/dirigeants/komada/pull/322)] **[BugFix]** Settings not being created properly.
- [[#290](https://github.com/dirigeants/komada/pull/290)] **[BugFix]** Fixed reload commands.
- [[#289](https://github.com/dirigeants/komada/pull/289)] **[BugFix]** If the bot was unable to send a message, the
**reboot** command would never call `process.exit()`.
- [[#289](https://github.com/dirigeants/komada/pull/289)] **[BugFix]** Raceconditions (Functions initing before
Providers and SettingGateway).
- [[#289](https://github.com/dirigeants/komada/pull/289)] **[BugFix]** A few Unhandled Promise Errors.
- [[#282](https://github.com/dirigeants/komada/pull/282)] **[Misc]** A typo in `transfer.js` command.
- [[#277](https://github.com/dirigeants/komada/pull/277)] **[BugFix]** The `download.js` can now identify `require`s
accurately.
- [[#274](https://github.com/dirigeants/komada/pull/274)] **[Performance]** Changed the loops Komada used to build the
help command.
- [[#269](https://github.com/dirigeants/komada/pull/269)] **[BugFix]** Loaders now use `path.resolve` rather than
Template Literals.
- [[#269](https://github.com/dirigeants/komada/pull/269)] **[BugFix]** `sweepCommandMessages` was never running.
- [[#268](https://github.com/dirigeants/komada/pull/268)] **[BugFix]** Fixed `sensitivePattern` being undefined.
- [[#267](https://github.com/dirigeants/komada/pull/267)] **[BugFix]** Fixed the extendables `Message#send` and
`Message#sendMessage` to have arguments handled by `Discord.js`.
- [[#264](https://github.com/dirigeants/komada/pull/264)] **[BugFix]** Fixed an edgecase `cooldown.js` inhibitor
would not remove the entry from the cooldown list, returning negative cooldowns.
- [[#262](https://github.com/dirigeants/komada/pull/262)] **[Misc]** The `runIn.js` inhibitor will now return a more
accurate message when the array is empty.
- [[#256](https://github.com/dirigeants/komada/pull/256)] **[Misc]** Added a couple of dots in the loader's logs.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[BugFix]** GuildSettings works, again.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[Misc]** The colorized space from the timestamps. It's now
gone.
- [[#235](https://github.com/dirigeants/komada/pull/235)] **[BugFix]** Handle file attachments on command editing.
- [[#230](https://github.com/dirigeants/komada/pull/230)] **[Deprecations]** Fixed (more) Discord.js deprecations.
- [[#227](https://github.com/dirigeants/komada/pull/227)] **[Deprecations]** Fixed Discord.js deprecated permissions.
- [[#226](https://github.com/dirigeants/komada/pull/226)] **[BugFix]** Added `finalizer` in the literal argument from
`transfer.js` command.
- [[#207](https://github.com/dirigeants/komada/pull/207)] **[Misc]** The ping from the `ping.js` command is now rounded.
- [[#205](https://github.com/dirigeants/komada/pull/205)] **[Deprecations]** Fixed a lot of Discord.js deprecations.

### Removed
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[Misc]** Removed any reference from the old configuration
system.
- [[#255](https://github.com/dirigeants/komada/pull/255)] **[Misc]** Removed `confs.js` function.
- [[#247](https://github.com/dirigeants/komada/pull/247)] **[Misc]** Removed `config.clientID`, as it's retrieved from
the API. - Removed `config.selfbot`, as Komada detects if either the ClientUser instance is a bot or not.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** generateInvite.js core function in favor of the
Discord.JS generateInvite.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** botpermissions.js core function which was only
used by the generateInvite core function.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** fullUsage.js core function which is now
available in command.usage.fullUsage(msg).
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** addCommmas.js core function. Should use
**.toLocaleString()** instead.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** getFileListing.js core function in favor of the
new loading refactor.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** loadSingleCommand.js core function in favor of
the new loading refactor.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** reload.js core function in favor of the new
loading refactor.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** parseUsage.js core function in favor of the new
parsedUsage class refactor.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** log.js core function in favor of the new log
event.
- exports.getCommand in handleCommand.js in favor of more efficient code.
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** Localizations, and all references to them (per
Faith)
- [[#197](https://github.com/dirigeants/komada/pull/197)] **[BREAKING]** Due to the class rewrite, the module can not
longer be used stand alone. So the start script has been removed from the `package.json`. You can however add your own
start file (as you would if you were using the package as a dependancy) as a work around for using the repo as a stand
alone if you really need to.
- [[#197](https://github.com/dirigeants/komada/pull/197)] Loading utils have been removed in favor of the new loading
refactor.
- [[#197](https://github.com/dirigeants/komada/pull/197)] Implied Permissions has been removed in favor of an internal
discord.js class.

## [0.19.3] - 2017-06-18
### Added
- Readded ParseTags function due to Komada Provider dependency,
- Added Websocket Heartbeat ping to ping command.
- Little bit of Documentation to Extendables
- Message.awaitReactions && Message.createCollector && ReactionCollector
- Message.reactable added to extendables
- Monitors can customize whether to run the monitor on a bot or self now.
- Added readable to make postable, embedable, and attachable more accurate.
- postable, embedable, attachable now apply to any Text Channel for simplicity and to prevent errors down the road.
- Extendables Added (postable, attachable, embedable, etc.)

### Changed
- Usage now gets the prefix from parseCommand, to reduce errors when using commands and escaped prefixes.
- [Cache optimization] After a piece is reloaded, the cache from the `require` gets deleted.
- [Cache optimization] After a piece is loaded inside the collection, the cache from the `require` gets deleted.
- Pieces are now loaded on client side, then core side. (Without duplicating it).
- Komada loads much faster now.
- The function `log` should never display `[object Object]` now.
- When a command fails at load, it should provide full stack error now.
- Changed permissions inhibitor and permissionLevel function to use new Extendables.
- Help command now no longer requires runCommandInhibitors and uses new Extendables.
- Removed several useless lines of code in app.js made redundant by Extendables.

### Fixed
- Minor fixes in ping command and awaitMessage function.
- Usage when you use Boolean types.
- String errors when provided to User/Member usage
- Some other minor fixes for confs and download
- Fixed many issues with double negatives in configuration
- Fixed Multiple Prefixes
- "`client.funcs.log` is not a function" when something was wrong at startup
(events not working or faulty configurations).
- Fixed HandleCommand not passing Arguments to awaitMessage properly.
- Fixed AwaitMessage - Kyra
- Fixed Float Usage not correctly determining if NaN (finally)
- Fixed Usage for the 603rd time. Maybe? Probably not.
- TypeError in awaitMessage.js function, issue #158
- (Hot fix) Fixed help command (was returning BadRequest) on 0.18.5
- (Hot fix) Fixed permissions on DMs (running msg.member.permLevel when the user DMs a command that doesn't have
permissions for).
- Several bugs that would have occurred if loading anything contained a NPM module error.

### Removed
- A bunch of deprecated functions that were moved to utils.
- runCommandInhibitors no longer necessary.

## [0.18.1] - 2017-03-17
### Added
- Added the new utils from `Discord.js#master`: escapeMarkdown and splitMessage are now in `client.methods`.
- Added support for silent inhibitors (if `return true`, it won't send a reply).
- Added Environmental Variable support for clientDir.
- Added regExpEscape function.

### Changed
- Add error.stack to the function log.js to avoid [object Object].
- Disconnect event should now prints a more human readable error instead of `[object Object]`.
- error and warn event errors are now inspected with depth 0, for better debug.
- loading Functions are removed from Functions folder and moved to a Utils folder. (This folder will be there for future
features as well).

### Fixed
- Reloading pieces should now return the error stack in a codeblock.
- Fixed function reload event.
- Fixed command reload all. underlying bug since 0.15.x days.
- Fixed typo in validateData function
- Fixed Default Conf initialize. (No longer outputs undefined)
- Fixed invalid regex for prefixes in parseCommand

### Removed
- client.email redaction from the clean function.

## [0.18.0] - 2017-03-16
### Added
- Added a bunch of unusable configuration options that'll make their debut soon.
- All Bad Requests/Forbiddens.. etc, now properly give a human readable error in console or chat, depending on the error.
*(Not as of (0.17.0).. must be fixed)*
- New Error Creator
- New CommandHandler (Removed it from message event)
- New Core Command "Transfer"
- New extended help feature added.
- New Beta Configuration (Needs heavy testing)
- New Argument Prompting for Commands
- ~~New Initialize Function to alleviate undefined errors~~ Reverted in #139
- New Download Command

### Changed
- ~~All pieces now initialize upon being loaded, in order.~~ ~~Reverted in 0.17.3~~ Reimplemented in 0.17.4 within
`client.on("ready")`.
- Changed Emojis to unicode variants in Reload.js
- Broke down App.js Message Event into several smaller, changeable parts.
- newError changed to send arguments to awaitMessage when errors are from usage
- awaitMessage changed to work perfectly with the new system
- msg.author.permLevel is now available immediately on a message, instead of after inhibitors run correctly.
- Usage Inhibitor is now a function instead, which will help issues with racing and prompts.
- All Inhibitors now return values instead of using promises to resolve or reject.
- Reverted Log function for the time being.
- Many Files to use the new Error creator.
- guildOnly Inhibitor is now a `runIn` Inhibitor.
- Inhibitors now use .some() to determine if more inhibitors should be ran.
- Stats command now uses `<Collection>.reduce` to correctly determine User Count when fetchAllMembers is `false`.
- Changed info to no longer mention Evie because she said she was tired of it... kek.
- New runCommandInhibitors should be much faster and prioritizes inhibitors via a prioritiy configuration setting.
- Old Configuration system now points to the new configuration system, to ease the trouble of updating to newer versions
of Komada.
- Pieces now have  specific order they load in. (Functions, Providers, Commands, Inhibitors, Monitors, Events).
- Confs.js uses new configuration system now.
- Configuration now split into smaller parts as requested.
- Help command is now a Direct Message.
- Async/Await for all pieces && `app.js`.
- dataProviders renamed to Providers.

### Fixed
- Fixed validateData Booleans.
- Fixed Reloading Events not loading new events correctly.
- Fixed Typo in transfer command
- Fixed Usage not working properly with selective
- permissionLevels -> permissionLevel
- Unchanged Package.json links to the repository
- App.js uncaughtWarnings reverted (for now)
- Download.js Fix && Reload.js typo fix.
- Inhibitors now run one by one until one of them fails or all succeed. Fixes race conditions permanently.
- Empty Message errors
- CmdPrompts should now be fixed completely (as of 0.17.0)
- Inhibitors now await
- Usage typos fixed
- LoadFunctions now calls itself when installing a new dependency in a client function
- Fixed Default configuration not being read before guild configurations are created
- Inhibitors now are correctly 'disabled' when set to be.
- Events.... now should be fixed
- Inhibitors now running in the correct order
- Fixed Prompts sending an extra message.
- Help command back to msg.author...
- Help command is now working. `msg.author.permlvl => msg.member.permlvl`.
- Bunch of fixes for Inhibitors/Commands
- Fixed Typo in disable
- Fixed Help Command sending extra message when DMed
- New Configuration system fixed and outputs files correctly now.
- No longer able to kill komada with Client.destroy()
- All Pieces should now initialize in the correct order.
- loadCommands no longer counts/loads "Ghost" commands.
- DMs throwing errors with new Config System && permLevel
- Fixed Reload not erroring on new commands that aren't found
- Fixed Bug on Selfbot mentions introduced with the new Argument Prompts
- Fixed Bug on Help not showing all commands with new Argument System
- Fixed another bug introduced with the new Argument System where Permissions weren't finalized before Prompts.
- Fixed Bug within reload.js that prevented new commands from being loaded
- More Selfbot Bugs Fixed
- More Reload function fixes for commands

### Removed
- Old initialize system (Was borked)
- Old Configuration System
- Selfbot Inhibitor

## [0.12.4] - 2017-01-13
### Added
- confs.getRaw(<Guild>) returns the entire configuration for developers.

### Changed
- confs.addKey(key, defaultValue, min value, max value) and `.setKey()` and `.set()` changed to account for integers.
This is backwards compatible with older versions.

### Fixed
- Dependecy Issue with Upstream Dependency changing repo structure.
- Commands can now be used in DM with proper permission levels
- Tons of Confs fixes and changes to be more consistent.

### Removed
- Removed `client.methods.Shard` aka `ShardingManager` due to how Sharding works (ie. Needs an additional file to spawn
the ShardingManager)

## [0.12.0] - 2016-12-15
### Added
- client.methods.MethodName

### Changed
- ownerid is now following camelCase (ownerID). If this not changed in your client app.js. Your permissions **WILL**
Break.
- Disable Command changed to allow Inhibitors, Monitors and Commands to be disabled
- Enable Command Changed to allow Inhibitors, Monitors and Commands to be disabled
- commandMonitors renamed to messageMonitors
- Help no longer placing un-catergorised commands in its own "catergory"

### Fixed
- Wrong Discord Invite link in README.md
- Accidently tried to pass an object to .get instead of a string
- User && Member usage types now correctly work when given IDs
- MessageMonitor function now actually called MessageMonitor instead of commandMonitor
- guildConfs not being in sync after file operation + Better error handling


## [0.11.0] - 2016-12-9
### Added
- Travis CI

### Changed
- All pieces will now initialize their .init() function if available.
- Permissions. guild.member is now guild.fetchMember (Allows invisible users). This is Evie's addition.
- Changed `if (msg.author.bot && msg.author.id !== client.user.id) return;` back to `if (msg.author.bot) return;`-
- Various Changes to commands (by Evie)-
- Usage URL Tag has been changed from Regex to Native Node `URL` Module.
- confs.js is back to Async (Critical Performance bug fixed)-
- Functions.js now able to reload new pieces.
- Reload.js removal of msgs.
- ESLint Errors downgraded to Warnings

### Fixed
- Pieces loading twice on standalone versions of Komada.
- Critical Bug in confs.js AGAIN. (Aka me derping forgetting its a Promise).
- A derp in my non Node 7 version of Evie's commit.
- Eval Now Properly Shows Errors (and Traces in Console).
- Fixed Unnecessary 'Redacted' values.
- Typos.
- Bitwise Ternary removal.
- Updated **README**.
- Various linting issues (still more to come).
- Fixed README errors.

### Removed
- ConfsRead event removed.
- Optional Pieces.
- **Herobrine**.

## [0.10.0] - 2016-11-21
### Added
- Reloading for Functions, Events, Inhibitors, Monitors from [UnseenFaith]
- Monitors from [UnseenFaith]
- ESLint Rules added from [CyberiumShadow] and [hkwu]
- Discord.JS Indev Support from [CyberiumShadow]
- Custom Permissions Roles from [UnseenFaith]

### Changed
- New Reload.js Command. from [UnseenFaith]
- Komada no longer listens to bots. from [CyberiumShadow]
- Better support for Arrays/Ints/Booleans/Strings in confs from [UnseenFaith]
- Changing commands to bot owner only. from [eslachance]
- Allowing multiword values to be used in confs from [CyberiumShadow]
- Padding from [vzwGrey]

### Fixed
- Fixes for Function/Command reload.js from [UnseenFaith]
- Fixes last eslint issues and codeblock undefined issue from [UnseenFaith]
- Monitors/Inhibitors Uncaught Exception fix from [UnseenFaith]
- The Great Conf Fix from [UnseenFaith]
- Fixed Promise Resolve/Rejects to prevent further code execution from [bdistin]
- Download.js VM "Cannot Find Module" Fix from [UnseenFaith]
- Various Confs fixes from [UnseenFaith]
- Usage Addition/ParseUsage fix from [UnseenFaith]

[Unreleased]: https://github.com/dirigeants/komada/compare/0.20.10...master
[0.10.0]: https://github.com/dirigeants/komada/compare/1627e6deb1d8c352d83e52ccd590f2330f5f8bb2...0.10.0
[0.11.0]: https://github.com/dirigeants/komada/compare/0.10.0...0.11.0
[0.12.0]: https://github.com/dirigeants/komada/compare/0.11.0...0.12.0
[0.12.4]: https://github.com/dirigeants/komada/compare/0.12.0...0.12.4
[0.18.0]: https://github.com/dirigeants/komada/compare/0.12.4...0.18
[0.18.1]: https://github.com/dirigeants/komada/compare/0.12.4...0.18.1
[0.19.3]: https://github.com/dirigeants/komada/compare/0.18.1...0.19.3
[0.20.10]: https://github.com/dirigeants/komada/compare/0.19.0...0.20.10
