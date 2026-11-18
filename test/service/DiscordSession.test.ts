import DiscordSession from '@/service/DiscordSession';
import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

describe('DiscordSession', () => {
    let dataDir: string;

    beforeEach(async () => {
        dataDir = await mkdtemp(join(tmpdir(), 'discord-mcp-'));
    });

    afterEach(async () => {
        await rm(dataDir, {force: true, recursive: true});
    });

    it('uses the configured token without a browser', async () => {
        const session = new DiscordSession({dataDir, token: 'configured'});

        expect(await session.getToken()).toBe('configured');
        expect(session.getUserAgent()).toContain('Chrome/');
    });

    it('reuses the stored token of a previous login once', async () => {
        await writeFile(join(dataDir, 'token'), 'stored\n');

        const session = new DiscordSession({dataDir});

        expect(await session.getToken()).toBe('stored');
        expect(await session.getToken()).toBe('stored');
    });
});
