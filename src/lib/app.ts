import config from '@/config';
import fastify from 'fastify';

const app = fastify({logger: {level: config.server.logLevel}});

export default app;
