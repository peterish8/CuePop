```markdown
# Deckactive Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the Deckactive TypeScript codebase. It covers file naming, import/export styles, commit message practices, and testing patterns. While no formal workflow automation was detected, this guide provides suggested commands and step-by-step instructions for common developer tasks.

## Coding Conventions

### File Naming
- Use **kebab-case** for all file names.
  - Example: `user-profile.ts`, `deck-manager.test.ts`

### Import Style
- Use **alias imports** for modules.
  - Example:
    ```typescript
    import { DeckService } from '@services/deck-service';
    ```

### Export Style
- Use **named exports** for all modules.
  - Example:
    ```typescript
    export function shuffleDeck(deck: Card[]): Card[] { ... }
    export const DECK_SIZE = 52;
    ```

### Commit Message Patterns
- Mixed commit types, often prefixed with `checkpoint` or `fix`.
- Keep commit messages concise (average 43 characters).
  - Example:
    ```
    fix: resolve card shuffle bug
    checkpoint: add deck validation logic
    ```

## Workflows

### Code Update and Commit
**Trigger:** When making any code changes  
**Command:** `/commit-update`

1. Make code changes following the coding conventions.
2. Stage your changes:
    ```
    git add .
    ```
3. Commit with a concise message, using `fix:` or `checkpoint:` as a prefix when appropriate:
    ```
    git commit -m "fix: resolve card shuffle bug"
    ```
4. Push your changes:
    ```
    git push
    ```

### Writing and Running Tests
**Trigger:** When adding new features or fixing bugs  
**Command:** `/run-tests`

1. Create or update test files using the `*.test.*` naming pattern.
    - Example: `deck-manager.test.ts`
2. Write tests for your code (testing framework is unspecified; adapt to your setup).
3. Run your tests using your project's test runner (e.g., `npm test` or `yarn test`).
4. Review test results and fix any failures.

## Testing Patterns

- Test files are named with the `*.test.*` pattern.
    - Example: `deck-manager.test.ts`
- The specific testing framework is not specified; use your project's standard.
- Place tests alongside or near the code they validate.

**Example test file:**
```typescript
// deck-manager.test.ts
import { shuffleDeck } from '@services/deck-service';

describe('shuffleDeck', () => {
  it('should return a deck of the same size', () => {
    const deck = [/* ... */];
    const shuffled = shuffleDeck(deck);
    expect(shuffled.length).toBe(deck.length);
  });
});
```

## Commands
| Command         | Purpose                                   |
|-----------------|-------------------------------------------|
| /commit-update  | Guide for updating and committing code    |
| /run-tests      | Steps for writing and running tests       |
```
