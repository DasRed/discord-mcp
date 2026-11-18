import env from '@/env';
import type ConfigInterface from '@/interface/ConfigInterface';

const config: ConfigInterface = {
    discord: {
        apiURL:       env('DISCORD_MCP_DISCORD_API_URL', 'https://discord.com/api/v9'),
        dataDir:      env('DISCORD_MCP_DISCORD_DATA_DIR', './data'),
        email:        env('DISCORD_MCP_DISCORD_EMAIL', ''),
        headless:     env('DISCORD_MCP_DISCORD_HEADLESS', true),
        loginTimeout: env('DISCORD_MCP_DISCORD_LOGIN_TIMEOUT', 120000),
        password:     env('DISCORD_MCP_DISCORD_PASSWORD', ''),
        token:        env('DISCORD_MCP_DISCORD_TOKEN', ''),
        totpSecret:   env('DISCORD_MCP_DISCORD_TOTP_SECRET', ''),
    },
    mcp:     {
        authToken: env('DISCORD_MCP_AUTH_TOKEN', ''),
        path:      env('DISCORD_MCP_PATH', '/mcp'),
        readOnly:  env('DISCORD_MCP_READ_ONLY', true),
    },
    server:  {
        host:     env('DISCORD_MCP_SERVER_HOST', '0.0.0.0'),
        logLevel: env('DISCORD_MCP_SERVER_LOG_LEVEL', 'info'),
        port:     env('DISCORD_MCP_SERVER_PORT', 3000),
    },
};

export default config;
