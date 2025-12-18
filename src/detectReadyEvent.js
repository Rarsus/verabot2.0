// detectReadyEvent(installedVersion?) -> 'clientReady' | 'ready'
// If `installedVersion` is provided, it's used; otherwise the function
// attempts to read `discord.js/package.json` to obtain the installed
// version. If version parsing fails, default to 'clientReady' to avoid
// deprecation warnings on newer installations.
function detectReadyEvent(installedVersion) {
  let version = installedVersion;
  if (!version) {
    try {
      const djPkg = require('discord.js/package.json');
      version = djPkg && djPkg.version;
    } catch (e) {
      // If we can't read the package.json, prefer clientReady
      return 'clientReady';
    }
  }

  if (typeof version !== 'string') return 'clientReady';
  const major = parseInt(version.split('.')[0], 10);
  if (isNaN(major)) return 'clientReady';
  return major >= 15 ? 'clientReady' : 'ready';
}

module.exports = detectReadyEvent;
