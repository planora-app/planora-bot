const fs = require('fs');
const moment = require('moment');
const { EmbedBuilder } = require('discord.js');
const logsConfig = JSON.parse(fs.readFileSync('./logsConfig.json'));

const isEnabled = logsConfig.find((log) => log.name === 'join/leave').enabled;
const logChannel = logsConfig.find((log) => log.name === 'join/leave').channel;

module.exports = async (client, member) => {
  if (!isEnabled || !logChannel) return;

  console.log(member);

  const channel = await client.channels.fetch(logChannel);
  const embed = new EmbedBuilder()
    .setAuthor({
      name: member.user.globalName || member.user.tag,
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    })
    .setTitle('A member has left')
    .setDescription(`**Member:** <@${member.user.id}> (${member.user.id})\n**Joined server:** <t:${moment(member.joinedTimestamp).unix()}:D>`)
    .setColor(0xdc2626)
    .setTimestamp();

  channel.send({ embeds: [embed] });
};
