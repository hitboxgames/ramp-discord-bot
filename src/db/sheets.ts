import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { AppConfig } from "../config";
import { RampRole } from "../types/roles";

const HEADERS = ["discordId", "rampId", "rampRole", "email", "verifiedAt"];

const serviceAccountAuth = new JWT({
  email: AppConfig.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: AppConfig.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(
  AppConfig.GOOGLE_SHEETS_ID,
  serviceAccountAuth
);

async function initializeSheet() {
  try {
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows({ offset: 0, limit: 1 });

    if (!rows || rows.length === 0) {
      console.log("Setting up initial headers...");
      await sheet.setHeaderRow(HEADERS);
      console.log("Headers set successfully");
    }

    return sheet;
  } catch (error: any) {
    if (error.message.includes("No values in the header row")) {
      console.log("Setting up headers...");
      const sheet = doc.sheetsByIndex[0];
      await sheet.setHeaderRow(HEADERS);
      console.log("Headers set successfully");
      return sheet;
    }
    console.error("Error initializing sheet:", error);
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
    const sheet = await initializeSheet();

    const rows = await sheet.getRows();
    const existingUser = rows.find(
      (row) =>
        row.get("discordId") === discordId ||
        row.get("email").toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      console.log("User already verified:", { discordId, email });
      throw new Error("User already verified");
    }

    await sheet.addRow({
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

export async function getVerifiedUserByDiscordId(discordId: string) {
  try {
    const sheet = await initializeSheet();
    const rows = await sheet.getRows();

    const userRow = rows.find((row) => row.get("discordId") === discordId);

    if (!userRow) return null;

    return {
      discordId: userRow.get("discordId"),
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
