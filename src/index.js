import { YoutubeiExtractor } from 'discord-player-youtubei';
import { Player, QueryType } from 'discord-player';
import {
  AppleMusicExtractor,
  AttachmentExtractor,
  ReverbnationExtractor,
  SoundCloudExtractor,
  SpotifyExtractor,
  VimeoExtractor
} from '@discord-player/extractor';
import {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits
} from 'discord.js';
import { commands } from './commands.js';
import { config } from './config.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

const player = new Player(client);

await player.extractors.register(YoutubeiExtractor, {});
await player.extractors.register(SoundCloudExtractor, {});
await player.extractors.register(SpotifyExtractor, {});
await player.extractors.register(AppleMusicExtractor, {});
await player.extractors.register(VimeoExtractor, {});
await player.extractors.register(ReverbnationExtractor, {});
await player.extractors.register(AttachmentExtractor, {});

player.events.on('playerStart', (queue, track) => {
  queue.metadata.channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('Now playing')
        .setDescription(`[${track.title}](${track.url})`)
        .setThumbnail(track.thumbnail)
        .addFields({ name: 'Duration', value: track.duration || 'Unknown', inline: true })
    ]
  }).catch(console.error);
});

player.events.on('audioTrackAdd', (queue, track) => {
  queue.metadata.channel.send(`Queued: **${track.title}**`).catch(console.error);
});

player.events.on('error', (queue, error) => {
  console.error(`Queue error in ${queue.guild.name}:`, error);
  queue.metadata.channel.send('Something went wrong while playing that track.').catch(console.error);
});

player.events.on('playerError', (queue, error) => {
  console.error(`Player error in ${queue.guild.name}:`, error);
  queue.metadata.channel.send('The player hit an audio error. Try another link or search term.').catch(console.error);
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  console.log(`Loaded ${commands.length} slash commands. Run "npm run register" if commands are missing.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === 'play') {
      await handlePlay(interaction);
      return;
    }

    if (interaction.commandName === 'skip') {
      await handleSkip(interaction);
      return;
    }

    if (interaction.commandName === 'stop') {
      await handleStop(interaction);
      return;
    }

    if (interaction.commandName === 'pause') {
      await handlePause(interaction);
      return;
    }

    if (interaction.commandName === 'resume') {
      await handleResume(interaction);
      return;
    }

    if (interaction.commandName === 'queue') {
      await handleQueue(interaction);
      return;
    }

    if (interaction.commandName === 'nowplaying') {
      await handleNowPlaying(interaction);
    }
  } catch (error) {
    console.error(error);
    const message = 'I could not complete that command.';
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  }
});

async function handlePlay(interaction) {
  const voiceChannel = interaction.member?.voice?.channel;

  if (!voiceChannel) {
    await interaction.reply({ content: 'Join a voice channel first, then use `/play`.', ephemeral: true });
    return;
  }

  const query = interaction.options.getString('query', true);
  await interaction.deferReply();

  const result = await player.play(voiceChannel, query, {
    nodeOptions: {
      metadata: {
        channel: interaction.channel,
        requestedBy: interaction.user
      },
      leaveOnEmpty: true,
      leaveOnEmptyCooldown: 120000,
      leaveOnEnd: true,
      leaveOnEndCooldown: 60000,
      leaveOnStop: true,
      selfDeaf: true
    },
    requestedBy: interaction.user,
    searchEngine: QueryType.AUTO
  });

  await interaction.editReply(`Added **${result.track.title}** to the queue.`);
}

async function handleSkip(interaction) {
  const queue = getQueue(interaction);
  if (!queue?.currentTrack) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  queue.node.skip();
  await interaction.reply('Skipped the current song.');
}

async function handleStop(interaction) {
  const queue = getQueue(interaction);
  if (!queue) {
    await interaction.reply({ content: 'There is no active queue.', ephemeral: true });
    return;
  }

  queue.delete();
  await interaction.reply('Stopped playback and cleared the queue.');
}

async function handlePause(interaction) {
  const queue = getQueue(interaction);
  if (!queue?.currentTrack) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  queue.node.setPaused(true);
  await interaction.reply('Paused.');
}

async function handleResume(interaction) {
  const queue = getQueue(interaction);
  if (!queue?.currentTrack) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  queue.node.setPaused(false);
  await interaction.reply('Resumed.');
}

async function handleQueue(interaction) {
  const queue = getQueue(interaction);
  if (!queue?.currentTrack) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  const upcoming = queue.tracks.toArray().slice(0, 10);
  const description = upcoming.length
    ? upcoming.map((track, index) => `${index + 1}. ${track.title}`).join('\n')
    : 'No songs waiting.';

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('Queue')
        .setDescription(description)
        .addFields({ name: 'Now playing', value: queue.currentTrack.title })
    ]
  });
}

async function handleNowPlaying(interaction) {
  const queue = getQueue(interaction);
  if (!queue?.currentTrack) {
    await interaction.reply({ content: 'Nothing is playing right now.', ephemeral: true });
    return;
  }

  const track = queue.currentTrack;
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('Now playing')
        .setDescription(`[${track.title}](${track.url})`)
        .setThumbnail(track.thumbnail)
        .addFields(
          { name: 'Duration', value: track.duration || 'Unknown', inline: true },
          { name: 'Requested by', value: track.requestedBy?.toString() || 'Unknown', inline: true }
        )
    ]
  });
}

function getQueue(interaction) {
  return player.nodes.get(interaction.guildId);
}

client.login(config.token);
