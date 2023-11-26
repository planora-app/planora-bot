const fs = require('fs');
const moment = require('moment');
const { EmbedBuilder } = require('discord.js');
const logsConfig = JSON.parse(fs.readFileSync('./logsConfig.json'));

const isEnabled = logsConfig.find((log) => log.name === 'join/leave').enabled;
const logChannel = logsConfig.find((log) => log.name === 'join/leave').channel;

module.exports = async (client, member) => {
  if (!isEnabled || !logChannel) return;

  const channel = await client.channels.fetch(logChannel);
  const embed = new EmbedBuilder()
    .setAuthor({
      name: member.user.globalName || member.user.tag,
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle('A new member has joined')
    .setDescription(`**Member:** <@${member.user.id}> (${member.user.id})\n**Account created:** <t:${moment(member.user.createdAt).unix()}:R>`)
    .setColor(0x16a34a)
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
