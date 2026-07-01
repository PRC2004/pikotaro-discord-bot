// Import Packages
import { Client, Events, GatewayIntentBits, REST, Collection, Routes, Interaction, MessageFlags } from 'discord.js'
import 'dotenv/config';
import fs from 'fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'url';

// Import Custom Types
import { COMMAND, CLIENT, INTERACTION } from '#types';
import { PassThrough } from 'stream';

const rest = new REST({version: '10'}).setToken(process.env.DISCORD_BOT_TOKEN!);

export const client: CLIENT = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

// Create __filename & __dirname for ES module (For node version older than 20)
const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

// Import Commands from Commands folder
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);
const commands: object[] = [];

for (const folder of commandFolders) {
    const commandPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith('.ts'))
    for (let file of commandFiles) {
        const filePath:URL | null = pathToFileURL(path.join(commandPath, file));
        if (filePath) {
            const { data, execute } = await import(filePath.toString());
            client.commands.set(data.name, execute);
            commands.push(data.toJSON());
        }
    }
}

client.on(Events.ClientReady, async readyClient => {
    console.log("refreshing the commands list.");
    try {
        // console.log(commands)
        await rest.put(Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID!), {body: commands})
    } catch (error: any) {
        console.error('Failed to update command list:', error)
    }
  console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.Error, error => {
    console.log('found this error.');
    console.error(error.name);
    console.error(error.message);
})

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const i = interaction as INTERACTION
    const command = i.client.commands?.get(i.commandName)
    
    if (!command) {
        console.error(`No Command matching ${i.commandName} was found`);
        return;
    }

    try {
        await command(i);
    } catch(error) {
        console.error(error);

        if (i.replied || i.deferred) {
            await i.followUp({
                content: 'There was an error while executing this command',
                flags: MessageFlags.Ephemeral
            });
        } else {
            await i.reply({
                content: 'There was an error while executing this command',
                flags: MessageFlags.Ephemeral
            })
        }
    }
})

client.login(process.env.DISCORD_BOT_TOKEN);
