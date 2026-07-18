import axios from "axios";
import {
  CacheType,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { setTimeout } from "timers";

export const data: SlashCommandOptionsOnlyBuilder = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Game Server Manager")
  .addStringOption((option) =>
    option
      .setName("start")
      .setDescription("Start selected game server")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("stop")
      .setDescription("Stop selected game server")
      .setRequired(false),
  );

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> {
  const start = interaction.options.getString("start");
  const stop = interaction.options.getString("stop");

  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

  if (interaction.isRepliable()) await interaction.deleteReply();

  if (interaction.channel?.isSendable()) {
    if (start && stop) {
      await interaction.followUp({
        content: `${interaction.user}, Nigga You is stupid.`,
        flags: "Ephemeral",
      });

      setTimeout(async () => {
        if (interaction.isRepliable()) await interaction.deleteReply();
      }, 5 * 1000);
    }
    if (start && !stop) {
      await interaction.channel.send(start);
    }

    if (!start && stop) {
      await interaction.channel.send(`Oh Dear \n${start}`);
    }
    if (!start && !stop) {
      const servers = await getServerList();
      await interaction.channel.send(`${servers.toString()}`);
    }
  }
}

async function getServerList() {
  const servers = await axios.get(
    `${process.env.SERVER_URL ?? "localhost:3000"}/server`,
  );
  return servers;
}
