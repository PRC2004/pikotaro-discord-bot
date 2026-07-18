import {
  APIGuildMember,
  CacheType,
  ChatInputCommandInteraction,
  ComponentType,
  Embed,
  Guild,
  GuildMember,
  Options,
  SelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  User,
  userMention,
  UserSelectMenuBuilder,
} from "discord.js";
import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { COMMAND, USER_PROFILE } from "@/types";
import { isValidUrl } from "@/helper/validation.js";

export const data = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Provides the user profile information")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("Mention the user profile u wanna fetch."),
  );

export async function execute(
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<void> {
  const selectMenu = new UserSelectMenuBuilder()
    .setCustomId("user-select")
    .setMaxValues(1)
    .setPlaceholder("Select User to fetch profile")
    .setRequired(true);

  const userFromOptions = await interaction.options.getUser("user");
  const user = userFromOptions
    ? await generateValidProfileFromUser(userFromOptions, interaction)
    : null;
  const embed: EmbedBuilder | null = user ? embedprofile(user) : null;

  const actionRow: ActionRowBuilder<UserSelectMenuBuilder> =
    new ActionRowBuilder<UserSelectMenuBuilder>().setComponents(selectMenu);
  const response = embed
    ? interaction.reply({
        embeds: [embed],
        components: [actionRow],
        withResponse: true,
      })
    : interaction.reply({ components: [actionRow], withResponse: true });
  const message = (await response).resource?.message;

  const collector = message?.createMessageComponentCollector({
    componentType: ComponentType.UserSelect,
    filter: (i) => i.customId === "user-select",
    time: 5 * 60 * 1000,
  });

  collector?.on("collect", async (i) => {
    const selection: GuildMember = i.members.get(
      `${i.values[0]}`,
    ) as GuildMember;
    if (selection) {
      const user = await generateValidProfileFromGuildMember(selection);
      const embed: EmbedBuilder = embedprofile(user);
      i.update({ embeds: [embed], components: [actionRow] });
    } else {
      i.update({
        components: [actionRow],
        content: "Nigga, i Couldn't find the account",
      });
    }
  });
}

function embedprofile(profile: USER_PROFILE): EmbedBuilder {
  // Need to add more information to the profiler.
  const embed = new EmbedBuilder()
    .setColor("Aqua")
    .setTitle(`${profile.username}`)
    .addFields(
      ...(profile.username
        ? [{ name: "Username", value: profile.username }]
        : []),
      ...(profile.createdOn && profile.joinedAt
        ? [
            {
              name: "Account Creation",
              value: profile.createdOn,
              inline: true,
            },
            {
              name: "Joined this server on",
              value: profile.joinedAt,
              inline: true,
            },
          ]
        : []),
    );

  isValidUrl(profile.avatar) ? embed.setThumbnail(profile.avatar) : null;
  return embed;
}

function generateValidProfileFromGuildMember(
  GuildMember: GuildMember,
): USER_PROFILE {
  return {
    username: GuildMember.user.username,
    avatar: GuildMember.user.displayAvatarURL(),
    createdOn: GuildMember.user.createdAt.toLocaleDateString(),
    joinedAt: GuildMember.joinedAt?.toLocaleDateString() || "",
  };
}

async function generateValidProfileFromUser(
  User: User,
  interaction: ChatInputCommandInteraction<CacheType>,
): Promise<USER_PROFILE | null> {
  const guildMember: GuildMember | undefined =
    await interaction.guild?.members.fetch(`${User.id}`);
  return guildMember ? generateValidProfileFromGuildMember(guildMember) : null;
}
