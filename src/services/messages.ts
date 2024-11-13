import {
  TextChannel,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  Client,
} from "discord.js";
import { getSheetsConfig } from "../db/config";
import { SecretConfig } from "../config";
import { findOrCreateChannel } from "./channels";

export async function sendReport(
  channel: TextChannel,
  transactions: any[],
  reportTitle: string
) {
  if (!transactions?.length) {
    await channel.send("No transactions found for the specified period.");
    return;
  }

  const totalSpent = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const userSpending: { [userId: string]: { name: string; amount: number } } =
    {};
  const categorySpending: { [categoryName: string]: number } = {};

  transactions.forEach((transaction) => {
    const { card_holder, amount, sk_category_name } = transaction;
    if (card_holder && card_holder.user_id) {
      const { user_id, first_name, last_name } = card_holder;
      const name = `${first_name} ${last_name}`;
      userSpending[user_id] = {
        name,
        amount: (userSpending[user_id]?.amount || 0) + amount,
      };
    }

    if (sk_category_name) {
      categorySpending[sk_category_name] =
        (categorySpending[sk_category_name] || 0) + amount;
    }
  });

  const topUsers = Object.values(userSpending)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const topCategories = Object.entries(categorySpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([categoryName, amount]) => ({ categoryName, amount }));

  const summary = `
    ${reportTitle}
    > **Total Amount Spent:** ${formatAmount(totalSpent)}
    > **Top Spenders:**
    ${topUsers
      .map(
        (user, index) =>
          `> ${index + 1}. ${user.name}: ${formatAmount(user.amount)}`
      )
      .join("\n")}
    > **Top Categories:**
    ${topCategories
      .map(
        (category, index) =>
          `> ${index + 1}. ${category.categoryName}: ${formatAmount(
            category.amount
          )}`
      )
      .join("\n")}
    `;

  await channel.send(summary);
}

export async function sendTransactionMessages(
  client: Client,
  transactions: any[]
) {
  const { TEXT_CHANNEL_ALERTS, LARGE_TRANSACTION } = await getSheetsConfig();

  console.log(TEXT_CHANNEL_ALERTS, LARGE_TRANSACTION);

  const guildId = SecretConfig.GUILD_ID;
  const channel = await findOrCreateChannel(
    client,
    guildId,
    TEXT_CHANNEL_ALERTS
  );

  if (!channel) {
    console.error(
      `Channel ${TEXT_CHANNEL_ALERTS} could not be found or created`
    );
    throw new Error(
      `Channel ${TEXT_CHANNEL_ALERTS} could not be found or created`
    );
  }

  for (const transaction of transactions) {
    const isLargeTransaction = transaction.amount >= LARGE_TRANSACTION;
    const { content, components } = createTransactionMessage(
      transaction,
      isLargeTransaction
    );

    try {
      await channel.send({ content, components });
      console.log(`Transaction alert sent to channel: ${TEXT_CHANNEL_ALERTS}`);
    } catch (error) {
      console.error(`Error sending message to ${TEXT_CHANNEL_ALERTS}:`, error);
    }
  }
}

function createTransactionMessage(
  transaction: any,
  isLargeTransaction: boolean
): {
  content: string;
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  if (!transaction) {
    throw new Error("No transaction data provided");
  }

  const cardHolder = transaction.card_holder
    ? `${transaction.card_holder.first_name || ""} ${
        transaction.card_holder.last_name || ""
      }`.trim()
    : "N/A";

  const content = `
${isLargeTransaction ? "🚨 **LARGE TRANSACTION ALERT** 🚨" : ""}
> **Card Holder**: ${cardHolder}
> **Amount**: ${formatAmount(transaction.amount)} ${
    transaction.currency_code || "USD"
  }
> **Merchant**: ${transaction.merchant_name || "N/A"}`;

  const button = new ButtonBuilder()
    .setLabel("Review Transaction")
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
