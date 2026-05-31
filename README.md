# Discord Music Bot

A slash-command Discord music bot built with `discord.js`, `discord-player`, and official extractors.

## Features

- `/play` searches or plays links
- `/skip`
- `/stop`
- `/pause`
- `/resume`
- `/queue`
- `/nowplaying`
- Leaves voice automatically when the queue ends or everyone leaves

## Setup

1. Install Node.js 20 or newer.
2. Create a Discord application at <https://discord.com/developers/applications>.
3. Open **Bot**, create a bot, then copy the token.
4. Open **OAuth2 > URL Generator** and select:
   - Scopes: `bot`, `applications.commands`
   - Bot permissions: `Connect`, `Speak`, `Send Messages`, `Use Slash Commands`, `Embed Links`
5. Invite the bot to your server with the generated URL.
6. Copy `.env.example` to `.env` and fill in:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_discord_application_client_id_here
GUILD_ID=your_test_server_id_here
```

`GUILD_ID` is recommended while testing because guild slash commands update almost instantly. If you remove it, commands are global and can take up to an hour to appear.

## Run Locally

```bash
npm install
npm run register
npm start
```

On Windows PowerShell, if `npm` is blocked by execution policy, use:

```powershell
npm.cmd install
npm.cmd run register
npm.cmd start
```

## Host It

I cannot host a 24/7 bot directly from this chat, but this project is ready for common hosts.

### Railway

1. Push this folder to GitHub.
2. Create a Railway project from the repo.
3. Add variables:
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - `GUILD_ID` if using guild commands
4. Set the start command to:

```bash
npm start
```

5. Run the command registration once from Railway's shell:

```bash
npm run register
```

### VPS

```bash
npm install
npm run register
npm install -g pm2
pm2 start src/index.js --name discord-music-bot
pm2 save
```

## Notes

- Never share your bot token. If you leak it, reset it in the Discord Developer Portal.
- YouTube support depends on extractor behavior and can change over time. SoundCloud and direct supported sources are usually more stable.
- Keep the bot in servers where you have permission to stream audio.
