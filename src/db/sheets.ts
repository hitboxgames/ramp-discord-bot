import {
  GoogleSpreadsheet,
  GoogleSpreadsheetWorksheet,
} from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { SecretConfig } from "../config";
import { ChannelType, Client } from "discord.js";

const verifiedHeaders = [
  "discordId",
  "rampId",
  "rampRole",
  "email",
  "verifiedAt",
];
const configHeaders = ["key", "value", "type", "description"];
const channelHeaders = ["channel_name", "channel_id"];

const serviceAccountAuth = new JWT({
  email: SecretConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: SecretConfig.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  SecretConfig.GOOGLE_SHEETS_ID,
  serviceAccountAuth
);

export async function initializeSheet() {
  try {
    await doc.loadInfo();

    const verifiedSheet = doc.sheetsByIndex[0];
    const configSheet = doc.sheetsByIndex[1];
    const channelSheet = doc.sheetsByIndex[2];

    console.log(verifiedSheet, configSheet, channelSheet);

    await setupHeaders(verifiedSheet, verifiedHeaders);
    await setupHeaders(configSheet, configHeaders);
    await setupHeaders(channelSheet, channelHeaders);

    return { verifiedSheet, configSheet, channelSheet };
  } catch (error) {
    console.error("Error initializing sheets:", error);
    throw error;
  }
}

async function setupHeaders(
  sheet: GoogleSpreadsheetWorksheet,
  headers: string[]
) {
  const configRows = await sheet.getRows({ offset: 0, limit: 1 });
  if (!configRows || configRows.length === 0) {
    console.log("Setting up config Headers...");
    await sheet.setHeaderRow(headers);
  }
}

export async function loadConfigFromSheet() {
  try {
    const { configSheet } = await initializeSheet();

    if (!configSheet) {
      throw new Error("Config sheet not found.");
    }

    const rows = await configSheet.getRows();
    const configData: Record<string, any> = {};

    rows.forEach((row) => {
      const key = row.get("Key");
      const value = row.get("Value");
      const type = row.get("Type");

      switch (type) {
        case "number":
          configData[key] = Number(value);
          break;
        case "boolean":
          configData[key] = value.toLowerCase() === "true";
          break;
        case "Multiselect":
          configData[key] = value.split(",").map((item: string) => item.trim());
          break;
        default:
          configData[key] = value;
      }
    });

    console.log(configData);

    return configData;
  } catch (error) {
    console.error("Error loading config from sheet:", error);
    throw error;
  }
}

export async function addVerifiedUser(
  discordId: string,
  email: string,
  rampId: string,
  role: string
): Promise<void> {
  try {
    const { verifiedSheet } = await initializeSheet();

    const rows = await verifiedSheet.getRows();
    const existingUser = rows.find(
      (row) =>
        row.get("discordId") === discordId ||
        row.get("email").toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      console.log("User already verified:", { discordId, email });
      throw new Error("User already verified");
    }

    await verifiedSheet.addRow({
      discordId: discordId,
      rampId: rampId,
      rampRole: role,
      email: email,
      verifiedAt: new Date().toISOString(),
    });

    console.log("User verified and added to sheet:", {
      discordId,
      email,
      rampId,
    });
  } catch (error) {
    console.error("Error adding verified user:", error);
    throw error;
  }
}

export async function scanChannels(client: Client) {
  try {
    const { channelSheet } = await initializeSheet();
    if (!channelSheet) {
      console.error(
        "Error: 'Channels' sheet not found in the Google Spreadsheet."
      );
      return;
    }

    const guild = client.guilds.cache.get(SecretConfig.GUILD_ID);
    if (!guild) {
      console.error("Error: Guild not found.");
      return;
    }

    const channels = guild.channels.cache;
    const channelData = channels
      .filter((channel) => channel.type !== ChannelType.GuildCategory)
      .map((channel) => [channel.name, channel.id]);

    await channelSheet.clear();
    await channelSheet.setHeaderRow(["Channel Name", "Channel ID"]);
    await channelSheet.addRows(channelData);

    console.log(
      `Scanned ${channelData.length} channels and updated the Google Sheet.`
    );
  } catch (error) {
    console.error("Error scanning channels:", error);
  }
}

export async function getVerifiedUserByDiscordId(discordId: string) {
  try {
    const { verifiedSheet } = await initializeSheet();
    const rows = await verifiedSheet.getRows();

    const userRow = rows.find((row) => row.get("discordId") === discordId);

    if (!userRow) return null;

    return {
      discordId: userRow.get("discordId"),
      rampId: userRow.get("rampId"),
      rampRole: userRow.get("rampRole"),
      email: userRow.get("email"),
      verifiedAt: userRow.get("verifiedAt"),
    };
  } catch (error) {
    console.error("Error getting verified user:", error);
    return null;
  }
}

export async function isUserVerified(discordId: string): Promise<boolean> {
  try {
    const user = await getVerifiedUserByDiscordId(discordId);
    return user !== null;
  } catch (error) {
    console.error("Error checking user verification:", error);
    return false;
  }
}
