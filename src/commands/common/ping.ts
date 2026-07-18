import { isValidDate } from '#helper/validation.js';
import { CacheType, ChatInputCommandInteraction, Interaction, InteractionCallback, MessageFlags, SlashCommandBuilder, User } from 'discord.js';
import { TIMEOUT } from 'dns';
import { setTimeout } from 'timers';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!')
    .addUserOption(option => 
        option.setName('user')
            .setDescription('Fuck you, {user}')
            .setRequired(false)
    )
    .addStringOption(option => 
        option.setName('curse')
            .setDescription("I will abuse on your behalf.")
            .setRequired(false)
    )

export async function execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    const user: User = await interaction.options.getUser('user')!;
    const curse = await interaction.options.getString('curse');
    await interaction.deferReply({flags: [MessageFlags.Ephemeral]});
    if (interaction.isRepliable() && (curse || user)) await interaction.deleteReply()

    if (interaction.channel?.isSendable()) {
        if (curse && !user) await interaction.channel.send(curse);
        if (curse && user) await interaction.channel.send(`Oh Dear ${user}, \n${curse}`);
        if (!curse && user) await interaction.channel.send(`Fuck you, ${user}`);
        if (!curse && !user) { 
            await interaction.followUp({content: `${interaction.user}, Nigga You is stupid.`, flags: 'Ephemeral'});

            setTimeout(async () => {
                if (interaction.isRepliable()) await interaction.deleteReply();
            }, 5 * 1000)
        }
    }

}