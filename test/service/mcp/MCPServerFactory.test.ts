import type DiscordAPIClient from '@/service/DiscordAPIClient';
import MCPServerFactory from '@/service/mcp/MCPServerFactory';
import MCPToolGetChannels from '@/service/mcp/MCPToolGetChannels';
import MCPToolGetDirectMessages from '@/service/mcp/MCPToolGetDirectMessages';
import MCPToolGetServers from '@/service/mcp/MCPToolGetServers';
import MCPToolReadMessages from '@/service/mcp/MCPToolReadMessages';
import MCPToolSendMessage from '@/service/mcp/MCPToolSendMessage';
import {describe, expect, it} from 'vitest';

const client = {} as DiscordAPIClient;
const tools  = [new MCPToolGetServers(client), new MCPToolGetChannels(client), new MCPToolGetDirectMessages(client), new MCPToolReadMessages(client), new MCPToolSendMessage(client)];

describe('MCPServerFactory', () => {
    it('hides write tools in read-only mode', () => {
        const factory = new MCPServerFactory({readOnly: true, tools, version: '1.0.0'});

        expect(factory.getTools().map((tool) => tool.name)).toEqual(['get_servers', 'get_channels', 'get_direct_messages', 'read_messages']);
    });

    it('exposes all tools when read-only is disabled', () => {
        const factory = new MCPServerFactory({readOnly: false, tools, version: '1.0.0'});

        expect(factory.getTools().map((tool) => tool.name)).toContain('send_message');
        expect(factory.create()).toBeDefined();
    });
});
