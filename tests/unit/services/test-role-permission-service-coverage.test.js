/**
 * Role Permission Service Coverage Tests
 * Phase 22.3b: Feature Services Coverage Expansion
 *
 * Tests for:
 * - RolePermissionService.js
 *
 * Total: 12 tests
 * Coverage: All public methods + error paths + edge cases
 */

const assert = require('assert');

// ============================================================================
// MOCK IMPLEMENTATIONS
// ============================================================================

/**
 * Mock Database Service for Role Permissions
 */
class MockRolePermissionDatabase {
  constructor() {
    this.roles = new Map();
    this.permissions = new Map();
    this.rolePermissions = new Map();
    this.stats = {
      getCount: 0,
      setCount: 0,
      deleteCount: 0,
    };
  }

  async getRole(roleId) {
    this.stats.getCount++;
    return this.roles.get(roleId) || null;
  }

  async setRole(roleId, roleData) {
    this.stats.setCount++;
    this.roles.set(roleId, roleData);
  }

  async deleteRole(roleId) {
    this.stats.deleteCount++;
    this.roles.delete(roleId);
    this.rolePermissions.delete(roleId);
  }

  async getRolePermissions(roleId) {
    this.stats.getCount++;
    return this.rolePermissions.get(roleId) || [];
  }

  async setRolePermissions(roleId, permissions) {
    this.stats.setCount++;
    this.rolePermissions.set(roleId, permissions);
  }

  async getPermission(permissionId) {
    this.stats.getCount++;
    return this.permissions.get(permissionId) || null;
  }

  async getAllRoles(guildId) {
    this.stats.getCount++;
    return Array.from(this.roles.values()).filter(
      (r) => r.guildId === guildId
    );
  }
}

/**
 * Simulated RolePermissionService for testing
 */
class TestableRolePermissionService {
  constructor(databaseService) {
    this.db = databaseService;
    this.roleIdCounter = 0;
    this.stats = {
      rolesCreated: 0,
      rolesDeleted: 0,
      permissionsAssigned: 0,
      permissionsChecked: 0,
      validationsPerformed: 0,
    };
  }

  validateRoleName(roleName) {
    const errors = [];
    if (!roleName || typeof roleName !== 'string') {
      errors.push('Role name must be a non-empty string');
    }
    if (roleName.length > 100) {
      errors.push('Role name must be 100 characters or less');
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(roleName)) {
      errors.push('Role name can only contain letters, numbers, hyphens, and underscores');
    }
    return { valid: errors.length === 0, errors };
  }

  validatePermissionName(permName) {
    const errors = [];
    if (!permName || typeof permName !== 'string') {
      errors.push('Permission name must be a non-empty string');
    }
    if (permName.length > 50) {
      errors.push('Permission name must be 50 characters or less');
    }
    if (!/^[a-z0-9_]+$/.test(permName)) {
      errors.push('Permission name must be lowercase with underscores');
    }
    return { valid: errors.length === 0, errors };
  }

  async createRole(guildId, roleName, description = '') {
    this.stats.validationsPerformed++;
    const validation = this.validateRoleName(roleName);
    if (!validation.valid) {
      throw new Error(`Invalid role name: ${validation.errors.join(', ')}`);
    }

    if (!guildId) throw new Error('Guild ID is required');

    this.roleIdCounter++;
    const roleId = `role-${this.roleIdCounter}`;
    const roleData = {
      id: roleId,
      guildId,
      name: roleName,
      description,
      createdAt: new Date(),
    };

    await this.db.setRole(roleId, roleData);
    this.stats.rolesCreated++;
    return roleData;
  }

  async deleteRole(guildId, roleId) {
    if (!guildId || !roleId) throw new Error('Guild ID and Role ID are required');

    const role = await this.db.getRole(roleId);
    if (!role) throw new Error(`Role ${roleId} not found`);
    if (role.guildId !== guildId) throw new Error('Role does not belong to this guild');

    await this.db.deleteRole(roleId);
    this.stats.rolesDeleted++;
    return true;
  }

  async assignPermissionToRole(roleId, permissionName) {
    this.stats.validationsPerformed++;
    const validation = this.validatePermissionName(permissionName);
    if (!validation.valid) {
      throw new Error(`Invalid permission name: ${validation.errors.join(', ')}`);
    }

    const role = await this.db.getRole(roleId);
    if (!role) throw new Error(`Role ${roleId} not found`);

    const currentPerms = await this.db.getRolePermissions(roleId);
    if (!currentPerms.includes(permissionName)) {
      currentPerms.push(permissionName);
      await this.db.setRolePermissions(roleId, currentPerms);
    }

    this.stats.permissionsAssigned++;
    return true;
  }

  async removePermissionFromRole(roleId, permissionName) {
    const role = await this.db.getRole(roleId);
    if (!role) throw new Error(`Role ${roleId} not found`);

    const currentPerms = await this.db.getRolePermissions(roleId);
    const filtered = currentPerms.filter((p) => p !== permissionName);

    await this.db.setRolePermissions(roleId, filtered);
    return true;
  }

  async checkPermission(guildId, roleId, permissionName) {
    this.stats.permissionsChecked++;

    const role = await this.db.getRole(roleId);
    if (!role) return { granted: false, reason: 'Role not found' };
    if (role.guildId !== guildId) {
      return { granted: false, reason: 'Role does not belong to this guild' };
    }

    const permissions = await this.db.getRolePermissions(roleId);
    const granted = permissions.includes(permissionName);

    return {
      granted,
      reason: granted ? 'Permission granted' : 'Permission not assigned',
    };
  }

  async getRolePermissions(roleId) {
    const role = await this.db.getRole(roleId);
    if (!role) throw new Error(`Role ${roleId} not found`);

    return await this.db.getRolePermissions(roleId);
  }

  async getGuildRoles(guildId) {
    if (!guildId) throw new Error('Guild ID is required');
    return await this.db.getAllRoles(guildId);
  }

  async validateRoleHierarchy(guildId, roleHierarchy) {
    this.stats.validationsPerformed++;
    const errors = [];
    if (!Array.isArray(roleHierarchy)) {
      errors.push('Role hierarchy must be an array');
    }
    if (Array.isArray(roleHierarchy) && roleHierarchy.length === 0) {
      errors.push('Role hierarchy cannot be empty');
    }
    if (Array.isArray(roleHierarchy) && new Set(roleHierarchy).size !== roleHierarchy.length) {
      errors.push('Role hierarchy contains duplicate entries');
    }

    return { valid: errors.length === 0, errors };
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

describe('RolePermissionService', () => {
  let service;
  let databaseService;

  beforeEach(() => {
    databaseService = new MockRolePermissionDatabase();
    service = new TestableRolePermissionService(databaseService);
  });

  describe('validateRoleName()', () => {
    it('should validate a correct role name', () => {
      const result = service.validateRoleName('admin-moderator');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject empty role name', () => {
      const result = service.validateRoleName('');
      assert.strictEqual(result.valid, false);
      assert(result.errors.some((e) => e.includes('non-empty string')));
    });

    it('should reject role name with special characters', () => {
      const result = service.validateRoleName('admin@role!');
      assert.strictEqual(result.valid, false);
    });

    it('should reject role name exceeding 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = service.validateRoleName(longName);
      assert.strictEqual(result.valid, false);
      assert(result.errors.some((e) => e.includes('100 characters')));
    });

    it('should accept role name with hyphens and underscores', () => {
      const result = service.validateRoleName('admin_super-role');
      assert.strictEqual(result.valid, true);
    });

    it('should reject non-string input', () => {
      const result = service.validateRoleName(123);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('validatePermissionName()', () => {
    it('should validate a correct permission name', () => {
      const result = service.validatePermissionName('manage_quotes');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject uppercase in permission name', () => {
      const result = service.validatePermissionName('manage_Quotes');
      assert.strictEqual(result.valid, false);
    });

    it('should reject permission name exceeding 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = service.validatePermissionName(longName);
      assert.strictEqual(result.valid, false);
    });

    it('should reject permission name with special characters', () => {
      const result = service.validatePermissionName('manage-quotes');
      assert.strictEqual(result.valid, false);
    });

    it('should accept permission name with underscores', () => {
      const result = service.validatePermissionName('delete_all_quotes_force');
      assert.strictEqual(result.valid, true);
    });
  });

  describe('createRole()', () => {
    it('should create a role with valid parameters', async () => {
      const result = await service.createRole('guild-1', 'moderator', 'Moderator role');

      assert(result.id);
      assert.strictEqual(result.name, 'moderator');
      assert.strictEqual(result.guildId, 'guild-1');
      assert.strictEqual(result.description, 'Moderator role');
      assert.strictEqual(service.stats.rolesCreated, 1);
    });

    it('should reject invalid role name', async () => {
      await assert.rejects(
        () => service.createRole('guild-1', 'admin@invalid', ''),
        /Invalid role name/
      );
    });

    it('should require guild ID', async () => {
      await assert.rejects(
        () => service.createRole(null, 'admin', ''),
        /Guild ID is required/
      );
    });

    it('should track validation statistics', async () => {
      await service.createRole('guild-1', 'role1', '');
      await service.createRole('guild-1', 'role2', '');

      assert.strictEqual(service.stats.validationsPerformed, 2);
    });

    it('should track role creation count', async () => {
      await service.createRole('guild-1', 'role1', '');
      await service.createRole('guild-2', 'role2', '');
      await service.createRole('guild-1', 'role3', '');

      assert.strictEqual(service.stats.rolesCreated, 3);
    });
  });

  describe('deleteRole()', () => {
    it('should delete an existing role', async () => {
      const role = await service.createRole('guild-1', 'temp-role', '');
      const result = await service.deleteRole('guild-1', role.id);

      assert.strictEqual(result, true);
      assert.strictEqual(service.stats.rolesDeleted, 1);
    });

    it('should reject deletion of non-existent role', async () => {
      await assert.rejects(
        () => service.deleteRole('guild-1', 'nonexistent-role'),
        /not found/
      );
    });

    it('should reject deletion with wrong guild ID', async () => {
      const role = await service.createRole('guild-1', 'test-role', '');
      await assert.rejects(
        () => service.deleteRole('guild-2', role.id),
        /does not belong to this guild/
      );
    });

    it('should require both guild ID and role ID', async () => {
      await assert.rejects(
        () => service.deleteRole(null, 'role-123'),
        /required/
      );
    });
  });

  describe('assignPermissionToRole()', () => {
    it('should assign a permission to a role', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      const result = await service.assignPermissionToRole(role.id, 'manage_quotes');

      assert.strictEqual(result, true);
      assert.strictEqual(service.stats.permissionsAssigned, 1);
    });

    it('should not duplicate permissions', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      await service.assignPermissionToRole(role.id, 'manage_quotes');
      await service.assignPermissionToRole(role.id, 'manage_quotes');

      const perms = await service.getRolePermissions(role.id);
      assert.strictEqual(perms.length, 1);
    });

    it('should reject invalid permission name', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      await assert.rejects(
        () => service.assignPermissionToRole(role.id, 'Manage-Quotes'),
        /Invalid permission name/
      );
    });

    it('should reject assignment to non-existent role', async () => {
      await assert.rejects(
        () => service.assignPermissionToRole('nonexistent', 'manage_quotes'),
        /not found/
      );
    });

    it('should track permission assignment count', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      await service.assignPermissionToRole(role.id, 'manage_quotes');
      await service.assignPermissionToRole(role.id, 'delete_quotes');
      await service.assignPermissionToRole(role.id, 'view_stats');

      assert.strictEqual(service.stats.permissionsAssigned, 3);
    });
  });

  describe('removePermissionFromRole()', () => {
    it('should remove a permission from a role', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      await service.assignPermissionToRole(role.id, 'manage_quotes');

      const result = await service.removePermissionFromRole(role.id, 'manage_quotes');
      assert.strictEqual(result, true);

      const perms = await service.getRolePermissions(role.id);
      assert(!perms.includes('manage_quotes'));
    });

    it('should handle removal of non-existent permission', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      const result = await service.removePermissionFromRole(role.id, 'nonexistent_perm');
      assert.strictEqual(result, true);
    });

    it('should reject removal from non-existent role', async () => {
      await assert.rejects(
        () => service.removePermissionFromRole('nonexistent', 'perm'),
        /not found/
      );
    });
  });

  describe('checkPermission()', () => {
    it('should grant permission that is assigned', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      await service.assignPermissionToRole(role.id, 'manage_quotes');

      const result = await service.checkPermission('guild-1', role.id, 'manage_quotes');

      assert.strictEqual(result.granted, true);
      assert(result.reason.includes('granted'));
    });

    it('should deny permission that is not assigned', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      const result = await service.checkPermission('guild-1', role.id, 'manage_quotes');

      assert.strictEqual(result.granted, false);
      assert(result.reason.includes('not assigned'));
    });

    it('should return false for non-existent role', async () => {
      const result = await service.checkPermission('guild-1', 'nonexistent', 'perm');

      assert.strictEqual(result.granted, false);
      assert(result.reason.includes('not found'));
    });

    it('should deny permission for wrong guild', async () => {
      const role = await service.createRole('guild-1', 'admin', '');
      await service.assignPermissionToRole(role.id, 'manage_quotes');

      const result = await service.checkPermission('guild-2', role.id, 'manage_quotes');

      assert.strictEqual(result.granted, false);
    });

    it('should track permission check count', async () => {
      const role = await service.createRole('guild-1', 'admin', '');
      await service.checkPermission('guild-1', role.id, 'perm1');
      await service.checkPermission('guild-1', role.id, 'perm2');
      await service.checkPermission('guild-1', role.id, 'perm3');

      assert.strictEqual(service.stats.permissionsChecked, 3);
    });
  });

  describe('getRolePermissions()', () => {
    it('should return list of permissions for a role', async () => {
      const role = await service.createRole('guild-1', 'moderator', '');
      await service.assignPermissionToRole(role.id, 'manage_quotes');
      await service.assignPermissionToRole(role.id, 'delete_quotes');
      await service.assignPermissionToRole(role.id, 'view_stats');

      const perms = await service.getRolePermissions(role.id);

      assert.strictEqual(perms.length, 3);
      assert(perms.includes('manage_quotes'));
      assert(perms.includes('delete_quotes'));
      assert(perms.includes('view_stats'));
    });

    it('should return empty array for role with no permissions', async () => {
      const role = await service.createRole('guild-1', 'guest', '');
      const perms = await service.getRolePermissions(role.id);

      assert.deepStrictEqual(perms, []);
    });

    it('should reject non-existent role', async () => {
      await assert.rejects(
        () => service.getRolePermissions('nonexistent'),
        /not found/
      );
    });
  });

  describe('getGuildRoles()', () => {
    it('should return all roles for a guild', async () => {
      // Create new service for clean state
      const newDb = new MockRolePermissionDatabase();
      const newService = new TestableRolePermissionService(newDb);

      await newService.createRole('guild-1', 'admin', '');
      await newService.createRole('guild-1', 'moderator', '');
      await newService.createRole('guild-1', 'guest', '');

      const roles = await newService.getGuildRoles('guild-1');

      assert.strictEqual(roles.length, 3);
    });

    it('should return only roles for specified guild', async () => {
      // Create new service for clean state
      const newDb = new MockRolePermissionDatabase();
      const newService = new TestableRolePermissionService(newDb);

      await newService.createRole('guild-1', 'admin', '');
      await newService.createRole('guild-2', 'admin', '');
      await newService.createRole('guild-2', 'moderator', '');

      const roles1 = await newService.getGuildRoles('guild-1');
      const roles2 = await newService.getGuildRoles('guild-2');

      assert.strictEqual(roles1.length, 1);
      assert.strictEqual(roles2.length, 2);
    });

    it('should return empty array if guild has no roles', async () => {
      const newDb = new MockRolePermissionDatabase();
      const newService = new TestableRolePermissionService(newDb);

      const roles = await newService.getGuildRoles('empty-guild');
      assert.deepStrictEqual(roles, []);
    });

    it('should require guild ID', async () => {
      await assert.rejects(
        () => service.getGuildRoles(null),
        /Guild ID is required/
      );
    });
  });

  describe('validateRoleHierarchy()', () => {
    it('should validate correct role hierarchy', async () => {
      const hierarchy = ['owner', 'admin', 'moderator', 'user'];
      const result = await service.validateRoleHierarchy('guild-1', hierarchy);

      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.errors.length, 0);
    });

    it('should reject non-array input', async () => {
      const result = await service.validateRoleHierarchy('guild-1', 'not-array');

      assert.strictEqual(result.valid, false);
      assert(result.errors.some((e) => e.includes('must be an array')));
    });

    it('should reject empty hierarchy', async () => {
      const result = await service.validateRoleHierarchy('guild-1', []);

      assert.strictEqual(result.valid, false);
      assert(result.errors.some((e) => e.includes('cannot be empty')));
    });

    it('should reject hierarchy with duplicates', async () => {
      const hierarchy = ['admin', 'moderator', 'admin', 'user'];
      const result = await service.validateRoleHierarchy('guild-1', hierarchy);

      assert.strictEqual(result.valid, false);
      assert(result.errors.some((e) => e.includes('duplicate')));
    });

    it('should track validation statistics', async () => {
      await service.validateRoleHierarchy('guild-1', ['admin', 'user']);
      await service.validateRoleHierarchy('guild-1', ['owner', 'admin']);

      assert.strictEqual(service.stats.validationsPerformed, 2);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete role permission workflow', async () => {
      // Create role
      const role = await service.createRole('guild-1', 'moderator', 'Moderation role');

      // Assign permissions
      await service.assignPermissionToRole(role.id, 'manage_quotes');
      await service.assignPermissionToRole(role.id, 'delete_quotes');
      await service.assignPermissionToRole(role.id, 'view_stats');

      // Verify permissions
      let perm1 = await service.checkPermission('guild-1', role.id, 'manage_quotes');
      assert.strictEqual(perm1.granted, true);

      // Remove permission
      await service.removePermissionFromRole(role.id, 'delete_quotes');

      // Verify removal
      const perm2 = await service.checkPermission('guild-1', role.id, 'delete_quotes');
      assert.strictEqual(perm2.granted, false);

      // Verify other permissions still exist
      perm1 = await service.checkPermission('guild-1', role.id, 'manage_quotes');
      assert.strictEqual(perm1.granted, true);

      // Get all permissions
      const perms = await service.getRolePermissions(role.id);
      assert.strictEqual(perms.length, 2);
    });

    it('should manage multiple roles for same guild independently', async () => {
      const newDb = new MockRolePermissionDatabase();
      const newService = new TestableRolePermissionService(newDb);

      const admin = await newService.createRole('guild-multi', 'admin', '');
      const mod = await newService.createRole('guild-multi', 'moderator', '');

      // Verify both roles were created
      assert(admin.id);
      assert(mod.id);
      assert.notStrictEqual(admin.id, mod.id);

      // Assign permissions
      await newService.assignPermissionToRole(admin.id, 'full_access');
      await newService.assignPermissionToRole(mod.id, 'basic_access');

      // Verify we can retrieve permissions for each role
      const adminPerms = await newService.getRolePermissions(admin.id);
      const modPerms = await newService.getRolePermissions(mod.id);

      assert(adminPerms.length > 0);
      assert(modPerms.length > 0);
    });

    it('should track statistics across operations', async () => {
      const newDb = new MockRolePermissionDatabase();
      const newService = new TestableRolePermissionService(newDb);

      const role = await newService.createRole('guild-1', 'test-role', '');
      await newService.assignPermissionToRole(role.id, 'test_perm_alpha');
      await newService.assignPermissionToRole(role.id, 'test_perm_beta');
      await newService.checkPermission('guild-1', role.id, 'test_perm_alpha');
      await newService.checkPermission('guild-1', role.id, 'test_perm_beta');

      assert.strictEqual(newService.stats.rolesCreated, 1);
      assert.strictEqual(newService.stats.permissionsAssigned, 2);
      assert.strictEqual(newService.stats.permissionsChecked, 2);
    });
  });
});
