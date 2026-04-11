```markdown
# afiladocs Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `afiladocs` repository, a TypeScript project built with Next.js. You'll learn about file naming, import/export styles, commit message conventions, and how to write and run tests using vitest. This guide is designed to help you quickly get up to speed with the codebase and contribute effectively.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userProfile.ts`, `apiRoutes.ts`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { getUser } from '@/services/userService';
    ```

### Export Style
- Use **named exports** throughout the codebase.
  - Example:
    ```typescript
    // userService.ts
    export function getUser(id: string) { ... }
    export function updateUser(user: User) { ... }
    ```

### Commit Messages
- Follow the **Conventional Commits** specification.
- Use the `fix` prefix for bug fixes.
  - Example:
    ```
    fix: correct user ID validation in profile update
    ```

## Workflows

_No specific workflows detected in this repository._

## Testing Patterns

- **Framework:** [vitest](https://vitest.dev/)
- **Test file pattern:** All test files are named with the `.test.ts` suffix.
  - Example: `userService.test.ts`
- **Test Example:**
  ```typescript
  import { describe, it, expect } from 'vitest';
  import { getUser } from '@/services/userService';

  describe('getUser', () => {
    it('returns user data for valid ID', () => {
      const user = getUser('123');
      expect(user).toBeDefined();
    });
  });
  ```

## Commands
| Command | Purpose |
|---------|---------|
| /test   | Run all vitest tests in the codebase |
| /lint   | Run code linting (if configured)     |
| /fix    | Apply auto-fixes for linting issues (if configured) |
```
