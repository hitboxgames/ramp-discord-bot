import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalSubmitInteraction,
  GuildMember,
} from "discord.js";
import { hasManagerRole, ROLE_NAMES } from "../services/roles";
import { createUserInvite } from "../ramp/routes/users";
import { RampRole, roleMap } from "../types/roles";

export interface InvitePayload {
  email: string;
  first_name: string;
  last_name: string;
  role: RampRole;
}

export const command = new SlashCommandBuilder()
  .setName("invite")
  .setDescription("Invite a new user to Ramp")
  .setDefaultMemberPermissions("0");

export async function executeInvite(interaction: ChatInputCommandInteraction) {
  try {
    if (!hasManagerRole(interaction.member as GuildMember)) {
      await interaction.reply({
        content: `You need the "${ROLE_NAMES.MANAGER}" role to invite users.`,
        ephemeral: true,
      });
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId("inviteModal")
      .setTitle("Invite User to Ramp");

    const emailInput = new TextInputBuilder()
      .setCustomId("email")
      .setLabel("Email")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("user@company.com")
      .setRequired(true);

    const firstNameInput = new TextInputBuilder()
      .setCustomId("firstName")
      .setLabel("First Name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter first name")
      .setRequired(true);

    const lastNameInput = new TextInputBuilder()
      .setCustomId("lastName")
      .setLabel("Last Name")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter last name")
      .setRequired(true);

    const roleInput = new TextInputBuilder()
      .setCustomId("role")
      .setLabel("Role (ADMIN, USER, BOOKKEEPER)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter role")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(emailInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(firstNameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(lastNameInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(roleInput)
    );

    await interaction.showModal(modal);
  } catch (error) {
    console.error("Error creating invite modal:", error);
    await interaction.reply({
      content: "There was an error processing your request. Please try again.",
      ephemeral: true,
    });
  }
}

export async function handleInviteModal(interaction: ModalSubmitInteraction) {
  if (interaction.customId !== "inviteModal") return;

  try {
    const email = interaction.fields.getTextInputValue("email");
    const firstName = interaction.fields.getTextInputValue("firstName");
    const lastName = interaction.fields.getTextInputValue("lastName");
    const roleInput = interaction.fields
      .getTextInputValue("role")
      .toUpperCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await interaction.reply({
        content: "Please enter a valid email address.",
        ephemeral: true,
      });
      return;
    }

    const role = roleMap[roleInput];

    if (!role) {
      await interaction.reply({
        content: "Invalid role. Please use User role.",
        ephemeral: true,
      });
      return;
    }

    try {
      await createUserInvite(email, firstName, lastName, role);

      await interaction.reply({
        content: `✅ Invite sent successfully to ${firstName} ${lastName} (${email}) as ${role}. 
        Please let them know once they accept, to do /verify on discord to connect their Ramp account.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error sending invite:", error);
      await interaction.reply({
        content: "There was an error sending the invite. Please try again.",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error("Error handling invite modal submit:", error);
    await interaction.reply({
      content: "There was an error processing your request. Please try again.",
      ephemeral: true,
    });
  }
}
