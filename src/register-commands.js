import { REST, Routes } from 'discord.js';
import { commands } from './commands.js';
import { config } from './config.js';

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  if (config.guildId) {
    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
      body: commands
    });
    console.log('Registered guild slash commands.');
  } else {
    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commands
    });
    console.log('Registered global slash commands. Global commands can take up to an hour to appear.');
  }
} catch (error) {
  console.error('Failed to register slash commands:', error);
  process.exitCode = 1;
}
