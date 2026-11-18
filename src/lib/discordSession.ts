import config from '@/config';
import DiscordSession from '@/service/DiscordSession';

const discordSession = new DiscordSession({
    dataDir:      config.discord.dataDir,
    email:        config.discord.email,
    headless:     config.discord.headless,
    loginTimeout: config.discord.loginTimeout,
    password:     config.discord.password,
    token:        config.discord.token,
    totpSecret:   config.discord.totpSecret,
});

export default discordSession;
