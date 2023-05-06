import Utils from "../utils/utils.js";
import Config from "../config.js";
import Discord from "discord.js";
const {
  ButtonBuilder,
  ActionRowBuilder,
  PermissionFlagsBits,
  InteractionType,
  ChannelType,
} = Discord;

const createTicketChannel = async (interaction, PermissionsArray) => {
  return await interaction.guild.channels.create({
    name: `заявка-${interaction.user.username}`,
    type: ChannelType.GuildText,
    parent: Config.TICKET.CATEGORY,
    permissionOverwrites: PermissionsArray,
  });
};

const checkUserPermissions = (interaction) => {
  return (
      Config.TICKET.STAFF_ROLES.some((x) =>
          interaction.member.roles.cache.has(x)
      ) || [interaction.guild.ownerId].includes(interaction.user.id)
  );
};

const roleMention = `<@&1103697717689077870>`;

const archiveTicket = async (interaction, Parent, Bot) => {
  await interaction.channel.setParent(Parent.id, { lockPermissions: false });
  await interaction.channel.setName(
      interaction.channel.name.replace("заявка", "архив")
  );

  // Update the user's permission to not view the channel
  let username = interaction.channel.name.replace("архив-", "");
  const members = await interaction.guild.members.fetch();
  const member = members.find((m) => m.user.username.toLowerCase() === username);

  if (member) {
    await interaction.channel.permissionOverwrites.edit(member.user.id, {
      VIEW_CHANNEL: false,
    });
  }

  await interaction.message.edit({
    embeds: [
      Utils.embed(
          interaction.message.embeds.map((x) => x.description).join(""),
          interaction.guild,
          Bot,
          ""
      ),
    ],
    components: [],
  });

  await interaction.followUp({
    content: `Заявка была архивирована.`,
    ephemeral: true,
  });
};


export default (Bot) => {
  Bot.on("interactionCreate", async (interaction) => {
    if (interaction.type === InteractionType.ModalSubmit) {
      if (interaction.customId === "ticket") {
        const Questions = Config.TICKET.QUESTIONS.map((x) => x.LABEL);
        const fields = Array.from(interaction.fields.fields.values());
        const Value = fields.map((x) => x.value);
        const Output = Value.map((x, i) => ({
          Questions: Questions[i],
          Value: x,
        }));
        const Content = Output.map(
            (x, index) => `\n ${index + 1}: ${x.Questions} \n**${x.Value}**`
        ).join("\n");

        const Channel = interaction.guild.channels.cache.find(
            (x) => x.name === `заявка-${interaction.user.username}`
        );

        await interaction.deferReply({ ephemeral: true });

        if (Channel) {
          interaction.followUp({
            content: `У вас уже есть созданная заявка.`,
            ephemeral: true,
          });
        } else {
          let PermissionsArray = [
            {
              id: interaction.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.SendMessages,
              ],
            },
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
          ];

          Config.TICKET.STAFF_ROLES.forEach((x) => {
            PermissionsArray.push({
              id: x,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.SendMessages,
              ],
            });
          });

          const TicketChannel = await createTicketChannel(
              interaction,
              PermissionsArray
          );

          interaction.followUp({
            content: "Заявка успешно создана.",
            ephemeral: true,
          });

          TicketChannel.send({
            embeds: [
              Utils.embed(
                  `Заявка от: \n${interaction.user} (\`${interaction.user.id}\`) \n${Content}`,
                  interaction.guild,
                  Bot,
                  interaction.user
              ),
            ],
            content: `${roleMention}`,
            components: [Utils.ticketButton()],
          });
        }
      }
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === "ticket") {
      await interaction.showModal(Utils.modal());
    }

    if (interaction.customId === "successTicket") {
      if (!checkUserPermissions(interaction)) {
        await interaction.deferReply({ ephemeral: true });

        interaction.followUp({
          content: `У тебя нет прав делать это.`,
          ephemeral: true,
        });

        return;
      } else {
        await interaction.update({
          components: [
            new ActionRowBuilder({
              components: [
                ButtonBuilder.from(
                    interaction.message.components[0].components[0]
                ).setDisabled(true),
                ButtonBuilder.from(
                    interaction.message.components[0].components[1]
                ),
              ],
            }),
          ],
        });

        let role = interaction.guild.roles.cache.get("1104016659930415165");
        let username = interaction.channel.name.replace("заявка-", "");
        const members = await interaction.guild.members.fetch();
        const member = members.find(
            (m) => m.user.username.toLowerCase() === username
        );
        if (member) {
          try {
            await member.roles.add(role); // Change this line to use member.roles.add instead of member.roles.cache.add
            console.log(`Role added to user ${username}`);
            interaction.channel.send({
              content: `Салам, <@${member.user.id}>, ты был принят в фаму. \nЗаявка будет архивирована в течении 12 часов`,
            });
          } catch (error) {
            console.error(`Failed to add role to user ${username}:`, error);
          }
        } else {
          console.log(`User with username "${username}" not found.`);
        }

        setTimeout(() => {
          try {
            archiveTicket(interaction, Parent, Bot);
          } catch (e) {
            console.error(e);
          }
        }, 43200 * 60);

        return;
      }
    }

    if (interaction.customId === "archiveTicket") {
      await interaction.deferReply({ ephemeral: true });

      if (!checkUserPermissions(interaction)) {
        return interaction.followUp({
          content: `У тебя нет прав делать это.`,
          ephemeral: true,
        });
      }

      if (interaction.channel.parentId === Config.TICKET.ARCHIVE_CATEGORY)
        return interaction.followUp({
          content: `Уже архивирован.`,
          ephemeral: true,
        });

      const Parent = interaction.guild.channels.cache.get(
          Config.TICKET.ARCHIVE_CATEGORY
      );

      await archiveTicket(interaction, Parent, Bot);
    }

    if (interaction.customId === "deleteTicket") {
      await interaction.deferReply({ ephemeral: true });

      const User = interaction.channel.name.replace("заявка-", "");

      if ([User].includes(interaction.user.id)) {
        if (
            interaction.message.components[0].components[0].data.disabled === true
        )
          return interaction.followUp({
            content: `Заявка была принята, ее нельзя удалить.`,
            ephemeral: true,
          });
      } else {
        if (!checkUserPermissions(interaction)) return;
      }

      interaction.followUp({
        content: `Ваш запрос был принят и этот канал будет автоматически удален в течении \`5 seconds\`.`,
        ephemeral: true,
      });

      let username = interaction.channel.name.replace("заявка-", "");
      const members = await interaction.guild.members.fetch();
      const member = members.find(
          (m) => m.user.username.toLowerCase() === username
      );
      if (member) {
        try {
          interaction.channel.send({
            content: `<@${member.user.id}>, твоя заявка была отклонена.`,
          });
        } catch (error) {
          console.error(`Failed to find user ${username}:`, error);
        }
      } else {
        console.log(`User with username "${username}" not found.`);
      }

      interaction.channel.send({
        content: `Заявка будет архивирована в течении 12 часов`,
      });

      setTimeout(() => {
        try {
          archiveTicket(interaction, Parent, Bot);
        } catch (e) {
          console.error(e);
        }
      }, 1000 * 5);
    }
  });
};