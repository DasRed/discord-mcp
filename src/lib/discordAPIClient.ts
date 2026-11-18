import config from '@/config';
import discordSession from '@/lib/discordSession';
import DiscordAPIClient from '@/service/DiscordAPIClient';

const discordAPIClient = new DiscordAPIClient({session: discordSession, url: config.discord.apiURL});

export default discordAPIClient;
