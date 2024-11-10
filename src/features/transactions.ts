import {
  Client,
  TextChannel,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
} from "discord.js";
import { fetchRecentTransactions } from "../api/routes";
import { findOrCreateRampTransactionsChannel } from "./channels";

export async function sendRecentTransactionsToChannel(
  client: Client,
  guildId: string
) {
  try {
    const channel = await findOrCreateRampTransactionsChannel(client, guildId);
    if (!channel) {
      throw new Error("Failed to access transactions channel");
    }

    const transactions = await fetchRecentTransactions();
    await sendTransactions(channel, transactions);
  } catch (error) {
    console.error("Failed to process transactions:", error);
    throw error;
  }
}

async function sendTransactions(channel: TextChannel, transactions: any[]) {
  if (!transactions?.length) {
    await channel.send("No transactions found for the specified period.");
    return;
  }

  for (const transaction of transactions) {
    try {
      const message = createTransactionMessage(transaction);
      await channel.send(message);
    } catch (error) {
      console.error("Error formatting transaction:", error);
      console.error(
        "Problematic transaction:",
        JSON.stringify(transaction, null, 2)
      );
    }
  }
}

function createTransactionMessage(transaction: any): {
  content: string;
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  // Defensive check for required transaction object
  if (!transaction) {
    throw new Error("No transaction data provided");
  }

  // Safely get card holder details
  const cardHolder = transaction.card_holder
    ? `${transaction.card_holder.first_name || ""} ${
        transaction.card_holder.last_name || ""
      }`.trim()
    : "N/A";

  const content = `
> **Card Holder**: ${cardHolder}
> **Amount**: ${formatAmount(transaction.amount)} ${
    transaction.currency_code || "USD"
  }
> **Merchant**: ${transaction.merchant_name || "N/A"}
> **Category**: ${transaction.sk_category_name || "N/A"}`;

  // Create button to view transaction
  const button = new ButtonBuilder()
    .setLabel("View Transaction")
    .setStyle(ButtonStyle.Link)
    .setURL(`https://demo.ramp.com/expenses/transactions/${transaction.id}`);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

  return {
    content,
    components: [row],
  };
}

function formatAmount(amount: number | null | undefined): string {
  if (amount == null) return "N/A";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  } catch {
    return `$${amount}`;
  }
}
