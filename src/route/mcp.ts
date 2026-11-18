import config from '@/config';
import mcpServerFactory from '@/lib/mcpServerFactory';
import BearerTokenValidator from '@/service/BearerTokenValidator';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type {FastifyInstance} from 'fastify';

function jsonRPCError(message: string): object {
    return {error: {code: -32000, message}, id: null, jsonrpc: '2.0'};
}

export default async function mcp(app: FastifyInstance): Promise<void> {
    app.post(config.mcp.path, async (request, reply) => {
        if (BearerTokenValidator.isValid(request.headers.authorization, config.mcp.authToken) === false) {
            return reply.code(401).header('www-authenticate', 'Bearer').send(jsonRPCError('Unauthorized'));
        }

        // stateless: every request gets its own MCP server and transport
        const server    = mcpServerFactory.create();
        const transport = new StreamableHTTPServerTransport({enableJsonResponse: true, sessionIdGenerator: undefined});

        reply.hijack();
        reply.raw.on('close', () => {
            void transport.close();
            void server.close();
        });

        await server.connect(transport);
        await transport.handleRequest(request.raw, reply.raw, request.body);
    });

    app.route({
        handler: async (_request, reply) => reply.code(405).header('allow', 'POST').send(jsonRPCError('Method not allowed')),
        method:  ['DELETE', 'GET'],
        url:     config.mcp.path,
    });
}
