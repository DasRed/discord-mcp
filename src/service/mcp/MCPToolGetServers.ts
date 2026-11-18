import type DiscordGuildModelInterface from '@/model/DiscordGuildModelInterface';
import MCPTool from '@/service/mcp/MCPTool';
import type {ZodType} from 'zod';

export default class MCPToolGetServers extends MCPTool {
    get description(): string {
        return 'List all Discord servers (guilds) the account is a member of';
    }

    get inputSchema(): Record<string, ZodType> {
        return {};
    }

    get name(): string {
        return 'get_servers';
    }

    get readOnly(): boolean {
        return true;
    }

    get title(): string {
        return 'Get servers';
    }

    protected async execute(): Promise<DiscordGuildModelInterface[]> {
        return this.client.getGuilds();
    }
}
