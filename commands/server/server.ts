import {
  CacheType,
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { setTimeout } from "timers";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Game Server Manager")
  .addUserOption((option) =>
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
  const user: User = interaction.options.getUser("user")!;
  const curse = interaction.options.getString("curse");
  await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
  if (interaction.isRepliable() && (curse || user))
    await interaction.deleteReply();

  if (interaction.channel?.isSendable()) {
    if (curse && !user) await interaction.channel.send(curse);
    if (curse && user)
      await interaction.channel.send(`Oh Dear ${user}, \n${curse}`);
    if (!curse && user) await interaction.channel.send(`Fuck you, ${user}`);
    if (!curse && !user) {
      await interaction.followUp({
        content: `${interaction.user}, Nigga You is stupid.`,
        flags: "Ephemeral",
      });

      setTimeout(async () => {
        if (interaction.isRepliable()) await interaction.deleteReply();
      }, 5 * 1000);
    }
  }
}
