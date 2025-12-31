/**
 * Resolution Helpers
 * Utilities for resolving names/mentions to IDs for channels, users, and roles
 */

/**
 * Resolve a channel identifier to a Channel object
 * Accepts: channel ID, channel name, or mention (#channel-name)
 * @param {string} input - Channel ID, name, or mention
 * @param {Guild} guild - Discord Guild object
 * @returns {Promise<Channel|null>} - Resolved channel or null
 */
async function resolveChannel(input, guild) {
  if (!input || !guild) return null;

  const trimmedInput = input.trim();

  // Try as ID first (fastest)
  if (/^\d+$/.test(trimmedInput)) {
    try {
      const channel = await guild.client.channels.fetch(trimmedInput);
      if (channel && channel.guild?.id === guild.id) {
        return channel;
      }
    } catch {
      // ID not found, continue to name search
    }
  }

  // Try as mention (#channel-name)
  const mentionMatch = trimmedInput.match(/^<#(\d+)>$/);
  if (mentionMatch) {
    try {
      const channel = await guild.channels.fetch(mentionMatch[1]);
      return channel;
    } catch {
      return null;
    }
  }

  // Try as channel name
  const cleanName = trimmedInput.replace(/^#/, '').toLowerCase();
  const foundChannel = guild.channels.cache.find(
    channel => channel.name?.toLowerCase() === cleanName && channel.isTextBased?.()
  );

  if (foundChannel) return foundChannel;

  // Try fuzzy match (partial name)
  const fuzzyMatches = guild.channels.cache.filter(
    channel => 
      channel.name?.toLowerCase().includes(cleanName) && 
      channel.isTextBased?.()
  );

  if (fuzzyMatches.size === 1) {
    return fuzzyMatches.first();
  }

  return null;
}

/**
 * Resolve a user identifier to a User object
 * Accepts: user ID, username, or mention (@username)
 * @param {string} input - User ID, username, or mention
 * @param {Client} client - Discord Client
 * @returns {Promise<User|null>} - Resolved user or null
 */
async function resolveUser(input, client) {
  if (!input || !client) return null;

  const trimmedInput = input.trim();

  // Try as ID first (fastest)
  if (/^\d+$/.test(trimmedInput)) {
    try {
      return await client.users.fetch(trimmedInput);
    } catch {
      // ID not found, continue to search
    }
  }

  // Try as mention (@username or <@ID>)
  const mentionMatch = trimmedInput.match(/^<@!?(\d+)>$/);
  if (mentionMatch) {
    try {
      return await client.users.fetch(mentionMatch[1]);
    } catch {
      return null;
    }
  }

  // Try as username from cached users
  const cleanName = trimmedInput.replace(/^@/, '').toLowerCase();
  const foundUser = client.users.cache.find(
    user => 
      user.username?.toLowerCase() === cleanName ||
      user.globalName?.toLowerCase() === cleanName
  );

  if (foundUser) return foundUser;

  // Try fuzzy match in cache
  const fuzzyMatches = client.users.cache.filter(
    user =>
      user.username?.toLowerCase().includes(cleanName) ||
      user.globalName?.toLowerCase().includes(cleanName)
  );

  if (fuzzyMatches.size === 1) {
    return fuzzyMatches.first();
  }

  return null;
}

/**
 * Resolve a role identifier to a Role object
 * Accepts: role ID, role name, or mention (@role)
 * @param {string} input - Role ID, name, or mention
 * @param {Guild} guild - Discord Guild object
 * @returns {Promise<Role|null>} - Resolved role or null
 */
async function resolveRole(input, guild) {
  if (!input || !guild) return null;

  const trimmedInput = input.trim();

  // Try as ID first (fastest)
  if (/^\d+$/.test(trimmedInput)) {
    try {
      return await guild.roles.fetch(trimmedInput);
    } catch {
      // ID not found, continue to name search
    }
  }

  // Try as mention (<@&ID>)
  const mentionMatch = trimmedInput.match(/^<@&(\d+)>$/);
  if (mentionMatch) {
    try {
      return await guild.roles.fetch(mentionMatch[1]);
    } catch {
      return null;
    }
  }

  // Try as role name
  const cleanName = trimmedInput.replace(/^@/, '').toLowerCase();
  const foundRole = guild.roles.cache.find(
    role => role.name?.toLowerCase() === cleanName
  );

  if (foundRole) return foundRole;

  // Try fuzzy match (partial name)
  const fuzzyMatches = guild.roles.cache.filter(
    role => role.name?.toLowerCase().includes(cleanName)
  );

  if (fuzzyMatches.size === 1) {
    return fuzzyMatches.first();
  }

  return null;
}

/**
 * Resolve multiple channel identifiers at once
 * @param {string[]} inputs - Array of channel identifiers
 * @param {Guild} guild - Discord Guild object
 * @returns {Promise<Object>} - {resolved: Channel[], failed: string[]}
 */
async function resolveChannels(inputs, guild) {
  const results = {
    resolved: [],
    failed: []
  };

  for (const input of inputs) {
    const channel = await resolveChannel(input, guild);
    if (channel) {
      results.resolved.push(channel);
    } else {
      results.failed.push(input);
    }
  }

  return results;
}

/**
 * Resolve multiple user identifiers at once
 * @param {string[]} inputs - Array of user identifiers
 * @param {Client} client - Discord Client
 * @returns {Promise<Object>} - {resolved: User[], failed: string[]}
 */
async function resolveUsers(inputs, client) {
  const results = {
    resolved: [],
    failed: []
  };

  for (const input of inputs) {
    const user = await resolveUser(input, client);
    if (user) {
      results.resolved.push(user);
    } else {
      results.failed.push(input);
    }
  }

  return results;
}

/**
 * Resolve multiple role identifiers at once
 * @param {string[]} inputs - Array of role identifiers
 * @param {Guild} guild - Discord Guild object
 * @returns {Promise<Object>} - {resolved: Role[], failed: string[]}
 */
async function resolveRoles(inputs, guild) {
  const results = {
    resolved: [],
    failed: []
  };

  for (const input of inputs) {
    const role = await resolveRole(input, guild);
    if (role) {
      results.resolved.push(role);
    } else {
      results.failed.push(input);
    }
  }

  return results;
}

module.exports = {
  resolveChannel,
  resolveUser,
  resolveRole,
  resolveChannels,
  resolveUsers,
  resolveRoles
};
