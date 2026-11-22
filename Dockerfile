FROM node:26-trixie-slim

LABEL io.modelcontextprotocol.server.name="io.github.DasRed/discord-mcp"

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV DISCORD_MCP_SERVER_HOST=0.0.0.0
ENV DISCORD_MCP_SERVER_PORT=3000
ENV DISCORD_MCP_DISCORD_DATA_DIR=/var/www/data

WORKDIR /var/www

COPY ./package.json /var/www/package.json
COPY ./package-lock.json /var/www/package-lock.json

# only the headless shell of Chromium is needed for the login
RUN npm ci --omit=dev \
    && npx playwright install --with-deps --only-shell chromium \
    && mkdir -p /var/www/data \
    && chown -R node:node /var/www/data \
    && npm cache clean --force

COPY ./dist /var/www/dist

USER node

VOLUME /var/www/data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD node -e "fetch('http://127.0.0.1:' + process.env.DISCORD_MCP_SERVER_PORT + '/healthz').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
