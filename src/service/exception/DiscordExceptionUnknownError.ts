import DiscordException from '@/service/exception/DiscordException';

export default class DiscordExceptionUnknownError extends DiscordException {
    public readonly error: Error;

    constructor(error: Error) {
        super(error.message);

        this.error = error;
    }
}
