// src/deploy-commands.ts
import { REST, Routes } from "discord.js";
import { AppConfig } from "./config";
import { command as cardRequestCommand } from "./commands/cardRequest";
import { command as verifyCommand } from "./commands/verify";
import { command as inviteCommand } from "./commands/invite";

export async function deployCommands() {
  try {
    const commandsMap = new Map();

    [cardRequestCommand, verifyCommand, inviteCommand].forEach((cmd) => {
      commandsMap.set(cmd.name, cmd);
    });

    const commands = Array.from(commandsMap.values()).map((cmd) =>
      cmd.toJSON()
    );

    console.log(
      "Commands to be deployed:",
      commands.map((cmd) => cmd.name)
    );

    const rest = new REST().setToken(AppConfig.DISCORD_TOKEN);

    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(AppConfig.DISCORD_ID, AppConfig.GUILD_ID),
      { body: [] }
    );

    await rest.put(
      Routes.applicationGuildCommands(AppConfig.DISCORD_ID, AppConfig.GUILD_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error("Error deploying commands:", error);
    throw error;
  }
}
