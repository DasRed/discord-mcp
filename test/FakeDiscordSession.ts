import type DiscordSessionInterface from '@/interface/DiscordSessionInterface';

export default class FakeDiscordSession implements DiscordSessionInterface {
    public invalidations: number;
    public tokens: string[];

    constructor(tokens: string[] = ['token-1', 'token-2']) {
        this.invalidations = 0;
        this.tokens        = tokens;
    }

    async getToken(): Promise<string> {
        return this.tokens[Math.min(this.invalidations, this.tokens.length - 1)];
    }

    getUserAgent(): string {
        return 'test-agent';
    }

    invalidate(): this {
        this.invalidations++;

        return this;
    }
}
