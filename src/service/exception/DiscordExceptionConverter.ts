import DiscordException from '@/service/exception/DiscordException';
import DiscordExceptionUnknown from '@/service/exception/DiscordExceptionUnknown';
import DiscordExceptionUnknownError from '@/service/exception/DiscordExceptionUnknownError';

export default class DiscordExceptionConverter {
    static convert(error: unknown): DiscordException {
        if (error instanceof DiscordException) {
            return error;
        }
        if (error instanceof Error) {
            return new DiscordExceptionUnknownError(error);
        }

        return new DiscordExceptionUnknown(error);
    }
}
