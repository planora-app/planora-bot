const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ChannelSelectMenuBuilder } = require('@discordjs/builders');
const { verifiedRoleName } = require('../../../config.json');

module.exports = {
  name: 'verification',
  description: 'Set up verification in the server.',
  options: [
    {
      name: 'setup',
      description: 'Set up verification in the server.',
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  permissionsRequired: [PermissionFlagsBits.Administrator],
  callback: async (client, interaction) => {
    const selectVerificationChannelMenu = new ActionRowBuilder().addComponents(
      new ChannelSelectMenuBuilder().setCustomId('verification_channel').setPlaceholder(`The channel to set up verification in.`).setMaxValues(1).setMinValues(1).addChannelTypes(ChannelType.GuildText)
    );

    await interaction.reply({
      components: [selectVerificationChannelMenu],
    });

    const collector = await interaction.channel.createMessageComponentCollector();

    collector.on('collect', async (i) => {
      await i.deferUpdate();

      if (i.customId === 'verification_channel') {
        if (i.user.id !== interaction.user.id) {
          return await i.followUp({
            content: '⛔ Only the user who ran the command can select the channel.',
            ephemeral: true,
          });
        }

        const selectedChannelId = i.values[0];
        const selectedChannel = interaction.guild.channels.cache.get(selectedChannelId);

        const verificationEmbed = new EmbedBuilder().setTitle('Verification').setDescription('To get verified, click the button below.').setColor(0x16a34a).setTimestamp();
        const verifyButton = new ButtonBuilder().setCustomId('verify').setLabel('Verify').setStyle(ButtonStyle.Success);

        try {
          await selectedChannel.send({
            embeds: [verificationEmbed],
            components: [new ActionRowBuilder().setComponents(verifyButton)],
          });
        } catch (error) {
          return interaction.editReply({
            content: '⛔ Error while creating the verification menu.',
            components: [],
          });
        }

        interaction.editReply({
          content: '✅ Verification menu created successfully.',
          components: [],
        });
      }

      if (i.customId === 'verify') {
        const verifiedRole = interaction.guild.roles.cache.find((role) => role.name === verifiedRoleName);
        const member = i.member;
        member.roles.add(verifiedRole);

        await i.followUp({
          content: '✅ You have been verified successfully.',
          ephemeral: true,
        });
      }
    });
  },
};
