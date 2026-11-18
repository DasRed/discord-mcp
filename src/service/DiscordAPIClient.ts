import DiscordHTTPMethodEnum from '@/enum/DiscordHTTPMethodEnum';
import type DiscordSessionInterface from '@/interface/DiscordSessionInterface';
import type DiscordAPIChannelInterface from '@/model/api/DiscordAPIChannelInterface';
import type DiscordAPIErrorInterface from '@/model/api/DiscordAPIErrorInterface';
import type DiscordAPIGuildInterface from '@/model/api/DiscordAPIGuildInterface';
import type DiscordAPIMessageInterface from '@/model/api/DiscordAPIMessageInterface';
import type DiscordChannelModelInterface from '@/model/DiscordChannelModelInterface';
import type DiscordDirectChannelModelInterface from '@/model/DiscordDirectChannelModelInterface';
import type DiscordGuildModelInterface from '@/model/DiscordGuildModelInterface';
import type DiscordMessageModelInterface from '@/model/DiscordMessageModelInterface';
import DiscordModelConverter from '@/service/DiscordModelConverter';
import DiscordExceptionAPIFactory from '@/service/exception/DiscordExceptionAPIFactory';
import DiscordExceptionConverter from '@/service/exception/DiscordExceptionConverter';
import {setTimeout} from 'node:timers/promises';

interface DiscordAPIClientConstructorOptionInterface {
    session: DiscordSessionInterface;
    url?: string;
}

interface DiscordAPIClientMessagesOptionInterface {
    /** only messages older than this message ID */
    before?: string;
    limit?: number;
}

const MAX_RATE_LIMIT_RETRIES = 3;

export default class DiscordAPIClient {
    protected readonly session: DiscordSessionInterface;
    protected readonly url: string;

    constructor({session, url = 'https://discord.com/api/v9'}: DiscordAPIClientConstructorOptionInterface) {
        this.session = session;
        this.url     = url.replace(/\/+$/, '');
    }

    async createMessage(channelId: string, content: string): Promise<DiscordMessageModelInterface> {
        const message = await this.fetch<DiscordAPIMessageInterface>(DiscordHTTPMethodEnum.POST, `/channels/${encodeURIComponent(channelId)}/messages`, {content});

        return DiscordModelConverter.toMessage(message);
    }

    protected async fetch<T>(method: DiscordHTTPMethodEnum, path: string, body?: unknown): Promise<T> {
        let authRetried      = false;
        let rateLimitRetries = 0;

        while (true) {
            const response = await this.send(method, path, body);

            if (response.status === 401 && authRetried === false) {
                authRetried = true;
                this.session.invalidate();
                continue;
            }

            if (response.status === 429 && rateLimitRetries < MAX_RATE_LIMIT_RETRIES) {
                rateLimitRetries++;
                const error = (await this.parse(response) ?? {}) as DiscordAPIErrorInterface;
                // retry_after is given in seconds
                await setTimeout(Math.ceil((error.retry_after ?? 1) * 1000));
                continue;
            }

            const data = await this.parse(response);
            if (response.ok === false) {
                throw DiscordExceptionAPIFactory.create({data, method, path, status: response.status});
            }

            return data as T;
        }
    }

    async getChannelMessages(channelId: string, {before, limit = 50}: DiscordAPIClientMessagesOptionInterface = {}): Promise<DiscordMessageModelInterface[]> {
        const query = new URLSearchParams({limit: String(limit)});
        if (before !== undefined) {
            query.set('before', before);
        }

        const messages = await this.fetch<DiscordAPIMessageInterface[]>(DiscordHTTPMethodEnum.GET, `/channels/${encodeURIComponent(channelId)}/messages?${query.toString()}`);

        return messages.map((message) => DiscordModelConverter.toMessage(message));
    }

    async getDirectChannels(): Promise<DiscordDirectChannelModelInterface[]> {
        const channels = await this.fetch<DiscordAPIChannelInterface[]>(DiscordHTTPMethodEnum.GET, '/users/@me/channels');

        return channels.map((channel) => DiscordModelConverter.toDirectChannel(channel))
                       .sort((a, b) => (b.lastMessageAt?.getTime() ?? 0) - (a.lastMessageAt?.getTime() ?? 0));
    }

    async getGuildChannels(guildId: string): Promise<DiscordChannelModelInterface[]> {
        const channels = await this.fetch<DiscordAPIChannelInterface[]>(DiscordHTTPMethodEnum.GET, `/guilds/${encodeURIComponent(guildId)}/channels`);

        return channels.map((channel) => DiscordModelConverter.toChannel(channel))
                       .sort((a, b) => a.position - b.position);
    }

    async getGuilds(): Promise<DiscordGuildModelInterface[]> {
        const guilds = await this.fetch<DiscordAPIGuildInterface[]>(DiscordHTTPMethodEnum.GET, '/users/@me/guilds');

        return guilds.map((guild) => DiscordModelConverter.toGuild(guild));
    }

    protected async parse(response: Response): Promise<unknown> {
        const text = await response.text();
        if (text === '') {
            return null;
        }

        try {
            return JSON.parse(text);
        }
        catch {
            return text;
        }
    }

    protected async send(method: DiscordHTTPMethodEnum, path: string, body?: unknown): Promise<Response> {
        const headers: Record<string, string> = {
            'accept':        'application/json',
            'authorization': await this.session.getToken(),
            'user-agent':    this.session.getUserAgent(),
        };
        if (body !== undefined) {
            headers['content-type'] = 'application/json';
        }

        let response: Response;
        try {
            response = await fetch(`${this.url}${path}`, {
                body:    body !== undefined ? JSON.stringify(body) : undefined,
                cache:   'no-cache',
                headers: headers,
                method:  method,
            });
        }
        catch (error) {
            throw DiscordExceptionConverter.convert(error);
        }

        return response;
    }
}
