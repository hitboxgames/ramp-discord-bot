import { loadConfigFromSheet } from "./sheets";

export interface SheetsConfig {
  POLL_INTERVAL: number;
  BUSINESS_LIMIT: number;
  LARGE_TRANSACTION: number;
  NEW_CARD_REQUESTS: boolean;
  MONTHLY_SPEND_REPORT: boolean;
  STATEMENTS: boolean;
  SAVINGS_INSIGHT: boolean;
  WEEKLY_MISSING_ITEMS: boolean;
  TEXT_CHANNEL_ALERTS: string;
}

let SheetsConfig: SheetsConfig | null = null;

export async function getSheetsConfig(): Promise<SheetsConfig> {
  console.log(SheetsConfig)
  if (!SheetsConfig) {
    console.log("Loading configuration from sheet...");
    const configData = await loadConfigFromSheet();
    SheetsConfig = configData as SheetsConfig;
  }
  return SheetsConfig;
}
