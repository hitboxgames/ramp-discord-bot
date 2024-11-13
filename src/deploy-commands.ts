import { REST, Routes } from "discord.js";
import { SecretConfig } from "./config";
import { command as cardRequestCommand } from "./commands/cardRequest";
import { command as verifyCommand } from "./commands/verify";
import { command as inviteCommand } from "./commands/invite";
import { command as reportCommand } from "./commands/report";

export async function deployCommands() {
  try {
    const commandsMap = new Map();

    [cardRequestCommand, verifyCommand, inviteCommand, reportCommand].forEach(
      (cmd) => {
        commandsMap.set(cmd.name, cmd);
      }
    );

    const commands = Array.from(commandsMap.values()).map((cmd) =>
      cmd.toJSON()
    );

    console.log(
      "Commands to be deployed:",
      commands.map((cmd) => cmd.name)
    );

    const rest = new REST().setToken(SecretConfig.DISCORD_TOKEN);

    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(SecretConfig.DISCORD_ID, SecretConfig.GUILD_ID),
      { body: [] }
    );

    await rest.put(
      Routes.applicationGuildCommands(SecretConfig.DISCORD_ID, SecretConfig.GUILD_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error deploying commands:", error);
    throw error;
  }
}
