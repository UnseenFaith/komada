# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- New Beta Configuration (Needs heavy testing)
- New Argument Prompting for Commands

### Changed
- Confs.js uses new configuration system now
- Configuration now split into smaller parts as requested.
- Help command is now a Direct Message.

### Fixed
- loadCommands no longer counts/loads "Ghost" commands.
- DMs throwing errors with new Config System && permLevel
- Fixed Reload not erroring on new commands that aren't found
- Fixed Bug on Selfbot mentions introduced with the new Argument Prompts
- Fixed Bug on Help not showing all commands with new Argument System
- Fixed another bug introduced with the new Argument System where Permissions weren't finalized before Prompts
- Fixed Bug within reload.js that prevented new commands from being loaded

### Removed
- Old Configuration System

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

[Unreleased]: https://github.com/eslachance/komada/compare/0.12.4...indev
[0.10.0]: https://github.com/eslachance/komada/compare/1627e6deb1d8c352d83e52ccd590f2330f5f8bb2...0.10.0
[0.11.0]: https://github.com/eslachance/komada/compare/0.10.0...0.11.0
[0.12.0]: https://github.com/eslachance/komada/compare/0.11.0...0.12.0
[0.12.4]: https://github.com/eslachance/komada/compare/0.12.0...0.12.4

[vzwGrey]: https://github.com/vzwGrey
[eslachance]: https://github.com/eslachance
[hkwu]: https://github.com/hkwu
[bdistin]: https://github.com/bdistin
[UnseenFaith]: https://github.com/UnseenFaith
[CyberiumShadow]: https://github.com/CyberiumShadow
