# Cursor Rules Guide

This project now has comprehensive Cursor rules to assist with development. These rules provide context and guidance to the AI assistant when working on your codebase.

## Created Rules

### 1. **project-overview.mdc** (Always Applied)
**Location**: `.cursor/rules/project-overview.mdc`

**What it does**: Provides high-level project context on every request
- Tech stack (Vue 3, Vite, Pinia, Vue Router)
- Project structure and key files
- Backend API information
- Authentication flow
- Data model concepts
- Available npm scripts

**When it helps**: Anytime you ask questions about the project or request changes

---

### 2. **vue-component-standards.mdc** (Auto-applied to .vue files)
**Location**: `.cursor/rules/vue-component-standards.mdc`

**What it does**: Enforces Vue 3 Composition API patterns when editing .vue files
- `<script setup>` syntax
- Proper import ordering
- Reactivity patterns (ref, computed, watch)
- Router and store usage
- Component structure conventions
- Common patterns (loading states, error handling, modals)

**When it helps**: When creating or editing Vue components

---

### 3. **api-integration.mdc** (Auto-applied to API files and scripts)
**Location**: `.cursor/rules/api-integration.mdc`

**What it does**: Documents all API endpoints and integration patterns
- Authentication API methods
- Survey API methods
- Request/response formats
- Error handling patterns
- Bulk data loading strategies
- Likert scale specifics (1-5 range)

**When it helps**: When working with API calls or writing test scripts

---

### 4. **pinia-state-management.mdc** (Auto-applied to store files)
**Location**: `.cursor/rules/pinia-state-management.mdc`

**What it does**: Defines Pinia store patterns and best practices
- Composition API store setup
- State persistence (localStorage)
- Auth store structure
- Using stores in components and router
- Error and loading state management
- Naming conventions

**When it helps**: When creating or modifying Pinia stores

---

### 5. **design-system.mdc** (Auto-applied to .vue and .css files)
**Location**: `.cursor/rules/design-system.mdc`

**What it does**: Documents the Apple-inspired design system
- CSS custom properties (colors, spacing, typography)
- Component patterns (buttons, cards, modals)
- Transition and animation standards
- Layout guidelines
- Responsive design patterns

**When it helps**: When styling components or implementing UI

---

### 6. **testing-simulation.mdc** (Manual - use description)
**Location**: `.cursor/rules/testing-simulation.mdc`

**What it does**: Documents testing and simulation workflows
- Available test scripts (test-api, simulate, etc.)
- Script usage patterns
- Response distribution patterns
- Common testing scenarios
- Debugging tips
- Script customization

**When it helps**: Ask "How do I test the API?" or "How do I simulate responses?"

---

## How Rules Work

### Automatic Application
Rules are automatically applied based on their metadata:

1. **alwaysApply: true** - Applied to every request
   - `project-overview.mdc`

2. **globs: pattern** - Applied when working with matching files
   - `vue-component-standards.mdc` → `*.vue`
   - `api-integration.mdc` → `**/api.js`, `**/scripts/**/*.js`
   - `pinia-state-management.mdc` → `**/stores/**/*.js`
   - `design-system.mdc` → `*.vue`, `*.css`

3. **description: text** - Applied when the AI determines it's relevant
   - `testing-simulation.mdc` → Ask about testing

### Manual Invocation
You can also manually reference rules by asking questions like:
- "How do I create a Vue component?" → Triggers vue-component-standards
- "What API endpoints are available?" → Triggers api-integration
- "How do I run tests?" → Triggers testing-simulation

## Example Usage

### Creating a New Vue Component
When you create a new `.vue` file, the AI will automatically:
- Use `<script setup>` syntax
- Follow the correct import order
- Use proper reactivity patterns
- Apply design system tokens
- Follow component structure conventions

### Working with APIs
When editing `src/services/api.js` or script files, the AI will:
- Know all available endpoints
- Follow error handling patterns
- Understand request/response formats
- Apply proper async/await patterns

### Styling Components
When writing CSS in `.vue` or `.css` files, the AI will:
- Use design system tokens (var(--space-3), etc.)
- Follow Apple-inspired patterns
- Apply consistent spacing and typography
- Use proper transitions and animations

## Testing the Rules

Try these commands to see the rules in action:

```
"Create a new Vue component for displaying survey statistics"
→ Should use vue-component-standards and design-system

"Add a new API method to get survey participants"
→ Should use api-integration patterns

"How do I simulate 100 responses to a survey?"
→ Should reference testing-simulation

"Create a Pinia store for managing survey drafts"
→ Should use pinia-state-management patterns
```

## Modifying Rules

Rules are just markdown files with frontmatter. You can edit them at any time:

```bash
# Edit a rule
open .cursor/rules/vue-component-standards.mdc

# Add a new rule
touch .cursor/rules/my-custom-rule.mdc
```

### Rule Format
```markdown
---
alwaysApply: false
globs: *.ts,*.tsx
description: Optional description for manual triggering
---
# Rule Title

Rule content in markdown with code examples...

Reference other files: [filename.ext](mdc:path/to/filename.ext)
```

## Benefits

✅ **Consistent code patterns** - AI follows your project conventions
✅ **Faster development** - AI knows your project structure
✅ **Better suggestions** - AI understands your design system
✅ **Reduced errors** - AI follows tested patterns
✅ **Self-documenting** - Rules serve as living documentation

## Next Steps

1. **Try it out**: Ask the AI to create something and see the rules in action
2. **Customize**: Edit rules to match your evolving preferences
3. **Expand**: Add new rules for other aspects of your codebase
4. **Share**: Rules help teammates understand the project too

---

**Note**: Rules are stored in `.cursor/rules/` and are part of your project. Commit them to version control to share with your team!

