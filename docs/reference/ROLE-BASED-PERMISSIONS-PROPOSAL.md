# Role-Based Permission Model - Proposal

## Overview

This proposal outlines a **fine-grained, role-based permission system** for VeraBot 2.0 that builds on your existing architecture while providing Discord role-based access control.

**Key Principles:**
- ✅ Backward compatible with existing 2-tier system (Admin + Opt-In)
- ✅ Flexible hierarchy supporting custom role definitions
- ✅ Guild-specific permission overrides
- ✅ Per-command role requirements
- ✅ Audit trail of permission checks

---

## 1. Architecture Overview

### Current System
```
User → Discord Administrator? → Allowed
            ↓ NO
       User Opted In? → Allowed
            ↓ NO
       Denied
```

### Proposed System
```
User → Has Required Roles? → Check Role Hierarchy
    ↓ NO                       ↓
Deny                    Does Role Have Permission?
                             ↓ YES
                        Check Guild Overrides
                             ↓
                        Allow/Deny
```

---

## 2. Role Hierarchy Model

### Tier-Based Approach (Recommended)

```
TIER 4: Bot Owner
├─ Full access to all commands
├─ Server administration commands
└─ Can manage role permissions

TIER 3: Guild Administrator
├─ Can run admin commands
├─ Can moderate users
├─ Can configure reminders for others
└─ Cannot access bot-wide admin commands

TIER 2: Moderator
├─ Can view quotes/reminders
├─ Can rate/tag quotes
├─ Cannot delete others' quotes
└─ Limited moderation access

TIER 1: Regular Member
├─ Can add/search quotes
├─ Can rate quotes
├─ Can view own reminders
└─ Cannot access admin features

TIER 0: Guest/Restricted
├─ Read-only access
└─ Cannot execute commands
```

### Customizable Role Mapping

Users can define custom role requirements per guild:

```javascript
{
  serverId: "123456789",
  customRoles: {
    "support": { tier: 2, permissions: ["can_ban_users", "can_view_logs"] },
    "content_creator": { tier: 1, permissions: ["can_upload_media"] },
    "restricted": { tier: 0, permissions: [] }
  }
}
```

---

## 3. Implementation Structure

### New Service: `RolePermissionService`

**Location:** `src/services/RolePermissionService.js`

**Responsibilities:**
- Define role hierarchies and permissions
- Check user permissions
- Apply guild-specific overrides
- Audit permission checks
- Filter command visibility based on role
- Cache role checks for performance

**Key Methods:**
```javascript
RolePermissionService.getUserRoles(userId, guildId)
  → Returns user's role tier(s)

RolePermissionService.hasPermission(userId, guildId, permission)
  → Boolean - can user execute this permission?

RolePermissionService.canExecuteCommand(userId, guildId, commandName)
  → Boolean - can user run this command?

RolePermissionService.getVisibleCommands(userId, guildId, allCommands)
  → Array - commands visible to this user

RolePermissionService.isCommandVisible(userId, guildId, commandName)
  → Boolean - is this command visible to user?

RolePermissionService.getRoleDescription(roleName)
  → String - human-readable role description

RolePermissionService.auditLog(userId, guildId, command, result)
  → Void - log permission check for auditing
```

### New Database Tables

```sql
-- Store role-to-tier mappings per guild
CREATE TABLE guild_role_mappings (
  id INTEGER PRIMARY KEY,
  guild_id TEXT NOT NULL,
  discord_role_id TEXT NOT NULL,
  role_tier INTEGER NOT NULL,
  custom_permissions TEXT,
  created_at DATETIME,
  UNIQUE(guild_id, discord_role_id)
);

-- Store command-level permission requirements
CREATE TABLE command_permissions (
  id INTEGER PRIMARY KEY,
  command_name TEXT UNIQUE NOT NULL,
  required_tier INTEGER DEFAULT 1,
  required_roles TEXT,
  allow_guild_override BOOLEAN DEFAULT true
);

-- Audit trail of permission checks
CREATE TABLE permission_audit_log (
  id INTEGER PRIMARY KEY,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL,
  command_name TEXT NOT NULL,
  result TEXT,
  user_tier INTEGER,
  required_tier INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. CommandBase Integration

### Updated Command Configuration

Extend `CommandBase` to support permission checking and visibility:

```javascript
class PingCommand extends Command {
  constructor() {
    super({
      name: 'ping',
      description: 'Check bot latency',
      data: pingData,
      options: {},
      // NEW: Permission and visibility requirements
      permissions: {
        minTier: 0,           // Anyone can use
        requiredRoles: [],
        allowGuildOverride: true,
        visible: true         // Show in slash command list
      }
    });
  }

  async executeInteraction(interaction) {
    // Permission check happens automatically in Command.execute()
    await interaction.reply(`Pong! ${Date.now() - interaction.createdTimestamp}ms`);
  }
}

class WhisperCommand extends Command {
  constructor() {
    super({
      name: 'whisper',
      description: 'Send DMs to users',
      data: whisperData,
      options: {},
      permissions: {
        minTier: 3,           // Admin only
        requiredRoles: ['administrator'],
        allowGuildOverride: false,
        visible: false        // HIDDEN from regular users
      }
    });
  }

  async executeInteraction(interaction) {
    // Only admins see this in slash menu
    // Others get "unknown command" or empty list
  }
}
```

### Enhanced Command.execute()

```javascript
// In CommandBase.js
async execute(message, args) {
  // NEW: Check permissions before executing
  const hasPermission = await RolePermissionService.canExecuteCommand(
    message.author.id,
    message.guildId,
    this.name
  );
  
  if (!hasPermission) {
    await sendError(message, 'You do not have permission to use this command', true);
    return;
  }

  // Audit log
  await RolePermissionService.auditLog(
    message.author.id,
    message.guildId,
    this.name,
    'ALLOWED'
  );

  // Execute command
  return await this.executeImplementation(message, args);
}
```

---

## 5. Configuration System

### Config File: `src/config/roles.js`

```javascript
module.exports = {
  // Default role tiers (applies to all guilds)
  tiers: {
    0: {
      name: 'Guest',
      description: 'Read-only access',
      permissions: ['read:quotes']
    },
    1: {
      name: 'Member',
      description: 'Standard user permissions',
      permissions: [
        'create:quotes',
        'read:quotes',
        'rate:quotes',
        'view:own_reminders'
      ]
    },
    2: {
      name: 'Moderator',
      description: 'Moderation permissions',
      permissions: [
        'create:quotes',
        'read:quotes',
        'delete:quotes',
        'rate:quotes',
        'moderate:users',
        'view:all_reminders'
      ]
    },
    3: {
      name: 'Administrator',
      description: 'Guild administration',
      permissions: [
        '*:admin_commands',
        '*:quotes',
        '*:reminders',
        '*:moderation'
      ]
    },
    4: {
      name: 'Bot Owner',
      description: 'Full bot access',
      permissions: ['*']
    }
  },

  // Command-level requirements
  commands: {
    'ping': { minTier: 0, visible: true },
    'help': { minTier: 0, visible: true },
    'add-quote': { minTier: 1, visible: true },
    'delete-quote': { minTier: 2, visible: true },
    'whisper': { minTier: 3, visible: false },  // Hidden from non-admins
    'embed-message': { minTier: 3, visible: false },  // Hidden from non-admins
    'remind': { minTier: 1, visible: true }
  },

  // Guild-specific overrides
  guildOverrides: {
    'SERVER_ID_1': {
      tiers: {
        1: {
          name: 'Contributors',
          permissions: ['*:quotes']
        }
      },
      commands: {
        'add-quote': { minTier: 0, visible: true }  // Allow guests to add quotes in this guild
      }
    }
  },

  // Command visibility rules
  visibility: {
    // 'hidden' - Never shown in slash menus
    // 'restricted' - Only shown if user has permission
    // 'public' - Always shown
    defaultMode: 'restricted',
    
    rules: {
      'ping': 'public',          // Always visible
      'help': 'public',          // Always visible
      'whisper': 'hidden',       // Never visible to non-admins
      'embed-message': 'hidden', // Never visible to non-admins
      'manage-roles': 'hidden'   // Admin-only tool
    }
  },

  // Enable/disable role checking
  enabled: true,
  auditLogging: true,
  cacheRoleChecks: true,
  cacheTTL: 3600  // 1 hour
};
```

---

## 6. Command Visibility Filtering

### Visibility Strategies

There are three approaches to control command visibility:

#### Strategy 1: Hidden Commands (Recommended)
Commands are completely hidden from the slash menu if the user doesn't have permission.

```
User sees:            /ping
                      /help
                      /add-quote
                      
Admin sees:           /ping
                      /help
                      /add-quote
                      /whisper        ← Admin-only, hidden from members
                      /embed-message  ← Admin-only, hidden from members
                      /manage-roles   ← Admin-only, hidden from members
```

**Implementation:**
```javascript
// When registering slash commands with Discord
// Filter out commands user doesn't have permission to see

const visibleCommands = await RolePermissionService
  .getVisibleCommands(userId, guildId, allCommandData);

// Send only visibleCommands to Discord API
await rest.put(Routes.applicationCommands(clientId), {
  body: visibleCommands
});
```

#### Strategy 2: Disabled Commands
Commands appear but are grayed out if user lacks permission.

```
User sees:            /ping ✓
                      /help ✓
                      /add-quote ✓
                      /whisper 🔒 (disabled)
                      /embed-message 🔒 (disabled)
```

**Pros:** Users know the command exists
**Cons:** Requires Discord Slash Command permissions system

#### Strategy 3: Smart Help Command
Help command dynamically shows only accessible commands.

```
/help                 Shows all commands user can access
/help @admin          Shows all commands (visible only to admins)
/help hidden          Shows admin-only commands (admins only)
```

### Implementation in Practice

#### Update Help Command
```javascript
class HelpCommand extends Command {
  async executeInteraction(interaction) {
    const userTier = await RolePermissionService
      .getUserRoles(interaction.user.id, interaction.guildId);
    
    // Get all visible commands for this user
    const visibleCommands = await RolePermissionService
      .getVisibleCommands(
        interaction.user.id,
        interaction.guildId,
        this.allLoadedCommands
      );
    
    // Build help embed showing only accessible commands
    const helpEmbed = this.buildHelpEmbed(visibleCommands, userTier);
    await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
  }
}
```

#### Autocomplete Filtering
```javascript
// When user types "/" - Discord requests autocomplete suggestions
// Filter based on permissions

async function autocompleteHandler(interaction) {
  const visibleCommandNames = await RolePermissionService
    .getVisibleCommandNames(
      interaction.user.id,
      interaction.guildId
    );
  
  // Return only accessible command names for autocomplete
  const focused = interaction.options.getFocused(true);
  const filtered = visibleCommandNames
    .filter(cmd => cmd.startsWith(focused.value));
  
  await interaction.respond(
    filtered.map(name => ({ name, value: name }))
  );
}
```

### Visibility Configuration Examples

**Make admin commands completely hidden:**
```javascript
commands: {
  'whisper': { minTier: 3, visible: false },     // Hidden
  'embed-message': { minTier: 3, visible: false },
  'manage-roles': { minTier: 4, visible: false }
}
```

**Show all commands but gate execution:**
```javascript
commands: {
  'whisper': { minTier: 3, visible: true },      // Visible but locked
  'embed-message': { minTier: 3, visible: true }
}
// User sees command, but gets permission denied on execution
```

**Dynamic visibility per guild:**
```javascript
guildOverrides: {
  'SERVER_ID_1': {
    commands: {
      'whisper': { minTier: 3, visible: true }   // Show in guild 1
    }
  },
  'SERVER_ID_2': {
    commands: {
      'whisper': { minTier: 3, visible: false }  // Hide in guild 2
    }
  }
}
```

---

## 7. Permission Matrix

### By Command Category

```
COMMAND CATEGORY          MIN TIER    VISIBLE    REQUIRED ROLES
────────────────────────────────────────────────────────────────
Misc (ping, help)         0           ✓ Yes      None
Quote Discovery           1           ✓ Yes      None
Quote Management (add)    1           ✓ Yes      None
Quote Management (delete) 2           ✓ Yes      Moderator+
Quote Social              1           ✓ Yes      None
Admin (whisper)           3           ✗ No       Administrator
Admin (embed)             3           ✗ No       Administrator
Reminders (user)          1           ✓ Yes      None
Reminders (manage)        3           ✗ No       Administrator
Proxy                     3           ✗ No       Administrator
Manage Roles              4           ✗ No       Bot Owner
Admin (whisper)           3           Administrator
Admin (embed)             3           Administrator
Reminders (user)          1           None
Reminders (manage)        3           Administrator
Proxy                     3           Administrator
```

---

## 7. Implementation Timeline

### Phase 1: Core Infrastructure (Week 1)
- ✓ Create `RolePermissionService`
- ✓ Design database schema
- ✓ Create migration script
- ✓ Update `CommandBase` with permission checks

### Phase 2: Configuration (Week 2)
- ✓ Create `src/config/roles.js`
- ✓ Implement role tier system
- ✓ Setup command-level permissions
- ✓ Add guild-specific override support

### Phase 3: Integration (Week 3)
- ✓ Update all 32 commands with permission metadata
- ✓ Implement audit logging
- ✓ Add caching layer
- ✓ Create admin commands for managing roles

### Phase 4: Testing & Documentation (Week 4)
- ✓ Write comprehensive tests
- ✓ Document permission model
- ✓ Create troubleshooting guide
- ✓ Migration guide from old system

---

## 8. Sample Implementation: RolePermissionService

```javascript
class RolePermissionService {
  constructor() {
    this.roleConfig = require('../config/roles');
    this.cache = new Map();
  }

  /**
   * Get user's highest role tier in a guild
   */
  async getUserRoles(userId, guildId) {
    const cacheKey = `${userId}:${guildId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.roleConfig.cacheTTL * 1000) {
        return cached.roles;
      }
    }

    // Fetch from Discord API
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    
    if (!member) return 0;

    // Get user's highest tier
    let maxTier = 0;
    for (const roleId of member.roles.cache.keys()) {
      const mapping = await DatabaseService.getRoleMapping(guildId, roleId);
      if (mapping && mapping.role_tier > maxTier) {
        maxTier = mapping.role_tier;
      }
    }

    // Check for bot owner (highest tier)
    if (process.env.BOT_OWNERS?.includes(userId)) {
      maxTier = 4;
    }

    // Cache result
    this.cache.set(cacheKey, {
      roles: maxTier,
      timestamp: Date.now()
    });

    return maxTier;
  }

  /**
   * Check if user can execute a command
   */
  async canExecuteCommand(userId, guildId, commandName) {
    if (!this.roleConfig.enabled) return true;

    const userTier = await this.getUserRoles(userId, guildId);
    const commandPerms = this.roleConfig.commands[commandName];
    
    if (!commandPerms) return true;  // No restrictions

    return userTier >= commandPerms.minTier;
  }

  /**
   * Check if a command should be visible to a user
   * Based on permission tier AND visibility settings
   */
  async isCommandVisible(userId, guildId, commandName) {
    if (!this.roleConfig.enabled) return true;

    // Check permission first
    const hasPermission = await this.canExecuteCommand(userId, guildId, commandName);
    if (!hasPermission) return false;

    // Check visibility settings
    const cmdConfig = this.roleConfig.commands[commandName];
    if (cmdConfig && cmdConfig.visible === false) {
      return false;  // Hidden command
    }

    return true;
  }

  /**
   * Get all commands visible to a user
   * Filters by both permission AND visibility
   */
  async getVisibleCommands(userId, guildId, allCommands) {
    const visible = [];
    
    for (const cmd of allCommands) {
      if (await this.isCommandVisible(userId, guildId, cmd.name)) {
        visible.push(cmd);
      }
    }

    return visible;
  }

  /**
   * Get visible command names (for autocomplete)
   */
  async getVisibleCommandNames(userId, guildId, allCommandNames) {
    const visible = [];
    
    for (const name of allCommandNames) {
      if (await this.isCommandVisible(userId, guildId, name)) {
        visible.push(name);
      }
    }

    return visible;
  }

  /**
   * Audit log permission check
   */
  async auditLog(userId, guildId, commandName, result) {
    if (!this.roleConfig.auditLogging) return;

    const userTier = await this.getUserRoles(userId, guildId);
    const commandPerms = this.roleConfig.commands[commandName] || {};

    await DatabaseService.insertAuditLog({
      user_id: userId,
      guild_id: guildId,
      command_name: commandName,
      result,
      user_tier: userTier,
      required_tier: commandPerms.minTier || 0
    });
  }
}
```

---

## 9. Admin Commands for Role Management

### `manage-roles` Command

```bash
/manage-roles set-tier <role> <tier>
/manage-roles view-permissions [role]
/manage-roles audit-log [user] [limit=50]
/manage-roles reset-to-defaults
```

**Example:**
```
/manage-roles set-tier @Moderators 2
# Sets the Moderators role to tier 2

/manage-roles view-permissions
# Shows all configured roles and their tiers

/manage-roles audit-log @User
# Shows all permission checks for that user
```

---

## 10. Advantages of This Approach

| Feature | Benefit |
|---------|---------|
| **Tier-based** | Simple to understand, easy to manage |
| **Flexible** | Supports custom role definitions per guild |
| **Backward compatible** | Existing 2-tier system still works |
| **Audit trail** | Track who tried to access what |
| **Cached** | High performance even with many roles |
| **Per-command** | Fine-grained control over each command |
| **Guild-specific** | Different servers can have different rules |
| **Extensible** | Easy to add new permissions/roles |

---

## 11. Migration Path

### Step 1: Dual System (Compatibility)
```javascript
// Both old and new systems work
if (isAdministrator(user)) return true;      // Old system
if (await userHasPermission(user)) return true;  // New system
return false;
```

### Step 2: Gradual Adoption
- Deploy new system alongside old
- Gradually update commands to use new permissions
- Monitor logs for issues

### Step 3: Complete Migration
- Update all 32 commands
- Remove old permission checks
- Deprecate legacy system

---

## 12. Recommended Next Steps

### To Proceed:
1. **Review this proposal** - Provide feedback on approach
2. **Approve database schema** - Finalize table structures
3. **Create RolePermissionService** - Core service implementation
4. **Update CommandBase** - Add permission check wrapper
5. **Create sample commands** - Demonstrate integration
6. **Write tests** - Ensure proper behavior
7. **Deploy to Docker** - Test in actual Discord server
8. **Create user documentation** - Help admins configure

---

## Questions for Clarification

1. **Audit retention:** How long should permission audit logs be retained?
2. **Role defaults:** Should moderator commands require explicit Discord roles, or use a tier system?
3. **Bot owner:** Should there be a list of user IDs with full access?
4. **Override scope:** Should guild admins be able to override ALL permissions?
5. **Per-user permissions:** Do you need to block specific users from commands (blacklist)?

---

## Conclusion

This role-based permission model provides **fine-grained control** while maintaining **simplicity** through a tier-based approach. It's **backward compatible**, **auditable**, and **performant**.

Ready to implement when you give the go-ahead! 🚀
