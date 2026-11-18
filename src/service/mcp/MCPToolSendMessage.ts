import MCPTool from '@/service/mcp/MCPTool';
import MessageSplitter from '@/service/MessageSplitter';
import {setTimeout} from 'node:timers/promises';
import {z, type ZodType} from 'zod';

interface MCPToolSendMessageResultInterface {
    channelId: string;
    messageIds: string[];
}

// pause between the parts of a split message to stay below the rate limit
const PART_DELAY = 500;

export default class MCPToolSendMessage extends MCPTool {
    get description(): string {
        return 'Send a message to a channel or direct message channel as the Discord account; messages longer than 2000 characters are split';
    }

    get inputSchema(): Record<string, ZodType> {
        return {
            channel_id: z.string().regex(/^\d+$/).describe('ID of the channel or direct message channel, see get_channels or get_direct_messages'),
            content:    z.string().min(1).describe('Message text, Discord markdown is supported'),
        };
    }

    get name(): string {
        return 'send_message';
    }

    get readOnly(): boolean {
        return false;
    }

    get title(): string {
        return 'Send message';
    }

    protected async execute(args: Record<string, unknown>): Promise<MCPToolSendMessageResultInterface> {
        const channelId  = args.channel_id as string;
        const messageIds: string[] = [];

        for (const part of MessageSplitter.split(args.content as string)) {
            if (messageIds.length > 0) {
                await setTimeout(PART_DELAY);
            }

            const message = await this.client.createMessage(channelId, part);
            messageIds.push(message.id);
        }

        return {channelId, messageIds};
    }
}
