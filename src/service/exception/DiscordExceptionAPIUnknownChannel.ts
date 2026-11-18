import DiscordExceptionAPI from '@/service/exception/DiscordExceptionAPI';

export default class DiscordExceptionAPIUnknownChannel extends DiscordExceptionAPI {
    public static readonly identifier: number = 10003;
}
