const { ChannelType, ActionRowBuilder, ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const { ChannelSelectMenuBuilder } = require('@discordjs/builders');
const capitalizeFirstLetter = require('../../helpers/capitalizeFirstLetter');
const updateLogsConfig = require('../../utils/updateLogsConfig');
const logsConfig = require('../../../logsConfig.json');

module.exports = {
  name: 'logs',
  description: 'Set up logs in the server.',
  options: [
    {
      name: 'setup',
      description: 'Set up logs in the server.',
      options: [
        {
          name: 'logs',
          description: 'Logs which you want to set up.',
          choices: [
            {
              name: 'Join/leave logs',
              value: 'join/leave',
            },
            {
              name: 'Message logs',
              value: 'message',
            },
            {
              name: 'Moderation logs',
              value: 'moderation',
            },
            {
              name: 'Website logs',
              value: 'website',
            },
          ],
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: 'disable',
      description: 'Disable logs in the server.',
      options: [
        {
          name: 'logs',
          description: 'Logs which you want to disable.',
          choices: [
            {
              name: 'Join/leave logs',
              value: 'join/leave',
            },
            {
              name: 'Message logs',
              value: 'message',
            },
            {
              name: 'Moderation logs',
              value: 'moderation',
            },
            {
              name: 'Website logs',
              value: 'website',
            },
          ],
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  async callback(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      const selectedLogs = interaction.options.getString('logs');

      const isAlreadyEnabled = logsConfig.find((log) => log.name === selectedLogs).enabled;

      if (isAlreadyEnabled) {
        return await interaction.reply({
          content: `⛔ ${capitalizeFirstLetter(selectedLogs)} logs are already set up.`,
          components: [],
        });
      }

      const selectMenu = new ActionRowBuilder().addComponents(
        new ChannelSelectMenuBuilder().setCustomId('logs_channel').setPlaceholder(`The channel to set up ${selectedLogs} logs in.`).setMaxValues(1).setMinValues(1).addChannelTypes(ChannelType.GuildText)
      );

      await interaction.reply({
        components: [selectMenu],
      });

      const collector = await interaction.channel.createMessageComponentCollector();

      collector.on('collect', async (i) => {
        await i.deferUpdate();

        if (i.user.id !== interaction.user.id) {
          return await i.followUp({
            content: '⛔ Only the user who ran the command can select the channel.',
            ephemeral: true,
          });
        }

        const channelId = i.values[0];

        await updateLogsConfig(logsConfig, selectedLogs, true, channelId);

        await interaction.editReply({
          content: `✅ ${capitalizeFirstLetter(selectedLogs)} logs successfully set up in <#${channelId}>.`,
          components: [],
        });
      });
    }

    if (subcommand === 'disable') {
      const selectedLogs = interaction.options.getString('logs');

      await updateLogsConfig(logsConfig, selectedLogs, false, '');

      await interaction.reply({
        content: `✅ ${capitalizeFirstLetter(selectedLogs)} logs successfully disabled.`,
        components: [],
      });
    }
  },
};
