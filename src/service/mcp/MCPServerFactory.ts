import type MCPTool from '@/service/mcp/MCPTool';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';

interface MCPServerFactoryConstructorOptionInterface {
    name?: string;
    readOnly: boolean;
    tools: MCPTool[];
    version: string;
}

export default class MCPServerFactory {
    protected readonly name: string;
    protected readonly readOnly: boolean;
    protected readonly tools: MCPTool[];
    protected readonly version: string;

    constructor({name = 'discord-mcp', readOnly, tools, version}: MCPServerFactoryConstructorOptionInterface) {
        this.name     = name;
        this.readOnly = readOnly;
        this.tools    = tools;
        this.version  = version;
    }

    create(): McpServer {
        const server = new McpServer({name: this.name, version: this.version});

        for (const tool of this.getTools()) {
            tool.register(server);
        }

        return server;
    }

    getTools(): MCPTool[] {
        return this.tools.filter((tool) => this.readOnly === false || tool.readOnly);
    }
}
