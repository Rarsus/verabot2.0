const Command = require('../../core/CommandBase');
const buildCommandOptions = require('../../core/CommandOptions');
const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

function pick(arr, i) {
  return arr[i % arr.length];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function generateAIPoem(subject, style = 'sonnet') {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  try {
    const prompt = `Generate a ${style} about ${subject}. Only output the poem, no explanation.`;
    // Using distilgpt2 (more reliable, smaller model) instead of gpt2 (deprecated)
    const response = await fetch('https://api-inference.huggingface.co/models/distilgpt2', {
      headers: { Authorization: `Bearer ${apiKey}` },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt, parameters: { max_length: 200, num_return_sequences: 1 } }),
      timeout: 5000,
    });

    if (!response.ok) {
      console.warn('Hugging Face API error:', response.status);
      return null;
    }

    const result = await response.json();
    if (result && Array.isArray(result) && result[0] && result[0].generated_text) {
      const poem = result[0].generated_text.replace(prompt, '').trim();
      return poem && poem.length > 10 ? poem : null;
    }
    return null;
  } catch (err) {
    console.warn('Hugging Face API unavailable:', err.message);
    return null;
  }
}

function generateHaiku(subject) {
  const s = capitalize(subject);
  const a = ['quiet', 'still', 'soft', 'gentle', 'lonely'];
  const b = ['morning', 'evening', 'midnight', 'noon', 'twilight'];
  const c = ['whispers', 'falls', 'lingers', 'wanders', 'sleeps'];
  return `${s} ${pick(a, 0)}\n${pick(b, 1)} ${pick(c, 2)}\n${s} remains`;
}

function generateSonnet(subject) {
  const s = capitalize(subject);
  const verbs = ['shines', 'lingers', 'whispers', 'wanders', 'breathes', 'sleeps'];
  const adj = ['golden', 'quiet', 'endless', 'pale', 'gentle', 'wild'];
  const nouns = ['river', 'memory', 'night', 'light', 'heart', 'dream'];
  const lines = [];
  for (let i = 0; i < 14; i++) {
    const v = pick(verbs, i);
    const a = pick(adj, i + 1);
    const n = pick(nouns, i + 2);
    lines.push(`${s} ${v} like a ${a} ${n}.`);
  }
  return lines.join('\n');
}

function generateOther(subject) {
  const s = capitalize(subject);
  return [
    `${s} drifts across the page,`,
    'a small breath of meaning,',
    'carrying moments between lines,',
    'until silence answers.',
  ].join('\n');
}

function generatePoem(type, subject) {
  subject = (subject || 'the world').trim();
  if (!subject) subject = 'the world';
  switch ((type || 'sonnet').toLowerCase()) {
    case 'haiku':
      return generateHaiku(subject);
    case 'other':
      return generateOther(subject);
    case 'sonnet':
    default:
      return generateSonnet(subject);
  }
}

// Create custom SlashCommandBuilder to support choices
const data = new SlashCommandBuilder()
  .setName('poem')
  .setDescription('Generate a short poem')
  .addStringOption((opt) => opt.setName('type').setDescription('poem type: sonnet, haiku, other').setRequired(false))
  .addStringOption((opt) => opt.setName('subject').setDescription('subject of the poem').setRequired(false));

const { options } = buildCommandOptions('poem', 'Generate a poem (sonnet, haiku, other)', [
  { name: 'type', type: 'string', description: 'poem type', required: false },
  { name: 'subject', type: 'string', description: 'subject', required: false },
]);

class PoemCommand extends Command {
  constructor() {
    super({
      name: 'poem',
      description: 'Generate a poem (sonnet, haiku, other)',
      data,
      options,
      permissions: {
        minTier: 0,
        visible: true,
      },
    });
  }

  async execute(message, args) {
    try {
      const type = args[0] || 'sonnet';
      const subject = args.slice(1).join(' ') || args[0] || 'the world';
      const poem = generatePoem(type, subject);
      if (message.channel && typeof message.channel.send === 'function') {
        await message.channel.send(`\n${poem}`);
      } else if (message.reply) {
        await message.reply(`\n${poem}`);
      }
    } catch (err) {
      console.error('Poem command error', err);
    }
  }

  async executeInteraction(interaction) {
    try {
      const type = interaction.options.getString('type') || 'sonnet';
      const subject = interaction.options.getString('subject') || 'the world';

      try {
        await interaction.deferReply();
      } catch (deferErr) {
        console.warn('Could not defer reply:', deferErr.message);
        const poem = generatePoem(type, subject);
        try {
          await interaction.reply({ content: `\n${poem}` });
        } catch (e) {
          console.error('Failed to reply:', e.message);
        }
        return;
      }

      const aiPoemPromise = generateAIPoem(subject, type);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 2000));
      const poem = await Promise.race([aiPoemPromise, timeoutPromise]);
      const finalPoem = poem || generatePoem(type, subject);

      try {
        await interaction.editReply({ content: `\n${finalPoem}` });
      } catch (editErr) {
        console.error('Could not edit reply:', editErr.message);
        try {
          await interaction.reply({ content: `\n${finalPoem}` });
        } catch (e) {
          console.error('Failed to reply after edit failure:', e.message);
        }
      }
    } catch (err) {
      console.error('Poem interaction error:', err.message);
      try {
        if (interaction.deferred) {
          await interaction.editReply({ content: 'Could not create poem.' });
        } else {
          await interaction.reply({ content: 'Could not create poem.', flags: 64 });
        }
      } catch (e) {
        console.error('Failed to send error message:', e.message);
      }
    }
  }
}

module.exports = new PoemCommand().register();
