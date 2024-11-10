import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  TextChannel,
  ButtonInteraction,
  GuildMember
} from "discord.js";
import {
  isValidCardType,
  isValidDate,
  isValidFrequency,
} from "../utils/validate";
import { findOrCreateRampBusinessAlertsChannel } from "./channels";
import { hasEmployeeRole, hasManagerRole, ROLE_NAMES } from "./roles";

interface CardRequest {
  cardName: string;
  cardType: string;
  amount: string;
  frequency: string;
  autoLock: string;
}

export const command = new SlashCommandBuilder()
  .setName("requestcard")
  .setDescription("Request a new card")
  .setDefaultMemberPermissions("0");

  export async function execute(interaction: ChatInputCommandInteraction) {
    try {
      // Check if user has employee role
      if (!hasEmployeeRole(interaction.member as GuildMember)) {
        await interaction.reply({
          content: `You need the "${ROLE_NAMES.EMPLOYEE}" role to request cards.`,
          ephemeral: true
        });
        return;
      }
  
      const modal = new ModalBuilder()
        .setCustomId("cardRequestModal")
        .setTitle("Request a Card");

    const cardNameInput = new TextInputBuilder()
      .setCustomId("cardName")
      .setLabel("Card Name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Type a card name...")
      .setRequired(true)
      .setMaxLength(100);

    const cardTypeInput = new TextInputBuilder()
      .setCustomId("cardType")
      .setLabel("Card Type (Type: Virtual or Physical)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Virtual or Physical")
      .setRequired(true);

    const amountInput = new TextInputBuilder()
      .setCustomId("amount")
      .setLabel("Amount")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Type an amount")
      .setRequired(true);

    const frequencyInput = new TextInputBuilder()
      .setCustomId("frequency")
      .setLabel("Reset Frequency (Daily/Monthly/Yearly/Total)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Daily, Monthly, Yearly, or Total")
      .setRequired(true);

    const autoLockInput = new TextInputBuilder()
      .setCustomId("autoLock")
      .setLabel("Auto-lock Date (Optional - MM/DD/YYYY)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("MM/DD/YYYY")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(cardNameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(cardTypeInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(frequencyInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(autoLockInput)
    );

    await interaction.showModal(modal);
  } catch (error) {
    console.error("Error creating card request:", error);
    await interaction.reply({
      content: "There was an error processing your request. Please try again.",
      ephemeral: true,
    });
  }
}

export async function handleModalSubmit(interaction: ModalSubmitInteraction) {
  if (interaction.customId !== "cardRequestModal") return;

  try {
    const cardName = interaction.fields.getTextInputValue("cardName");
    const cardType = interaction.fields.getTextInputValue("cardType");
    const amount = interaction.fields.getTextInputValue("amount");
    const frequency = interaction.fields.getTextInputValue("frequency");
    const autoLock =
      interaction.fields.getTextInputValue("autoLock") || "Not specified";

    if (!isValidCardType(cardType)) {
      await interaction.reply({
        content: 'Invalid card type. Please use "Virtual" or "Physical".',
        ephemeral: true,
      });
      return;
    }

    if (!isValidFrequency(frequency)) {
      await interaction.reply({
        content:
          "Invalid frequency. Please use Daily, Monthly, Yearly, or Total.",
        ephemeral: true,
      });
      return;
    }

    if (autoLock !== "Not specified" && !isValidDate(autoLock)) {
      await interaction.reply({
        content: "Invalid date format. Please use MM/DD/YYYY.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.guildId) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    const alertsChannel = await findOrCreateRampBusinessAlertsChannel(
      interaction.client,
      interaction.guildId
    );

    if (!alertsChannel) {
      await interaction.reply({
        content: "Error: Could not find or create the business alerts channel.",
        ephemeral: true,
      });
      return;
    }

    const cardRequest = {
      cardName,
      cardType,
      amount,
      frequency,
      autoLock,
    };

    const requestMessage = formatCardRequest(
      interaction.user.username,
      cardRequest
    );
    const userMessage = formatCardRequest(
      interaction.user.username,
      cardRequest
    );

    await sendCardRequest(alertsChannel, requestMessage);

    await interaction.reply({
      content: `Your card request has been submitted:

${userMessage}

Your request is now pending manager approval.`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling card request:", error);
    await interaction.reply({
      content: "There was an error processing your request. Please try again.",
      ephemeral: true,
    });
  }
}

function formatCardRequest(requester: string, request: CardRequest): string {
  return `${requester} is requesting a new card

> **Card Name**: ${request.cardName}
> **Card Type**: ${request.cardType}
> **Amount Limit**: $${request.amount}
> **Reset Frequency**: ${request.frequency}
> **Auto-lock Date**: ${request.autoLock}

`;
}

async function sendCardRequest(channel: TextChannel, message: string) {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("approve_card")
      .setLabel("Approve Card")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("edit_card")
      .setLabel("Edit")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("deny_card")
      .setLabel("Decline Request")
      .setStyle(ButtonStyle.Danger)
  );

  await channel.send({
    content: message,
    components: [row],
  });
}

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  if (!["approve_card", "deny_card"].includes(interaction.customId)) return;

  // Check if user has manager role
  if (!hasManagerRole(interaction.member as GuildMember)) {
    await interaction.reply({
      content: `You need the "${ROLE_NAMES.MANAGER}" role to approve/deny requests.`,
      ephemeral: true
    });
    return;
  }

  try {
    const message = interaction.message;
    const action = interaction.customId === "approve_card" ? "Approved" : "Denied";
    const emoji = action === "Approved" ? "✅" : "❌";

    // Get requester from message content
    const requesterUsername = message.content.split('\n')[0].split(' ')[0];
    const requester = await interaction.guild?.members.cache.find(
      member => member.user.username === requesterUsername
    );

    // Update message in channel
    await message.edit({
      content: `${message.content}
**${action} by**: ${interaction.user.username}
**${action} at**: ${new Date().toLocaleString()}`,
      components: [],
    });

    // DM the requester about the decision
    if (requester) {
      try {
        await requester.send({
          content: `Your card request has been ${action.toLowerCase()} by ${interaction.user.username}.

Original request:
${message.content.split('\n').slice(0, 6).join('\n')}`
        });
      } catch (error) {
        console.error("Could not DM requester:", error);
      }
    }

    await interaction.reply({
      content: `You have ${action.toLowerCase()} this card request. The requester has been notified.`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling button interaction:", error);
    await interaction.reply({
      content: "There was an error processing your action.",
      ephemeral: true,
    });
  }
}