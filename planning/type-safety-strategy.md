# Type Safety Strategy

## Philosophy
Maximum compile-time type safety with zero runtime overhead. Native TypeScript strict mode throughout the entire codebase.

## Core Approach

### 1. TypeScript Strict Mode Throughout
```
src/
├── agents/           # Mastra agent definitions
├── workflows/        # Mastra vNext workflows
├── models/          # Type definitions
├── api/             # Hono API routes
└── lib/             # Shared utilities
```

### 2. Type Checking Stack

**Compile-Time Checking**:
- **TypeScript** with strict mode enabled
- **Bun** for fast type checking and runtime
- Type errors = build failures

**Additional Tooling**:
- **@typescript-eslint** for additional type-aware linting
- **tsc --noEmit** in CI for pure type checking
- **Zod** for runtime validation at API boundaries

## Configuration

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "rootDir": "./src",
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}


### .eslintrc.json
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-call": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/strict-boolean-expressions": "error"
  }
}
```

## CI Pipeline

### GitHub Actions Workflow
```yaml
name: Type Safety Enforcement
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
          
      - name: Install dependencies
        run: bun install
          
      - name: Type check with TypeScript
        run: bun run type-check
        
      - name: Lint with type-aware rules
        run: bun run lint
        
      - name: Build project
        run: bun run build
        
      - name: Run tests
        run: bun test
```

## Development Workflow

### Local Development
```bash
# Start development with hot reload
bun run dev

# Before committing - type check
bun run type-check
bun run lint
bun test
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build src/index.ts --outdir=dist --target=node",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "test": "bun test",
    "pre-commit": "bun run type-check && bun run lint && bun test"
  }
}

### Type Safety Rules

1. **No `any` types** - Ever. Use `unknown`, unions, or generics
2. **All functions typed** - Explicit return types required
3. **Strict null checks** - No implicit `undefined`
4. **Immutable by default** - Use `readonly` and `as const`
5. **Const assertions** - Use `as const` for literal types

### Code Patterns

```typescript
import { z } from 'zod';

// Runtime validation schemas
const TicketSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.number().min(1).max(5)
});

// Derive types from schemas
type Ticket = z.infer<typeof TicketSchema>;

// Immutable data
interface TicketData {
  readonly id: string;
  readonly title: string;
  readonly priority: number;
}

// Clear interfaces
interface TicketProcessor {
  process(ticket: TicketData): Promise<ProcessedResult>;
}

// Branded types for extra safety
type UserId = string & { readonly __brand: 'UserId' };
type TicketId = string & { readonly __brand: 'TicketId' };

// Exhaustive pattern matching
type Status = 'pending' | 'processing' | 'completed' | 'failed';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending': return 'Waiting';
    case 'processing': return 'In Progress';
    case 'completed': return 'Done';
    case 'failed': return 'Error';
    default: {
      // TypeScript ensures this is never reached
      const _exhaustive: never = status;
      throw new Error(`Unhandled status: ${_exhaustive}`);
    }
  }
}

// Result type for explicit error handling
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };
```

## Benefits

1. **Native type safety** - TypeScript built from ground up for types
2. **Better DX** - Superior IDE support and refactoring
3. **No compilation step** - Bun runs TypeScript directly
4. **Clean code** - Types are part of the language, not annotations
5. **Ecosystem** - Massive TypeScript ecosystem for all needs

## Runtime Validation

Use Zod schemas at boundaries:
- API request/response validation
- External system integration
- LLM response parsing
- Configuration loading

```typescript
// Validate at boundaries, type-safe internally
const validateTicket = (data: unknown): Ticket => {
  return TicketSchema.parse(data);
};
```

Everything else relies on compile-time type checking.