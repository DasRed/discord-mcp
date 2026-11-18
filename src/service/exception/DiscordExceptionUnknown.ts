import DiscordException from '@/service/exception/DiscordException';

export default class DiscordExceptionUnknown extends DiscordException {
    public readonly data: unknown;

    constructor(data: unknown) {
        super(String(data));

        this.data = data;
    }
}
