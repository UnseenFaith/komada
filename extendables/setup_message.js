const { Collection, Constants, MessageAttachment: Attachment, MessageEmbed: Embed, MessageReaction, MessageMentions: Mentions } = require("discord.js");

exports.conf = {
  type: "method",
  method: "setup",
  appliesTo: ["Message"],
};

// eslint-disable-next-line func-names
exports.extend = function (data) {
  this.id = data.id;
  this.type = Constants.MessageTypes[data.type];
  this.content = data.content;
  this.author = this.client.dataManager.newUser(data.author);
  this.member = this.guild ? this.guild.member(this.author) || null : null;
  this.pinned = data.pinned;
  this.tts = data.tts;
  this.nonce = data.nonce;
  this.system = data.type === 6;
  this.embeds = data.embeds.map(e => new Embed(this, e));
  this.attachments = new Collection();
  for (const attachment of data.attachments) this.attachments.set(attachment.id, new Attachment(this, attachment));
  this.createdTimestamp = new Date(data.timestamp).getTime();
  this.editedTimestamp = data.edited_timestamp ? new Date(data.edited_timestamp).getTime() : null;
  this.reactions = new Collection();
  if (data.reactions && data.reactions.length > 0) {
    for (const reaction of data.reactions) {
      const id = reaction.emoji.id ? `${reaction.emoji.name}:${reaction.emoji.id}` : reaction.emoji.name;
      this.reactions.set(id, new MessageReaction(this, reaction.emoji, reaction.count, reaction.me));
    }
  }
  this.mentions = new Mentions(this, data.mentions, data.mention_roles, data.mention_everyone);
  this.webhookID = data.webhook_id || null;
  this.hit = typeof data.hit === "boolean" ? data.hit : null;
  // eslint-disable-next-line no-underscore-dangle
  this._edits = [];
  if (this.prefix && this.command) {
    this.args = this.arguments();
    this.params = [];
    this.reprompted = false;
    // eslint-disable-next-line no-underscore-dangle
    this._currentUsage = {};
    // eslint-disable-next-line no-underscore-dangle
    this._repeat = false;
  }
};
