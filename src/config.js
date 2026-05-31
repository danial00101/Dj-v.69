import 'dotenv/config';

const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
}

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID || null
};
