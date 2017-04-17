# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [0.20.0] - unreleased/classbased
### Added
- Command Editing is now possible via setting config.cmdEditing to true. You will need to make a few changes to your code to make it work though:
- A new messageUpdate core event.
- New methods attached to the Discord.js message object to enable command editing: message.send, message.sendMessage, message.sendCode, message.sendEmbed. These methods will cache the command message and the response message, and edit the response message if the command message is found in the cache.
- With the new command cache, you also have access to commandMessage sweeping. These are 2 new komada configs as integers in seconds: config.commandMessageLifetime, config.commandMessageSweep
- Added a timer to the loading.
- Finalizers: Functions which are run on after a successful command. *Please Note: All command files must be defined as async. `exports.run = __async__ (client, msg, ...`*
- Command Cooldowns are now available through a new inhibitor/finalizer combo. Simply set command.conf.cooldown to an integer in seconds to put a cooldown on that command.

### Changed
- Backend is now class based. Users main files will need to be updated. The interface is the same as creating a discord.js client, only using komada, and with komada config. No more use of start, but client.login(token) is needed now.
- Usage will no longer be calculated everytime a command is run, but instead stored in command.usage.
- Usage has been refactored into a ParsedUsage class, and an argResolver class. (internal)
- The command loading and reload has been completely refactored for speed. You should be able to load everything in approximatly 10% of the time it used to take.
- Refactored: Disconnect, Error, Warn, Message; into core events rather than in the app.js file.
- Changed core log func, into an event. You can now log anything by running client.emit('log', data, type);
- runMessageMonitors has been moved into the new Message core event.
- dotenv dependancy has been changed to a peerdep.
- fs-extra-promise has been updated to the latest version.
- Minimum node version is now v7.6.x
- Remaining Utils have been moved to the classes folder.

### Fixed
- 

### Removed
- generateInvite.js core function in favor of the Discord.JS generateInvite.
- botpermissions.js core function which was only used by the generateInvite core function.
- fullUsage.js core function which is now available in command.usage.fullUsage(msg).
- addCommmas.js core function. Should use .toLocaleString() instead.
- getFileListing.js core function in favor of the new loading refactor.
- loadSingleCommand.js core function in favor of the new loading refactor.
- reload.js core function in favor of the new loading refactor.
- parseUsage.js core function in favor of the new parsedUsage class refactor.
- log.js core function in favor of the new log event.
- exports.getCommand in handleCommand.js in favor of more efficient code.
- Localizations, and all references to them (per Faith)
- fs-extra dependancy. All use of fs, is done through fs-extra-promise now.
- Due to the class rewrite, the module can no-longer be used stand alone. So the start script has been removed from the package.json. You can however add your own start file (as you would if you were using the package as a dependancy) as a work around for using the repo as a stand alone if you really need to.
- loading utils have been removed in favor of the new loading refactor.

## [0.19.0] - unreleased/indev
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
- "`client.funcs.log` is not a function" when something was wrong at startup (events not working or faulty configurations).
- Fixed HandleCommand not passing Arguments to awaitMessage properly.
- Fixed AwaitMessage - Kyra
- Fixed Float Usage not correctly determining if NaN (finally)
- Fixed Usage for the 603rd time. Maybe? Probably not.
- TypeError in awaitMessage.js function, issue #158
- (Hot fix) Fixed help command (was returning BadRequest) on 0.18.5
- (Hot fix) Fixed permissions on DMs (running msg.member.permLevel when the user DMs a command that doesn't have permissions for).
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
- loading Functions are removed from Functions folder and moved to a Utils folder. (This folder will be there for future features as well.)

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
- All Bad Requests/Forbiddens.. etc, now properly give a human readable error in console or chat, depending on the error. (Not as of (0.17.0).. must be fixed) ***
- New Error Creator
- New CommandHandler (Removed it from message event)
- New Core Command "Transfer"
- New extended help feature added.
- New Beta Configuration (Needs heavy testing)
- New Argument Prompting for Commands
- ~~New Initialize Function to alleviate undefined errors~~ Reverted in #139
- New Download Command

### Changed
- ~~All pieces now initialize upon being loaded, in order.~~ ~~Reverted in 0.17.3~~ Reimplemented in 0.17.4 within `client.on("ready")`
- Changed Emojis to unicode variants in Reload.js
- Broke down App.js Message Event into several smaller, changeable parts.
- newError changed to send arguments to awaitMessage when errors are from usage
- awaitMessage changed to work perfectly with the new system
- msg.author.permLevel is now available immediately on a message, instead of after inhibitors run correctly.
- Usage Inhibitor is now a function instead, which will help issues with racing and prompts.
- All Inhibitors now return values instead of using promises to resolve or reject. (Change will be reflected on Documentation soon)
- Reverted Log function for the time being.
- Many Files to use the new Error creator
- guildOnly Inhibitor is now a `runIn` Inhibitor.
- Inhibitors now use .some() to determine if more inhibitors should be ran.
- Stats command now uses `<Collection>.reduce` to correctly determine User Count when fetchAllMembers is false
- Changed info to no longer mention Evie because she said she was tired of it.. kek
- New runCommandInhibitors should be much faster and prioritizes inhibitors via a prioritiy configuration setting.
- Old Configuration system now points to the new configuration system, to ease the trouble of updating to newer versions of Komada
- Pieces now have  specific order they load in. (Functions, Providers, Commands, Inhibitors, Monitors, Events)
- Confs.js uses new configuration system now
- Configuration now split into smaller parts as requested.
- Help command is now a Direct Message.
- Async/Await for all pieces && app.js
- dataProviders renamed to Providers

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
- Fixed another bug introduced with the new Argument System where Permissions weren't finalized before Prompts
- Fixed Bug within reload.js that prevented new commands from being loaded
- More Selfbot Bugs Fixed
- More Reload function fixes for commands

### Removed
- Old initialize system (Was borked)
- Old Configuration System
- Selfbot Inhibitor

## [0.18.0] - 2017-03-16
### Added
- Added a bunch of unusable configuration options that'll make their debut soon.
- All Bad Requests/Forbiddens.. etc, now properly give a human readable error in console or chat, depending on the error. (Not as of (0.17.0).. must be fixed) ***
- New Error Creator
- New CommandHandler (Removed it from message event)
- New Core Command "Transfer"
- New extended help feature added.
- New Beta Configuration (Needs heavy testing)
- New Argument Prompting for Commands
- ~~New Initialize Function to alleviate undefined errors~~ Reverted in #139
- New Download Command

### Changed
- ~~All pieces now initialize upon being loaded, in order.~~ ~~Reverted in 0.17.3~~ Reimplemented in 0.17.4 within `client.on("ready")`
- Changed Emojis to unicode variants in Reload.js
- Broke down App.js Message Event into several smaller, changeable parts.
- newError changed to send arguments to awaitMessage when errors are from usage
- awaitMessage changed to work perfectly with the new system
- msg.author.permLevel is now available immediately on a message, instead of after inhibitors run correctly.
- Usage Inhibitor is now a function instead, which will help issues with racing and prompts.
- All Inhibitors now return values instead of using promises to resolve or reject. (Change will be reflected on Documentation soon)
- Reverted Log function for the time being.
- Many Files to use the new Error creator
- guildOnly Inhibitor is now a `runIn` Inhibitor.
- Inhibitors now use .some() to determine if more inhibitors should be ran.
- Stats command now uses `<Collection>.reduce` to correctly determine User Count when fetchAllMembers is false
- Changed info to no longer mention Evie because she said she was tired of it.. kek
- New runCommandInhibitors should be much faster and prioritizes inhibitors via a prioritiy configuration setting.
- Old Configuration system now points to the new configuration system, to ease the trouble of updating to newer versions of Komada
- Pieces now have  specific order they load in. (Functions, Providers, Commands, Inhibitors, Monitors, Events)
- Confs.js uses new configuration system now
- Configuration now split into smaller parts as requested.
- Help command is now a Direct Message.
- Async/Await for all pieces && app.js
- dataProviders renamed to Providers

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
- Fixed another bug introduced with the new Argument System where Permissions weren't finalized before Prompts
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
- confs.addKey(key, defaultValue, min value, max value) and .setKey() and .set() changed to account for integers. This is backwards compatible with older versions.

### Fixed
- Dependecy Issue with Upstream Dependency changing repo structure.
- Commands can now be used in DM with proper permission levels
- Tons of Confs fixes and changes to be more consistent.

### Removed
- Removed `client.methods.Shard` aka `ShardingManager` due to how Sharding works (ie. Needs an additional file to spawn the ShardingManager)

## [0.12.0] - 2016-12-15
### Added
- client.methods.MethodName

### Changed
- ownerid is now following camelCase (ownerID). If this not changed in your client app.js. Your permissions **WILL** Break.
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
- Changed `if (msg.author.bot && msg.author.id !== client.user.id) return;` back to `if (msg.author.bot) return;`
- Various Changes to commands (by Evie)
- Usage URL Tag has been changed from Regex to Native Node `URL` Module.
- confs.js is back to Async (Critical Performance bug fixed)
- Functions.js now able to reload new pieces.
- Reload.js removal of msgs.
- ESLint Errors downgraded to Warnings

### Fixed
- Pieces loading twice on standalone versions of Komada
- Critical Bug in confs.js AGAIN. (Aka me derping forgetting its a promise)
- A derp in my non Node 7 version of Evie's commit.
- Eval Now Properly Shows Errors (and Traces in Console)
- Fixed Unnecessary 'Redacted' values
- Typos
- Bitwise Ternary removal
- Updated README
- Various linting issues (still more to come)
- Fixed README errors.

### Removed
- ConfsRead event removed.
- Optional Pieces
- Herobrine

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

[Unreleased]: https://github.com/dirigeants/komada/compare/0.18.1...bdistin:classbased
[0.10.0]: https://github.com/dirigeants/komada/compare/1627e6deb1d8c352d83e52ccd590f2330f5f8bb2...0.10.0
[0.11.0]: https://github.com/dirigeants/komada/compare/0.10.0...0.11.0
[0.12.0]: https://github.com/dirigeants/komada/compare/0.11.0...0.12.0
[0.12.4]: https://github.com/dirigeants/komada/compare/0.12.0...0.12.4
[0.18.0]: https://github.com/dirigeants/komada/compare/0.12.4...0.18
[0.18.1]: https://github.com/dirigeants/komada/compare/0.12.4...0.18.1
[0.19.0]: https://github.com/dirigeants/komada/compare/0.18.1...indev
[0.20.0]: https://github.com/dirigeants/komada/compare/indev...bdistin:classbased

[vzwGrey]: https://github.com/vzwGrey
[eslachance]: https://github.com/eslachance
[hkwu]: https://github.com/hkwu
[bdistin]: https://github.com/bdistin
[UnseenFaith]: https://github.com/UnseenFaith
[CyberiumShadow]: https://github.com/CyberiumShadow
