# Scripts Archive

**Location:** `scripts/archived/`  
**Purpose:** Historical repository for obsolete and deprecated scripts  
**Maintained By:** GitHub Copilot (Automated)

---

## Quick Reference

| Script | Status | Reason | Alternative |
|--------|--------|--------|-------------|
| jest-migration-helper.js | ❌ Obsolete | Jest migration complete | Use `npm test` |
| coverage-tracking.js | ⚠️ Deprecated | Consolidated | Use `npm run coverage` |
| coverage-unified.js | ⚠️ Deprecated | Consolidated | Use `npm run coverage` |

---

## Available Documentation

### Archive Files
- **MANIFEST.md** - Archive manifest with metadata for each script
- **ARCHIVE.md** - Comprehensive archive documentation
- **README.md** - This file (quick reference)

### Script Files
- **jest-migration-helper.js** - Old Jest migration utility
- **coverage-tracking.js** - Deprecated coverage tracking
- **coverage-unified.js** - Deprecated unified coverage reporting

---

## Finding What You Need

### I need to use an archived script
→ See **ARCHIVE.md** for recovery procedures

### I need the history of a script
→ Check git history: `git log -- scripts/archived/`

### I need to understand why it was archived
→ Read **MANIFEST.md** for each script's rationale

### I need the modern replacement
→ Check the "Modern Alternative" column in the table above

---

## Key Points

✅ **All archived scripts are still accessible** via git history  
✅ **Modern replacements provide all previous functionality**  
✅ **Archive is read-only** - no active maintenance  
✅ **Recovery is simple** - see ARCHIVE.md for procedures  
✅ **Documentation is complete** - all reasons explained

---

## For Developers

### If you need to restore a script:

1. **Check ARCHIVE.md first** - It explains modern alternatives
2. **Use git to recover** - `git show <commit>:scripts/archived/[SCRIPT]`
3. **Update package.json** - Register any npm scripts
4. **Add to git** - Track the restoration
5. **Document your reason** - Update this README

### If you're adding to the archive:

1. **Move the file** - `mv scripts/[SCRIPT] scripts/archived/`
2. **Update MANIFEST.md** - Add metadata section
3. **Update ARCHIVE.md** - Add documentation
4. **Update package.json** - Remove npm scripts
5. **Commit with clear message** - Include archive explanation

---

## Statistics

- **Scripts Archived:** 3
- **Total Size:** ~21.6 KB
- **Total LOC:** ~530 lines
- **Last Updated:** January 16, 2026
- **Archive Phase:** Phase 4 (Obsolete Scripts Archival)

---

## Questions?

Refer to:
- **ARCHIVE.md** - Comprehensive documentation
- **MANIFEST.md** - Individual script details
- **Git History** - Complete development record
- **package.json** - Current npm scripts
- **scripts/README.md** - Active scripts documentation

---

**Archive Status:** ACTIVE (Read-Only)  
**Last Maintenance:** January 16, 2026  
**Next Review:** Phase 5 verification
