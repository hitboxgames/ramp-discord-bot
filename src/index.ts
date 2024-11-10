// index.ts
import { Client, Events, GatewayIntentBits } from "discord.js";
import { AppConfig } from "./config";
import {
  findOrCreateRampTransactionsChannel,
  findOrCreateRampBusinessAlertsChannel,
} from "./features/channels";
import { sendRecentTransactionsToChannel } from "./features/transactions";
import {
  execute,
  handleModalSubmit,
  handleButtonInteraction,
} from "./features/cardRequest";
import { setupRampRoles } from "./features/roles";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);

  const guild = await client.guilds.fetch(AppConfig.GUILD_ID);
  if (!guild) {
    console.error("Could not find guild with ID:", AppConfig.GUILD_ID);
    return;
  }

  await setupRampRoles(guild);

  await findOrCreateRampTransactionsChannel(client, AppConfig.GUILD_ID);
  await findOrCreateRampBusinessAlertsChannel(client, AppConfig.GUILD_ID);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      // Handle slash commands
      if (interaction.commandName === "requestcard") {
        await execute(interaction);
      }
    } else if (interaction.isModalSubmit()) {
      // Handle modal submissions
      await handleModalSubmit(interaction);
    } else if (interaction.isButton()) {
      // Handle button clicks
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error("Error handling interaction:", error);
  }
});

client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

client.login(AppConfig.DISCORD_TOKEN);
