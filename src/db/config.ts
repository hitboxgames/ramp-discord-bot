import { loadConfigFromSheet } from "./sheets";

export interface SheetsConfig {
  MONITOR_TRANSACTIONS: boolean;
  LARGE_TRANSACTION: number;
  NEW_CARD_REQUESTS: boolean;
  MONTHLY_SPEND_REPORT: boolean;
  TEXT_CHANNEL_ALERTS: string;
}

let SheetsConfig: SheetsConfig | null = null;

export async function getSheetsConfig(): Promise<SheetsConfig> {
  console.log(SheetsConfig);
  if (!SheetsConfig) {
    console.log("Loading configuration from sheet...");
    SheetsConfig = await loadConfigFromSheet();
  }
  return SheetsConfig;
}
