const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');

function pick(arr, i) {
  return arr[i % arr.length];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Generate poem using Hugging Face API
async function generateAIPoem(subject, style = 'sonnet') {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return null; // Fall back to local generators
  }

  try {
    const styleGuide = {
      haiku: 'Write a haiku (3 lines, 5-7-5 syllables)',
      sonnet: 'Write a Shakespearean sonnet (14 lines)',
      other: 'Write a free-form poem (4-6 lines)'
    };

    const prompt = `${styleGuide[style] || styleGuide.sonnet} about "${subject}". Only output the poem, nothing else.`;

    // Use mistral-7b model instead of gpt2 (which is deprecated)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        method: 'POST',
        body: JSON.stringify({ inputs: prompt, parameters: { max_length: 300, temperature: 0.7 } })
      }
    );

    if (!response.ok) {
      console.warn('Hugging Face API error:', response.status, response.statusText);
      return null;
    }

    const result = await response.json();
    if (result[0] && result[0].generated_text) {
      // Extract just the poem part (remove the prompt)
      let poem = result[0].generated_text.replace(prompt, '').trim();
      // Remove any model artifacts
      if (poem.includes('\n\n')) {
        poem = poem.split('\n\n')[0];
      }
      return poem && poem.length > 10 ? poem : null;
    }
    return null;
  } catch (err) {
    console.warn('Hugging Face API fetch error:', err.message);
    return null; // Fall back to local generators
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
  return [`${s} drifts across the page,`, 'a small breath of meaning,', 'carrying moments between lines,', 'until silence answers.'].join('\n');
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poem')
    .setDescription('Generate a short poem')
    .addStringOption(opt => opt.setName('type').setDescription('poem type: sonnet, haiku, other').setRequired(false))
    .addStringOption(opt => opt.setName('subject').setDescription('subject of the poem').setRequired(false)),
  name: 'poem',
  description: 'Generate a poem (sonnet, haiku, other)',
  options: [
    { name: 'type', type: 'string', description: 'poem type', required: false },
    { name: 'subject', type: 'string', description: 'subject', required: false }
  ],
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
  },
  async executeInteraction(interaction) {
    try {
      const type = interaction.options.getString('type') || 'sonnet';
      const subject = interaction.options.getString('subject') || 'the world';
      
      // Defer the reply to give us time to call the AI API (3-second timeout for API calls)
      await interaction.deferReply();
      
      // Try AI generation first
      let poem = await generateAIPoem(subject, type);
      
      // Fall back to local generators if AI unavailable
      if (!poem) {
        poem = generatePoem(type, subject);
      }
      
      await interaction.editReply({ content: `\n${poem}` });
    } catch (err) {
      console.error('Poem interaction error', err);
      try {
        if (interaction.deferred) {
          await interaction.editReply({ content: 'Could not create poem.' });
        } else {
          await interaction.reply({ content: 'Could not create poem.', flags: 64 });
        }
      } catch (e) { void 0; }
    }
  }
};
