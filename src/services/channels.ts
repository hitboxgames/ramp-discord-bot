import { Client, TextChannel, ChannelType } from "discord.js";

let rampTransactionsChannelId: string | null = null;
let rampBusinessAlertsChannelId: string | null = null;

async function findOrCreateChannel(
  client: Client,
  guildId: string,
  channelName: string
): Promise<TextChannel> {
  const guild = await client.guilds.fetch(guildId);
  const channels = await guild.channels.fetch();

  const existingChannel = channels.find(
    (channel): channel is TextChannel =>
      channel?.type === ChannelType.GuildText && channel.name === channelName
  );

  if (existingChannel) {
    console.log(`Found existing channel: ${existingChannel.name}`);
    return existingChannel;
  }

  const newChannel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    reason: `${channelName} channel required by bot`,
  });

  console.log(`Created new channel: ${newChannel.name}`);
  return newChannel;
}

export async function findOrCreateRampTransactionsChannel(
  client: Client,
  guildId: string
) {
  const channel = await findOrCreateChannel(
    client,
    guildId,
    "ramp-transactions"
  );
  rampTransactionsChannelId = channel.id;
  return channel;
}

export async function findOrCreateRampBusinessAlertsChannel(
  client: Client,
  guildId: string
) {
  const channel = await findOrCreateChannel(
    client,
    guildId,
    "ramp-business-alerts"
  );
  rampBusinessAlertsChannelId = channel.id;
  return channel;
}
