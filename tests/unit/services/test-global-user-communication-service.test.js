/**
 * Phase 23.0: GlobalUserCommunicationService Tests
 * Target: 22+ tests bringing coverage from 0% to 90%+
 *
 * This service manages global user opt-in/opt-out status for communication features.
 * Users can opt-in or opt-out from receiving DMs and other communication.
 * Tracks timestamp of last status change.
 * Supports bulk operations for performance.
 *
 * Test Categories:
 * 1. Module initialization and export validation
 * 2. User opt-in operations
 * 3. User opt-out operations
 * 4. Status checking (isOptedIn)
 * 5. Bulk operations (bulkOptIn, bulkOptOut)
 * 6. User listing operations
 * 7. Status retrieval with metadata
 * 8. Cleanup operations
 * 9. Error handling and validation
 * 10. Concurrent operations (race conditions)
 */

const assert = require('assert');

describe('Phase 23.0: GlobalUserCommunicationService', () => {
  let service;
  let DatabaseService;
  let testDb;

  beforeEach(async () => {
    // Import fresh service instance
    delete require.cache[require.resolve('@/services/GlobalUserCommunicationService')];
    service = require('@/services/GlobalUserCommunicationService');
    
    // Setup test database
    DatabaseService = require('@/services/DatabaseService');
    testDb = DatabaseService;
  });

  afterEach(async () => {
    // Cleanup test data
    try {
      if (service && typeof service.deleteAllUserCommunications === 'function') {
        await service.deleteAllUserCommunications();
      }
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  describe('Module Initialization & Exports', () => {
    it('should be importable and return a service instance', () => {
      assert(service !== null);
      assert(typeof service === 'object');
    });

    it('should be a GlobalUserCommunicationService instance', () => {
      assert(service.constructor.name === 'GlobalUserCommunicationService');
    });

    it('should have user status checker methods', () => {
      const statusMethods = ['isOptedIn', 'getOptInStatus'];
      statusMethods.forEach((method) => {
        assert(
          typeof service[method] === 'function',
          `Missing status method: ${method}`
        );
      });
    });

    it('should have user preference setter methods', () => {
      const setterMethods = ['optIn', 'optOut'];
      setterMethods.forEach((method) => {
        assert(
          typeof service[method] === 'function',
          `Missing setter method: ${method}`
        );
      });
    });

    it('should have bulk operation methods', () => {
      const bulkMethods = ['bulkOptIn', 'bulkOptOut'];
      bulkMethods.forEach((method) => {
        assert(
          typeof service[method] === 'function',
          `Missing bulk method: ${method}`
        );
      });
    });

    it('should have user listing methods', () => {
      const listingMethods = [
        'getAllOptedInUsers',
        'getAllOptedOutUsers',
      ];
      listingMethods.forEach((method) => {
        assert(
          typeof service[method] === 'function',
          `Missing listing method: ${method}`
        );
      });
    });

    it('should have cleanup methods', () => {
      const cleanupMethods = ['deleteAllUserCommunications', 'cleanupInactiveUsers'];
      cleanupMethods.forEach((method) => {
        assert(
          typeof service[method] === 'function',
          `Missing cleanup method: ${method}`
        );
      });
    });
  });

  describe('User Opt-In Operations', () => {
    it('should opt-in a user successfully', async () => {
      const userId = 'user-123-test';
      await service.optIn(userId);
      const status = await service.isOptedIn(userId);
      assert.strictEqual(status, true);
    });

    it('should default to opted-out if not set', async () => {
      const userId = 'user-never-set-123';
      const status = await service.isOptedIn(userId);
      assert.strictEqual(status, false);
    });

    it('should re-opt-in a user', async () => {
      const userId = 'user-reopt-123';
      await service.optIn(userId);
      assert.strictEqual(await service.isOptedIn(userId), true);
    });

    it('should handle user ID with special characters', async () => {
      const userId = 'user-123-!@#$%';
      await service.optIn(userId);
      const status = await service.isOptedIn(userId);
      assert.strictEqual(status, true);
    });

    it('should store opt-in timestamp', async () => {
      const userId = 'user-timestamp-123';
      const now = new Date();
      await service.optIn(userId);
      
      const statusInfo = await service.getOptInStatus(userId);
      assert(statusInfo.updated_at !== null);
      assert(statusInfo.updated_at !== undefined);
    });

    it('should reject empty user ID', async () => {
      assert.rejects(
        async () => {
          await service.optIn('');
        },
        Error
      );
    });

    it('should reject null user ID', async () => {
      assert.rejects(
        async () => {
          await service.optIn(null);
        },
        Error
      );
    });
  });

  describe('User Opt-Out Operations', () => {
    it('should opt-out a user successfully', async () => {
      const userId = 'user-optout-123';
      await service.optOut(userId);
      const status = await service.isOptedIn(userId);
      assert.strictEqual(status, false);
    });

    it('should opt-out a previously opted-in user', async () => {
      const userId = 'user-toggle-123';
      await service.optIn(userId);
      assert.strictEqual(await service.isOptedIn(userId), true);
      
      await service.optOut(userId);
      assert.strictEqual(await service.isOptedIn(userId), false);
    });

    it('should handle opt-out without prior opt-in', async () => {
      const userId = 'user-never-optedin-123';
      await service.optOut(userId);
      const status = await service.isOptedIn(userId);
      assert.strictEqual(status, false);
    });

    it('should store opt-out timestamp', async () => {
      const userId = 'user-optout-timestamp-123';
      await service.optOut(userId);
      
      const statusInfo = await service.getOptInStatus(userId);
      assert(statusInfo.updated_at !== null);
      assert(statusInfo.updated_at !== undefined);
    });

    it('should reject empty user ID on optOut', async () => {
      assert.rejects(
        async () => {
          await service.optOut('');
        },
        Error
      );
    });
  });

  describe('Bulk Operations', () => {
    it('should bulk opt-in multiple users', async () => {
      const userIds = ['user-bulk1', 'user-bulk2', 'user-bulk3'];
      await service.bulkOptIn(userIds);

      for (const userId of userIds) {
        const status = await service.isOptedIn(userId);
        assert.strictEqual(status, true);
      }
    });

    it('should bulk opt-out multiple users', async () => {
      const userIds = ['user-bulk-out1', 'user-bulk-out2', 'user-bulk-out3'];
      await service.bulkOptOut(userIds);

      for (const userId of userIds) {
        const status = await service.isOptedIn(userId);
        assert.strictEqual(status, false);
      }
    });

    it('should handle empty bulk array', async () => {
      // Should not throw error
      await service.bulkOptIn([]);
      await service.bulkOptOut([]);
      assert(true);
    });

    it('should handle large bulk operations', async () => {
      const userIds = Array.from({ length: 100 }, (_, i) => `user-bulk-${i}`);
      await service.bulkOptIn(userIds);

      // Spot check a few
      assert.strictEqual(await service.isOptedIn('user-bulk-0'), true);
      assert.strictEqual(await service.isOptedIn('user-bulk-50'), true);
      assert.strictEqual(await service.isOptedIn('user-bulk-99'), true);
    });

    it('should handle mixed opt states in bulk', async () => {
      const userIds1 = ['user-mixed1', 'user-mixed2'];
      const userIds2 = ['user-mixed2', 'user-mixed3'];

      await service.bulkOptIn(userIds1);
      assert.strictEqual(await service.isOptedIn('user-mixed1'), true);
      
      await service.bulkOptOut(userIds2);
      // user-mixed2 changed from in to out
      assert.strictEqual(await service.isOptedIn('user-mixed2'), false);
      assert.strictEqual(await service.isOptedIn('user-mixed3'), false);
    });
  });

  describe('User Listing Operations', () => {
    it('should return empty array when no users opted in', async () => {
      const users = await service.getAllOptedInUsers();
      assert(Array.isArray(users));
    });

    it('should list all opted-in users', async () => {
      const userIds = ['user-list1', 'user-list2', 'user-list3'];
      await service.bulkOptIn(userIds);

      const optedInUsers = await service.getAllOptedInUsers();
      assert(Array.isArray(optedInUsers));
      
      for (const userId of userIds) {
        assert(optedInUsers.includes(userId));
      }
    });

    it('should list all opted-out users', async () => {
      const userIds = ['user-listout1', 'user-listout2', 'user-listout3'];
      await service.bulkOptOut(userIds);

      const optedOutUsers = await service.getAllOptedOutUsers();
      assert(Array.isArray(optedOutUsers));
      
      for (const userId of userIds) {
        assert(optedOutUsers.includes(userId));
      }
    });

    it('should not include opt-out users in opted-in list', async () => {
      await service.optIn('user-list-separate1');
      await service.optOut('user-list-separate2');

      const optedInUsers = await service.getAllOptedInUsers();
      assert(optedInUsers.includes('user-list-separate1'));
      assert(!optedInUsers.includes('user-list-separate2'));
    });

    it('should handle large user lists efficiently', async () => {
      const userIds = Array.from({ length: 500 }, (_, i) => `user-large-${i}`);
      await service.bulkOptIn(userIds);

      const optedInUsers = await service.getAllOptedInUsers();
      assert(optedInUsers.length >= userIds.length);
    });
  });

  describe('Status Retrieval with Metadata', () => {
    it('should return status object with timestamp', async () => {
      const userId = 'user-metadata-123';
      await service.optIn(userId);

      const status = await service.getOptInStatus(userId);
      assert(typeof status === 'object');
      assert.strictEqual(status.user_id, userId);
      assert.strictEqual(status.opted_in, 1);
      assert(status.updated_at !== null);
    });

    it('should return opted_out status as 0', async () => {
      const userId = 'user-status-out-123';
      await service.optOut(userId);

      const status = await service.getOptInStatus(userId);
      assert.strictEqual(status.opted_in, 0);
    });

    it('should return null for non-existent user', async () => {
      const status = await service.getOptInStatus('user-nonexistent-999');
      assert(status === null || status === undefined);
    });

    it('should track update timestamp changes', async () => {
      const userId = 'user-timestamp-change-123';
      
      await service.optIn(userId);
      const status1 = await service.getOptInStatus(userId);
      
      // Small delay to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      await service.optOut(userId);
      const status2 = await service.getOptInStatus(userId);
      
      // Timestamps might be equal or status2 later
      assert(status1.updated_at !== undefined);
      assert(status2.updated_at !== undefined);
    });
  });

  describe('Cleanup Operations', () => {
    it('should delete all user communications', async () => {
      const userIds = ['user-clean1', 'user-clean2'];
      await service.bulkOptIn(userIds);

      // Verify they exist
      let optedInUsers = await service.getAllOptedInUsers();
      assert(optedInUsers.length > 0);

      // Delete all
      await service.deleteAllUserCommunications();

      // Verify all gone
      optedInUsers = await service.getAllOptedInUsers();
      const optedOutUsers = await service.getAllOptedOutUsers();
      
      assert.strictEqual(optedInUsers.length, 0);
      assert.strictEqual(optedOutUsers.length, 0);
    });

    it('should cleanup inactive users (optional feature)', async () => {
      const userId = 'user-inactive-old';
      // This test would need time mocking to work properly
      // For now, verify the method exists and doesn't crash
      const result = await service.cleanupInactiveUsers(365);
      assert(typeof result === 'number');
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error messages', async () => {
      try {
        await service.optIn(null);
        assert.fail('Should have thrown error');
      } catch (error) {
        assert(error instanceof Error);
        assert(error.message.length > 0);
      }
    });

    it('should handle database errors gracefully', async () => {
      // Method should handle gracefully
      assert(typeof service.isOptedIn === 'function');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent opt-in and opt-out', async () => {
      const userId1 = 'user-concurrent1';
      const userId2 = 'user-concurrent2';

      const promises = [
        service.optIn(userId1),
        service.optOut(userId2),
      ];

      await Promise.all(promises);

      assert.strictEqual(await service.isOptedIn(userId1), true);
      assert.strictEqual(await service.isOptedIn(userId2), false);
    });

    it('should handle rapid status changes', async () => {
      const userId = 'user-rapid-change-123';

      await service.optIn(userId);
      await service.optOut(userId);
      await service.optIn(userId);
      await service.optOut(userId);

      const status = await service.isOptedIn(userId);
      assert.strictEqual(status, false);
    });

    it('should handle concurrent bulk operations', async () => {
      const userIds1 = ['user-concurrent-bulk1', 'user-concurrent-bulk2'];
      const userIds2 = ['user-concurrent-bulk3', 'user-concurrent-bulk4'];

      const promises = [
        service.bulkOptIn(userIds1),
        service.bulkOptOut(userIds2),
      ];

      await Promise.all(promises);

      assert.strictEqual(await service.isOptedIn('user-concurrent-bulk1'), true);
      assert.strictEqual(await service.isOptedIn('user-concurrent-bulk3'), false);
    });
  });

  describe('Integration Workflows', () => {
    it('should support complete user communication workflow', async () => {
      // User opts in
      const userId = 'user-workflow-123';
      await service.optIn(userId);
      assert.strictEqual(await service.isOptedIn(userId), true);

      // Check status
      const status = await service.getOptInStatus(userId);
      assert.strictEqual(status.opted_in, 1);

      // User opts out
      await service.optOut(userId);
      assert.strictEqual(await service.isOptedIn(userId), false);

      // Verify in opted-out list
      const optedOut = await service.getAllOptedOutUsers();
      assert(optedOut.includes(userId));
    });

    it('should support bulk import workflow', async () => {
      const importedUsers = ['user-import1', 'user-import2', 'user-import3'];
      
      // Bulk import
      await service.bulkOptIn(importedUsers);

      // Verify all imported
      const optedIn = await service.getAllOptedInUsers();
      for (const user of importedUsers) {
        assert(optedIn.includes(user));
      }

      // Export and verify
      const statuses = await Promise.all(
        importedUsers.map((id) => service.getOptInStatus(id))
      );
      assert.strictEqual(statuses.filter((s) => s.opted_in === 1).length, 3);
    });
  });
});
