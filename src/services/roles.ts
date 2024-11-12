import { Guild, Role, GuildMember } from "discord.js";

interface RampRoles {
  employee: Role;
  manager: Role;
  verified: Role;
}

const guildRoleIds = new Map<
  string,
  { employeeRoleId: string; managerRoleId: string; verifiedRoleId: string }
>();

export const ROLE_NAMES = {
  EMPLOYEE: "Employee - Ramp",
  MANAGER: "Manager - Ramp",
  VERIFIED: "Verified - Ramp",
} as const;

export async function setupRampRoles(guild: Guild): Promise<RampRoles> {
  try {
    const existingRoles = await guild.roles.fetch();

    let employeeRole = existingRoles.find(
      (role) => role.name === ROLE_NAMES.EMPLOYEE
    );
    let managerRole = existingRoles.find(
      (role) => role.name === ROLE_NAMES.MANAGER
    );
    let verifiedRole = existingRoles.find(
      (role) => role.name === ROLE_NAMES.VERIFIED
    );

    if (!employeeRole) {
      console.log(`Creating ${ROLE_NAMES.EMPLOYEE} role in ${guild.name}`);
      employeeRole = await guild.roles.create({
        name: ROLE_NAMES.EMPLOYEE,
        color: "Blue",
        reason: "Required for Ramp bot card requests",
        permissions: [],
      });
    }

    if (!managerRole) {
      console.log(`Creating ${ROLE_NAMES.MANAGER} role in ${guild.name}`);
      managerRole = await guild.roles.create({
        name: ROLE_NAMES.MANAGER,
        color: "Green",
        reason: "Required for Ramp bot card management",
        permissions: [],
      });
    }

    if (!verifiedRole) {
      console.log(`Creating ${ROLE_NAMES.VERIFIED} role in ${guild.name}`);
      verifiedRole = await guild.roles.create({
        name: ROLE_NAMES.VERIFIED,
        color: "Purple",
        reason: "Required for verified Ramp users",
        permissions: [],
      });
    }

    guildRoleIds.set(guild.id, {
      employeeRoleId: employeeRole.id,
      managerRoleId: managerRole.id,
      verifiedRoleId: verifiedRole.id,
    });

    return {
      employee: employeeRole,
      manager: managerRole,
      verified: verifiedRole,
    };
  } catch (error) {
    console.error(`Error setting up roles in guild ${guild.name}:`, error);
    throw error;
  }
}

export function hasEmployeeRole(member: GuildMember): boolean {
  const guildRoles = guildRoleIds.get(member.guild.id);
  if (!guildRoles) return false;
  return member.roles.cache.has(guildRoles.employeeRoleId);
}

export function hasManagerRole(member: GuildMember): boolean {
  const guildRoles = guildRoleIds.get(member.guild.id);
  if (!guildRoles) return false;
  return member.roles.cache.has(guildRoles.managerRoleId);
}

export function hasVerifiedRole(member: GuildMember): boolean {
  const guildRoles = guildRoleIds.get(member.guild.id);
  if (!guildRoles) return false;
  return member.roles.cache.has(guildRoles.verifiedRoleId);
}

export async function getRampRoleIds(guild: Guild): Promise<{
  employeeRoleId: string;
  managerRoleId: string;
  verifiedRoleId: string;
}> {
  const roles = await setupRampRoles(guild);
  return {
    employeeRoleId: roles.employee.id,
    managerRoleId: roles.manager.id,
    verifiedRoleId: roles.verified.id,
  };
}
