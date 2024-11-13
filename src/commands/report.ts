import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from "discord.js";
import {
  getTodayRange,
  getYesterdayRange,
  getLastWeekRange,
  getLastMonthRange,
} from "../utils/dates";

import { fetchTransactionsByDateRange } from "../ramp/routes/transactions";
import { findOrCreateRampTransactionsChannel } from "../services/channels";
import { sendReport } from "../services/messages";
import { hasManagerRole } from "../services/roles";

export const command = new SlashCommandBuilder()
  .setName("report")
  .setDescription("Generate a report for transactions")
  .addStringOption((option) =>
    option
      .setName("period")
      .setDescription("Select the time period for the report")
      .setRequired(true)
      .addChoices(
        { name: "Today", value: "today" },
        { name: "Yesterday", value: "yesterday" },
        { name: "Last Week", value: "lastWeek" },
        { name: "Last Month", value: "lastMonth" }
      )
  );

export async function executeReport(interaction: ChatInputCommandInteraction) {
  try {
    if (!hasManagerRole(interaction.member as GuildMember)) {
      await interaction.reply({
        content: "You must have the manager role to use this command.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const period = interaction.options.getString("period");
    if (!period) {
      await interaction.editReply("Please select a valid time period.");
      return;
    }

    let dateRange;
    let reportTitle;
    switch (period) {
      case "today":
        dateRange = getTodayRange();
        reportTitle = "Your daily business spending report is available!";
        break;
      case "yesterday":
        dateRange = getYesterdayRange();
        reportTitle = "Yesterday's business spending report is available!";
        break;
      case "lastWeek":
        dateRange = getLastWeekRange();
        reportTitle = "Your weekly business spending report is available!";
        break;
      case "lastMonth":
        dateRange = getLastMonthRange();
        reportTitle = "Your monthly business spending report is available!";
        break;
      default:
        await interaction.editReply("Invalid time period selected.");
        return;
    }

    const transactions = await fetchTransactionsByDateRange(
      dateRange.fromDate,
      dateRange.toDate
    );

    const channel = await findOrCreateRampTransactionsChannel(
      interaction.client,
      interaction.guildId!
    );
    if (!channel) {
      await interaction.editReply(
        "Failed to access the transactions channel. Please try again later."
      );
      return;
    }

    await sendReport(channel, transactions, reportTitle);

    await interaction.editReply(
      `${reportTitle} has been generated and sent to the transactions channel.`
    );
  } catch (error) {
    console.error("Error generating report:", error);
    await interaction.editReply(
      "An error occurred while generating the report. Please try again later."
    );
  }
}
