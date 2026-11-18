import type DiscordMessageModelInterface from '@/model/DiscordMessageModelInterface';
import MCPTool from '@/service/mcp/MCPTool';
import {DateTime} from 'luxon';
import {z, type ZodType} from 'zod';

const PAGE_SIZE = 100;

export default class MCPToolReadMessages extends MCPTool {
    get description(): string {
        return 'Read the most recent messages of a channel or direct message channel, newest first, optionally limited to the last hours';
    }

    get inputSchema(): Record<string, ZodType> {
        return {
            channel_id:   z.string().regex(/^\d+$/).describe('ID of the channel or direct message channel, see get_channels or get_direct_messages'),
            hours_back:   z.number().positive().optional().describe('Only messages of the last hours'),
            max_messages: z.number().int().min(1).max(500).describe('Maximum number of messages to return'),
        };
    }

    get name(): string {
        return 'read_messages';
    }

    get readOnly(): boolean {
        return true;
    }

    get title(): string {
        return 'Read messages';
    }

    protected async execute(args: Record<string, unknown>): Promise<DiscordMessageModelInterface[]> {
        const channelId   = args.channel_id as string;
        const maxMessages = args.max_messages as number;
        const hoursBack   = args.hours_back as number | undefined;
        const since       = hoursBack != null ? DateTime.now().minus({hours: hoursBack}).toJSDate() : null;
        const messages: DiscordMessageModelInterface[] = [];
        let before: string | undefined = undefined;

        while (messages.length < maxMessages) {
            const limit   = Math.min(PAGE_SIZE, maxMessages - messages.length);
            const page    = await this.client.getChannelMessages(channelId, {before, limit});
            const inRange = since === null ? page : page.filter((message) => message.timestamp >= since);

            messages.push(...inRange);

            if (page.length < limit || inRange.length < page.length) {
                break;
            }

            before = page[page.length - 1].id;
        }

        return messages;
    }
}
