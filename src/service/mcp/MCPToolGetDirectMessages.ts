import type DiscordDirectChannelModelInterface from '@/model/DiscordDirectChannelModelInterface';
import MCPTool from '@/service/mcp/MCPTool';
import type {ZodType} from 'zod';

export default class MCPToolGetDirectMessages extends MCPTool {
    get description(): string {
        return 'List the direct message and group DM channels of the account, most recent activity first. Use the channel ID with read_messages';
    }

    get inputSchema(): Record<string, ZodType> {
        return {};
    }

    get name(): string {
        return 'get_direct_messages';
    }

    get readOnly(): boolean {
        return true;
    }

    get title(): string {
        return 'Get direct messages';
    }

    protected async execute(): Promise<DiscordDirectChannelModelInterface[]> {
        return this.client.getDirectChannels();
    }
}
