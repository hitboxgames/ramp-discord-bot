import { config } from "dotenv";

config();

const {
  DISCORD_TOKEN,
  RAMP_CLIENT_ID,
  RAMP_CLIENT_SECRET,
  GUILD_ID,
  DISCORD_ID,
} = process.env;

if (
  !DISCORD_TOKEN ||
  !RAMP_CLIENT_ID ||
  !RAMP_CLIENT_SECRET ||
  !GUILD_ID ||
  !DISCORD_ID
) {
  throw new Error("Missing environment variables");
}

export const AppConfig = {
  DISCORD_TOKEN,
  DISCORD_ID,
  RAMP_CLIENT_ID,
  RAMP_CLIENT_SECRET,
  GUILD_ID,
};
