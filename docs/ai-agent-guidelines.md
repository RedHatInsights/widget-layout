# AI Agent Guidelines for Widget Layout Repository

## Overview

This document outlines the critical guidelines that AI agents must follow when generating code documentation for the Widget Layout repository. These guidelines ensure accuracy, reliability, and maintainability of all generated documentation.

## Core Principles

### 1. Never Document Non-Existent Code

**CRITICAL**: AI agents must never document, reference, or create examples for code that does not exist in the repository.

- **Before documenting any component, function, or interface**, verify its existence in the codebase
- **Always check imports and dependencies** to ensure they are actually available
- **Do not assume standard patterns exist** - verify each implementation specifically

### 2. Verify All Code Samples

All code samples in documentation must be:

- **Tested and verified as working** before inclusion
- **Based on actual implementations** found in the repository
- **Using correct import paths** and dependencies
- **Following the project's established patterns**

### 3. Repository-Specific Requirements

This is a React application with specific characteristics:

- **State Management**: Uses Jotai atoms (located in `src/state/`)
- **Component Library**: PatternFly React components (`@patternfly/react-core`)
- **Styling**: SCSS files with component-specific styles
- **Build System**: Webpack with federated modules via `@redhat-cloud-services/frontend-components-config`
- **Routing**: React Router DOM v6
- **TypeScript**: Fully typed codebase

## Documentation Process

### Before Writing Documentation

1. **Explore the codebase** using semantic search to understand existing patterns
2. **Read actual source files** to understand implementation details
3. **Check dependencies** in `package.json` to verify available libraries
4. **Verify import paths** and component exports
5. **Test any code samples** in the actual development environment

### When Creating Code Examples

1. **Extract examples from existing code** when possible
2. **Use actual component names** and props from the codebase
3. **Include correct import statements** based on the project structure
4. **Follow the project's TypeScript patterns** for type definitions
5. **Use the project's established state management patterns** (Jotai atoms)

### Documentation Structure

```
docs/
├── ai-agent-guidelines.md (this file)
├── components/           # Component-specific documentation
├── api/                  # API documentation
├── patterns/             # Common patterns and best practices
└── examples/             # Verified code examples
```

## Verification Checklist

Before finalizing any documentation, verify:

- [ ] All referenced components exist in the codebase
- [ ] All import paths are correct
- [ ] All props and interfaces are accurately documented
- [ ] Code samples compile without errors
- [ ] Examples follow the project's established patterns
- [ ] TypeScript types are correctly referenced
- [ ] State management patterns use actual atoms from `src/state/`

## Common Pitfalls to Avoid

### ❌ Never Do This:

```tsx
// DON'T: Document non-existent components
import { MagicWidget } from '../Components/MagicWidget';

// DON'T: Use assumed props that don't exist
<GridLayout customProp="value" nonExistentProp={true} />

// DON'T: Reference non-existent state atoms
const [magicState] = useAtom(magicStateAtom);
```

### ✅ Always Do This:

```tsx
// DO: Reference actual components
import { GridLayout } from '../Components/DnDLayout/GridLayout';

// DO: Use actual props from the component interface
<GridLayout onLayoutChange={handleLayoutChange} />

// DO: Reference actual state atoms
const [currentLayout] = useAtom(layoutAtom);
```

## Tools and Resources

### Verification Tools Available:

- **Semantic Search**: Use to explore and understand existing code patterns
- **File Reading**: Always read actual source files to understand implementations
- **Grep Search**: Search for specific patterns, imports, or usage examples
- **File System Navigation**: Explore the actual project structure

### Project-Specific Resources:

- **Component Library**: PatternFly React Core v6
- **State Management**: Jotai atoms in `src/state/`
- **TypeScript Definitions**: Check `src/types/` for project-specific types
- **Styling**: SCSS files co-located with components

## Examples of Proper Documentation

### Good Component Documentation:

```tsx
// GridLayout Component
import { GridLayout } from '../Components/DnDLayout/GridLayout';
import { useAtom } from 'jotai';
import { layoutAtom } from '../state/layoutAtom';

function Dashboard() {
  const [layout] = useAtom(layoutAtom);
  
  return (
    <GridLayout
      layout={layout}
      onLayoutChange={handleLayoutChange}
    />
  );
}
```

*Note: This example is based on actual components and atoms found in the codebase*

## Enforcement

Any documentation that violates these guidelines must be:

1. **Immediately flagged** for revision
2. **Verified against the actual codebase** before approval
3. **Tested in the development environment** when possible
4. **Reviewed for accuracy** by checking source files

## Conclusion

These guidelines ensure that all AI-generated documentation for the Widget Layout repository is accurate, reliable, and maintainable. By following these principles, we maintain the integrity of our documentation and provide developers with trustworthy resources.

Remember: **When in doubt, verify against the actual codebase. Never assume - always confirm.** 
