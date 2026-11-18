import DiscordException from '@/service/exception/DiscordException';

export default class DiscordExceptionAPI extends DiscordException {
    public readonly data: unknown;
    public static readonly identifier: number = 0;
    public readonly status: number;

    constructor(message: string, status: number, data: unknown) {
        super(message);

        this.data   = data;
        this.status = status;
    }
}
