import { Client } from "discord.js";
import { fetchTransactionsByDateRange } from "../ramp/routes";
import { sendTransactionMessages } from "../services/messages";
import { getLastFiveMinutesRange } from "../utils/dates";

let lastFetchedTransactionIds = new Set<string>();

async function monitorTransactions(client: Client) {
  const { fromDate, toDate } = getLastFiveMinutesRange();
  console.log(`Fetching transactions from ${fromDate} to ${toDate}`);

  try {
    const transactions = await fetchTransactionsByDateRange(fromDate, toDate);

    const newTransactions = transactions.filter((tx: any) => {
      if (!lastFetchedTransactionIds.has(tx.id)) {
        lastFetchedTransactionIds.add(tx.id);
        return true;
      }
      return false;
    });

    if (newTransactions.length > 0) {
      console.log(`New transactions found:`, newTransactions);
      await sendTransactionMessages(client, newTransactions);
    } else {
      console.log("No new transactions found.");
    }
  } catch (error) {
    console.error("Error during transaction monitoring:", error);
  }
}

export async function startTransactionMonitoring(client: Client) {
  await monitorTransactions(client);

  setInterval(async () => {
    await monitorTransactions(client);
  }, 5 * 60 * 1000);
}
