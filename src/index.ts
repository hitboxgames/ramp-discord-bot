import {
  Client,
  Events,
  GatewayIntentBits,
  CommandInteraction,
  ModalSubmitInteraction,
  ButtonInteraction,
  Interaction,
} from "discord.js";
import { SecretConfig } from "./config";
import {
  findOrCreateRampTransactionsChannel,
  findOrCreateRampBusinessAlertsChannel,
} from "./services/channels";
import {
  handleModalSubmit,
  handleCardButtonInteraction,
  handleEditModalSubmit,
  executeCardRequest,
} from "./commands/cardRequest";
import { setupRampRoles } from "./services/roles";
import {
  executeVerify,
  handleCodeSubmit,
  handleEmailSubmit,
  handleVerificationButton,
} from "./commands/verify";
import { deployCommands } from "./deploy-commands";
import { executeInvite, handleInviteModal } from "./commands/invite";
import { executeReport } from "./commands/report";
import { startTransactionMonitoring } from "./alerts/transactions";
import { scanChannels } from "./db/sheets";
import { getSheetsConfig } from "./db/config";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const handleInteractionError = async (
  interaction: CommandInteraction | ModalSubmitInteraction | ButtonInteraction
) => {
  try {
    if (!interaction.isAutocomplete()) {
      await interaction.reply({
        content:
          "There was an error processing your request. Please try again.",
        ephemeral: true,
      });
    }
  } catch (e) {
    console.error("Error sending error message:", e);
  }
};

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  const guild = await client.guilds.fetch(SecretConfig.GUILD_ID);
  if (!guild) {
    console.error("Could not find guild with ID:", SecretConfig.GUILD_ID);
    return;
  }

  const config = await getSheetsConfig();

  if (config.NEW_CARD_REQUESTS) {
    await startTransactionMonitoring(client)
  } 

  await deployCommands();
  await setupRampRoles(guild);
  await scanChannels(client);
  await findOrCreateRampTransactionsChannel(client, SecretConfig.GUILD_ID);
  await findOrCreateRampBusinessAlertsChannel(client, SecretConfig.GUILD_ID);
});

client.on("interactionCreate", async (interaction: Interaction) => {
  try {
    if (interaction.isModalSubmit()) {
      switch (interaction.customId) {
        case "cardRequestModal":
          await handleModalSubmit(interaction);
          break;
        case "editCardModal":
          await handleEditModalSubmit(interaction);
          break;
        case "verifyEmailModal":
          await handleEmailSubmit(interaction);
          break;
        case "verifyCodeModal":
          await handleCodeSubmit(interaction);
          break;
        case "inviteModal":
          await handleInviteModal(interaction);
          break;
      }
    } else if (interaction.isButton()) {
      switch (interaction.customId) {
        case "enterVerificationCode":
          await handleVerificationButton(interaction);
          break;
        case "approve_card":
        case "deny_card":
        case "edit_card":
        case "cancel_edit":
        case "edit_and_approve":
          await handleCardButtonInteraction(interaction);
          break;
      }
    } else if (interaction.isChatInputCommand()) {
      switch (interaction.commandName) {
        case "requestcard":
          await executeCardRequest(interaction);
          break;
        case "verify":
          await executeVerify(interaction);
          break;
        case "invite":
          await executeInvite(interaction);
          break;
        case "report":
          await executeReport(interaction);
          break;
      }
    }
  } catch (error) {
    console.error("Error handling interaction:", error);

    if (
      interaction.isCommand() ||
      interaction.isModalSubmit() ||
      interaction.isButton()
    ) {
      await handleInteractionError(interaction);
    }
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

client.login(SecretConfig.DISCORD_TOKEN);
