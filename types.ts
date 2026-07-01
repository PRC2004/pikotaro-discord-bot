import { CacheType, ChatInputCommandInteraction, Client, Collection, Interaction } from 'discord.js';
import { CLIENT_RENEG_LIMIT } from 'node:tls';

export interface COMMAND {
    name: string;
    description: string;
    type: number;
    integration_types?: number[];
    contexts?: number[];
    options?: {
        name: string;
        value: string;
    }[];
}

export interface USER_PROFILE {
    avatar?: string;
    username: string;
    joinedAt: string;
    createdOn: string;
}

export interface CLIENT extends Client<true> {
    commands?: Collection<string, any>;
}

export interface INTERACTION extends ChatInputCommandInteraction<CacheType> {
    commands: Collection<string, any>;
    client: CLIENT
}
