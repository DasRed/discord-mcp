import health from '@/route/health';
import mcp from '@/route/mcp';
import type {FastifyInstance} from 'fastify';

export default async function index(app: FastifyInstance): Promise<void> {
    await app.register(health);
    await app.register(mcp);
}
