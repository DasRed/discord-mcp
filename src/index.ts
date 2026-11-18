import config from '@/config';
import app from '@/lib/app';
import route from '@/route/index';

await app.register(route);
await app.listen({host: config.server.host, port: config.server.port});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
        void app.close().then(() => process.exit(0));
    });
}
