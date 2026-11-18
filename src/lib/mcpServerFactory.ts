import config from '@/config';
import discordAPIClient from '@/lib/discordAPIClient';
import MCPServerFactory from '@/service/mcp/MCPServerFactory';
import MCPToolGetChannels from '@/service/mcp/MCPToolGetChannels';
import MCPToolGetDirectMessages from '@/service/mcp/MCPToolGetDirectMessages';
import MCPToolGetServers from '@/service/mcp/MCPToolGetServers';
import MCPToolReadMessages from '@/service/mcp/MCPToolReadMessages';
import MCPToolSendMessage from '@/service/mcp/MCPToolSendMessage';
import {createRequire} from 'node:module';

// package.json lies two levels above src/lib and dist/lib
const {version} = createRequire(import.meta.url)('../../package.json') as {version: string};

const mcpServerFactory = new MCPServerFactory({
    readOnly: config.mcp.readOnly,
    tools:    [
        new MCPToolGetServers(discordAPIClient),
        new MCPToolGetChannels(discordAPIClient),
        new MCPToolGetDirectMessages(discordAPIClient),
        new MCPToolReadMessages(discordAPIClient),
        new MCPToolSendMessage(discordAPIClient),
    ],
    version:  version,
});

export default mcpServerFactory;
