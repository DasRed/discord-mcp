import type {FastifyInstance} from 'fastify';

export default async function health(app: FastifyInstance): Promise<void> {
    app.get('/healthz', async () => ({status: 'ok'}));
}
