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
  GuildMember,
} from "discord.js";
import {
  isValidCardType,
  isValidDate,
  isValidFrequency,
} from "../utils/validate";
import { findOrCreateRampBusinessAlertsChannel } from "../services/channels";
import { hasEmployeeRole, hasManagerRole, ROLE_NAMES } from "../services/roles";
import { createPhysicalCard, createVirtualCard } from "../ramp/routes";
import { getVerifiedUserByDiscordId } from "../db/sheets";

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

export async function executeCardRequest(
  interaction: ChatInputCommandInteraction
) {
  try {
    if (
      !hasEmployeeRole(interaction.member as GuildMember) &&
      !hasManagerRole(interaction.member as GuildMember)
    ) {
      await interaction.reply({
        content: `You need the "${ROLE_NAMES.EMPLOYEE}" or "${ROLE_NAMES.MANAGER}" role to request cards.`,
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId("cardRequestModal")
      .setTitle("Request a Card");

    const cardNameInput = new TextInputBuilder()
      .setCustomId("cardName")
      .setLabel("Name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Type a card name...")
      .setMaxLength(100);

    const cardTypeInput = new TextInputBuilder()
      .setCustomId("cardType")
      .setLabel("Card Type (Only Virtual supported currently)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Virtual")
      .setRequired(true);

    const amountInput = new TextInputBuilder()
      .setCustomId("amount")
      .setLabel("Amount")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Type an amount")
      .setRequired(true);

    const frequencyInput = new TextInputBuilder()
      .setCustomId("frequency")
      .setLabel("Frequency (Daily/Monthly/Yearly/Total)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Daily, Monthly, Yearly, or Total")
      .setRequired(true);

    const autoLockInput = new TextInputBuilder()
      .setCustomId("autoLock")
      .setLabel("Until When?")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("MM/DD/YYYY");

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

    try {
      await interaction.user.send({
        content: `🎉 You requested the following card:
  
> **Card Name**: ${cardName}
> **Card Type**: ${cardType}
> **Spend Limit**: $${amount} ${frequency}
> **Auto Lock**: ${autoLock}`,
      });
    } catch (error) {
      console.error("Could not send DM to user:", error);
    }

    const requestMessage = formatCardRequest(
      interaction.user.username,
      cardRequest
    );

    await sendCardRequest(alertsChannel, requestMessage);

    await interaction.deferUpdate();
  } catch (error) {
    console.error("Error handling card request:", error);
    await interaction.reply({
      content: "There was an error processing your request. Please try again.",
      ephemeral: true,
    });
  }
}

function formatCardRequest(requester: string, request: CardRequest): string {
  return `${requester} is requesting a new card.

> **Card Name**: ${request.cardName}
> **Card Type**: ${request.cardType}
> **Spend Limit**: $${request.amount}
> **Reset Frequency**: ${request.frequency}
> **Auto Lock**: ${request.autoLock}

`;
}

export async function sendCardRequest(channel: TextChannel, message: string) {
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

export async function handleCardButtonInteraction(
  interaction: ButtonInteraction
) {
  if (
    ![
      "approve_card",
      "deny_card",
      "edit_card",
      "cancel_edit",
      "edit_and_approve",
    ].includes(interaction.customId)
  )
    return;

  if (!hasManagerRole(interaction.member as GuildMember)) {
    await interaction.reply({
      content: `You need the "${ROLE_NAMES.MANAGER}" role to manage requests.`,
      ephemeral: true,
    });
    return;
  }

  const message = interaction.message;

  if (interaction.customId === "edit_card") {
    const content = message.content;
    const lines = content.split("\n");
    const cardName =
      lines
        .find((l) => l.includes("Card Name"))
        ?.split(":")[1]
        ?.trim() || "";
    const cardType =
      lines
        .find((l) => l.includes("Card Type"))
        ?.split(":")[1]
        ?.trim() || "";
    const amount =
      lines
        .find((l) => l.includes("Amount Limit"))
        ?.split("$")[1]
        ?.split(" ")[0] || "";
    const frequency =
      lines
        .find((l) => l.includes("Reset Frequency"))
        ?.split(":")[1]
        ?.trim() || "";
    const autoLock =
      lines
        .find((l) => l.includes("Auto-lock Date"))
        ?.split(":")[1]
        ?.trim() || "";

    const modal = new ModalBuilder()
      .setCustomId("editCardModal")
      .setTitle("Edit Card Request");

    const cardNameInput = new TextInputBuilder()
      .setCustomId("cardName")
      .setLabel("Name")
      .setStyle(TextInputStyle.Short)
      .setValue(cardName);

    const cardTypeInput = new TextInputBuilder()
      .setCustomId("cardType")
      .setLabel("Card Type (Virtual or Physical)")
      .setStyle(TextInputStyle.Short)
      .setValue(cardType)
      .setRequired(true);

    const amountInput = new TextInputBuilder()
      .setCustomId("amount")
      .setLabel("Amount")
      .setStyle(TextInputStyle.Short)
      .setValue(amount)
      .setRequired(true);

    const frequencyInput = new TextInputBuilder()
      .setCustomId("frequency")
      .setLabel("Frequency (Daily/Monthly/Yearly/Total)")
      .setStyle(TextInputStyle.Short)
      .setValue(frequency)
      .setRequired(true);

    const autoLockInput = new TextInputBuilder()
      .setCustomId("autoLock")
      .setLabel("Until When? (MM/DD/YYYY)")
      .setStyle(TextInputStyle.Short)
      .setValue(autoLock);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(cardNameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(cardTypeInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(frequencyInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(autoLockInput)
    );

    await interaction.showModal(modal);
    return;
  }

  if (interaction.customId === "cancel_edit") {
    await message.edit({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
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
        ),
      ],
    });

    await interaction.reply({
      content: "Edit cancelled.",
      ephemeral: true,
    });
    return;
  }

  const action =
    interaction.customId === "approve_card"
      ? "approved"
      : interaction.customId === "deny_card"
      ? "declined"
      : interaction.customId === "edit_and_approve"
      ? "approved with edits"
      : "";

  const requesterUsername = message.content.split("\n")[0].split(" ")[0];
  const requester = await interaction.guild?.members.cache.find(
    (member) => member.user.username === requesterUsername
  );

  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();

  const lines = message.content.split("\n");
  const cardName =
    lines
      .find((l) => l.includes("Card Name"))
      ?.split(":")[1]
      ?.trim() || "";
  const cardType =
    lines
      .find((l) => l.includes("Card Type"))
      ?.split(":")[1]
      ?.trim() || "";
  const amount = parseFloat(
    lines
      .find((l) => l.includes("Spend Limit") || l.includes("Amount Limit"))
      ?.split("$")[1]
      ?.trim() || "0"
  );
  const frequency =
    lines
      .find((l) => l.includes("Reset Frequency"))
      ?.split(":")[1]
      ?.trim() || "";
  const autoLock =
    lines
      .find((l) => l.includes("Auto Lock") || l.includes("Auto-lock"))
      ?.split(":")[1]
      ?.trim() || "";

  let formattedAutoLock: string | undefined;
  if (autoLock && autoLock !== "Not specified") {
    const [month, day, year] = autoLock.split("/");
    formattedAutoLock = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    ).toISOString();
  }

  const cardDetailsPreview = `> **Card Name**: ${cardName}
> **Card Type**: ${cardType}
> **Amount Limit**: ${amount}
> **Reset Frequency**: ${frequency}
> **Auto Lock**: ${autoLock}`;

  const approvalMessage = `${requesterUsername}'s card was ${action}.

${cardDetailsPreview}

**${requesterUsername}'s card request was ${action} by ${interaction.user.username} on ${date} at ${time}.**`;

  await message.edit({
    content: approvalMessage,
    components: [],
  });

  if (requester) {
    try {
      await requester.send({
        content: `🎉 **Your card request has been ${action} by ${interaction.user.username} on ${date} at ${time}**.

${cardDetailsPreview}`,
      });
    } catch (error) {
      console.error("Could not DM requester:", error);
    }
  }

  const requesterId = requester?.id;

  if (!requesterId) {
    throw new Error("No requester Id, what type of thievery is this");
  }
  const response = await getVerifiedUserByDiscordId(requesterId);

  if (requesterId) {
    try {
      if (cardType.toLowerCase() === "virtual") {
        const cardId = await createVirtualCard(
          response?.rampId,
          formattedAutoLock,
          cardName,
          amount.toString(),
          frequency.toUpperCase()
        );
        const cardDetailsUrl = `https://demo.ramp.com/cards/virtual-cards`;

        const viewCardButton = new ButtonBuilder()
          .setLabel("View Card Details")
          .setStyle(ButtonStyle.Link)
          .setURL(cardDetailsUrl);

        const viewCardRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          viewCardButton
        );

        await interaction.reply({
          content: `You have ${action} this card request. The requester has been notified.`,
          components: [viewCardRow],
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: `You have ${action} this card request, but only virtual cards are currently supported.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error("Error creating card:", error);
      await interaction.reply({
        content: `You have ${action} this card request, but there was an error creating the card. Please check the logs.`,
        ephemeral: true,
      });
    }
  }
}

export async function handleEditModalSubmit(
  interaction: ModalSubmitInteraction
) {
  if (interaction.customId !== "editCardModal") return;

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

    const message = interaction.message;
    if (!message) return;

    const requesterUsername = message.content.split("\n")[0].split(" ")[0];

    const editedRequest = {
      cardName,
      cardType,
      amount,
      frequency,
      autoLock,
    };

    const newContent = formatCardRequest(requesterUsername, editedRequest);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("edit_and_approve")
        .setLabel("Edit and Approve")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_edit")
        .setLabel("Cancel")
        .setStyle(ButtonStyle.Secondary)
    );

    await message.edit({
      content: newContent,
      components: [row],
    });

    await interaction.reply({
      content:
        "Card request updated. You can now approve the edited request or cancel.",
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error handling edit modal submit:", error);
    await interaction.reply({
      content: "There was an error processing your edit. Please try again.",
      ephemeral: true,
    });
  }
}
