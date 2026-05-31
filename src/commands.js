import { SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or add it to the queue.')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name, YouTube/SoundCloud link, or playlist link')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song.'),
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop music and clear the queue.'),
  new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pause the current song.'),
  new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the paused song.'),
  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Show the next songs in the queue.'),
  new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Show the song playing now.')
].map((command) => command.toJSON());
