export default class DiscordException extends Error {
    constructor(message: string) {
        super(message);

        this.name = new.target.name;
    }
}
