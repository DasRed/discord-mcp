export default interface DiscordSessionInterface {
    getToken(): Promise<string>;
    getUserAgent(): string;
    invalidate(): this;
}
