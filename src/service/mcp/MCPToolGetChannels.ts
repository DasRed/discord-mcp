import type DiscordChannelModelInterface from '@/model/DiscordChannelModelInterface';
import MCPTool from '@/service/mcp/MCPTool';
import {z, type ZodType} from 'zod';

export default class MCPToolGetChannels extends MCPTool {
    get description(): string {
        return 'List the channels of a Discord server, including categories, voice channels and threads';
    }

    get inputSchema(): Record<string, ZodType> {
        return {
            server_id: z.string().regex(/^\d+$/).describe('ID of the server, see get_servers'),
        };
    }

    get name(): string {
        return 'get_channels';
    }

    get readOnly(): boolean {
        return true;
    }

    get title(): string {
        return 'Get channels';
    }

    protected async execute(args: Record<string, unknown>): Promise<DiscordChannelModelInterface[]> {
        return this.client.getGuildChannels(args.server_id as string);
    }
}
