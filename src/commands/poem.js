const { SlashCommandBuilder } = require('discord.js');

function pick(arr, i) {
  return arr[i % arr.length];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
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
      const poem = generatePoem(type, subject);
      await interaction.reply({ content: `\n${poem}` });
    } catch (err) {
      console.error('Poem interaction error', err);
      try { await interaction.reply({ content: 'Could not create poem.', ephemeral: true }); } catch (e) { void 0; }
    }
  }
};
