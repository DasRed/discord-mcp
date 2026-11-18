import type DiscordAPIClient from '@/service/DiscordAPIClient';
import DiscordExceptionConverter from '@/service/exception/DiscordExceptionConverter';
import type {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import type {CallToolResult} from '@modelcontextprotocol/sdk/types.js';
import type {ZodType} from 'zod';

export default abstract class MCPTool {
    protected readonly client: DiscordAPIClient;

    abstract get description(): string;

    abstract get inputSchema(): Record<string, ZodType>;

    abstract get name(): string;

    /** read-only tools never change anything on Discord */
    abstract get readOnly(): boolean;

    abstract get title(): string;

    constructor(client: DiscordAPIClient) {
        this.client = client;
    }

    async call(args: Record<string, unknown>): Promise<CallToolResult> {
        try {
            const result = await this.execute(args);

            return {content: [{text: JSON.stringify(result, null, 4), type: 'text'}]};
        }
        catch (error) {
            return {content: [{text: `Error: ${DiscordExceptionConverter.convert(error).message}`, type: 'text'}], isError: true};
        }
    }

    protected abstract execute(args: Record<string, unknown>): Promise<unknown>;

    register(server: McpServer): this {
        server.registerTool(
            this.name,
            {
                annotations: {
                    destructiveHint: false,
                    openWorldHint:   true,
                    readOnlyHint:    this.readOnly,
                    title:           this.title,
                },
                description: this.description,
                inputSchema: this.inputSchema,
                title:       this.title,
            },
            (args: Record<string, unknown>) => this.call(args),
        );

        return this;
    }
}
