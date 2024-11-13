import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  GuildMember,
  ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { fetchUserByEmail } from "../ramp/routes";
import { sendVerificationEmail, verifyCode } from "../services/verify";
import { addVerifiedUser } from "../db/sheets";
import { ROLE_NAMES } from "../services/roles";

export const command = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your Ramp account");

export async function executeVerify(interaction: ChatInputCommandInteraction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId("verifyEmailModal")
      .setTitle("Verify Your Ramp Email");

    const emailInput = new TextInputBuilder()
      .setCustomId("email")
      .setLabel("Enter your Ramp email address")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("user@company.com")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput)
    );

    await interaction.showModal(modal);
  } catch (error) {
    console.error("Error showing verify modal:", error);
    await interaction.reply({
      content: "There was an error starting verification. Please try again.",
      ephemeral: true,
    });
  }
}

export async function handleEmailSubmit(interaction: ModalSubmitInteraction) {
  try {
    const email = interaction.fields.getTextInputValue("email").toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await interaction.reply({
        content: "Please enter a valid email address.",
        ephemeral: true,
      });
      return;
    }

    const rampUser = await fetchUserByEmail(email);
    if (!rampUser) {
      await interaction.reply({
        content:
          "This email is not associated with any Ramp account. Please make sure you've been invited to Ramp first.",
        ephemeral: true,
      });
      return;
    }

    const emailSent = await sendVerificationEmail(interaction.user.id, email);
    if (!emailSent) {
      await interaction.reply({
        content: "Failed to send verification email. Please try again later.",
        ephemeral: true,
      });
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("enterVerificationCode")
        .setLabel("Enter Verification Code")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({
      content:
        "A verification code has been sent to your email. Click the button below to enter it.",
      components: [row],
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error in email verification:", error);
    if (!interaction.replied) {
      await interaction.reply({
        content:
          "There was an error processing your verification. Please try again.",
        ephemeral: true,
      });
    }
  }
}

export async function handleVerificationButton(interaction: ButtonInteraction) {
  const modal = new ModalBuilder()
    .setCustomId("verifyCodeModal")
    .setTitle("Enter Verification Code");

  const codeInput = new TextInputBuilder()
    .setCustomId("code")
    .setLabel("Enter the code sent to your email")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter 6-digit code")
    .setRequired(true);

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput)
  );

  await interaction.showModal(modal);
}

export async function handleCodeSubmit(interaction: ModalSubmitInteraction) {
  try {
    const code = interaction.fields.getTextInputValue("code");
    const result = verifyCode(interaction.user.id, code);

    if (!result.email) {
      throw Error;
    }

    if (!result.valid) {
      await interaction.reply({
        content: result.message,
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const rampUser = await fetchUserByEmail(result.email);
    if (!rampUser || !rampUser.id || !rampUser.role) {
      throw new Error("Ramp user or user ID not found during verification.");
    }

    await addVerifiedUser(
      interaction.user.id,
      result.email,
      rampUser.id,
      rampUser.role
    );

    const member = interaction.member as GuildMember;
    const verifiedRole = interaction.guild?.roles.cache.find(
      (role) => role.name === ROLE_NAMES.VERIFIED
    );
    const employeeRole = interaction.guild?.roles.cache.find(
      (role) => role.name === ROLE_NAMES.EMPLOYEE
    );

    if (!verifiedRole || !employeeRole) {
      throw new Error("Verified or Employee role not found");
    }

    await member.roles.add([verifiedRole, employeeRole]);
    await interaction.editReply({
      content:
        "✅ Your email has been verified! You now have access to Ramp commands.",
    });
  } catch (error) {
    console.error("Error in code verification:", error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content:
          "There was an error completing your verification. Please try again.",
        ephemeral: true,
      });
    } else {
      await interaction.editReply({
        content:
          "There was an error completing your verification. Please try again.",
      });
    }
  }
}
