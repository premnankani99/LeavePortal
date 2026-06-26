# LeavePortal Backend: Strict ESLint Rules & Setup

Based on your project context, here is a strict ESLint configuration to enforce your backend coding standards, database safety patterns, JWT authentication rules, and API documentation requirements.

## 1. ESLint Configuration (`eslint.config.js` or `.eslintrc.js`)

This configuration utilizes the incredibly powerful `no-restricted-syntax` rule to traverse the Abstract Syntax Tree (AST) of your code and block specific anti-patterns (like accessing `req.body.user_id` or hardcoding SQL queries).

> [!TIP]
> Make sure you install the required plugins: `npm install --save-dev eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-jsdoc`

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2024: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsdoc/recommended'
  ],
  plugins: ['@typescript-eslint', 'jsdoc'],
  rules: {
    // --------------------------------------------------------
    // 1. Function Size & Line Length
    // --------------------------------------------------------
    // Maximum 25 lines per function. Split complex logic into smaller helpers.
    'max-lines-per-function': ['error', { max: 25, skipBlankLines: true, skipComments: true }],
    // Maximum 140 characters per line.
    'max-len': ['error', { code: 140, ignoreComments: false, ignoreStrings: true, ignoreTemplateLiterals: true }],

    // --------------------------------------------------------
    // 2. Unused Variables
    // --------------------------------------------------------
    // Ensure all defined variables are used; remove any innerError or unused params.
    'no-unused-vars': 'off', // Turn off base rule in favor of TS rule
    '@typescript-eslint/no-unused-vars': ['error', { 
      args: 'all', 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrors: 'all', // Specifically catches unused 'innerError' in catch blocks
      caughtErrorsIgnorePattern: '^_'
    }],

    // --------------------------------------------------------
    // 3. JSDoc Comments
    // --------------------------------------------------------
    // Always provide full JSDoc documentation for all parameters including type and description.
    'jsdoc/require-param-type': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,
        MethodDefinition: true,
        ClassDeclaration: true,
        ArrowFunctionExpression: true,
        FunctionExpression: true
      }
    }],

    // --------------------------------------------------------
    // 4. Central Constants (Magic Numbers)
    // --------------------------------------------------------
    // NEVER hardcode number literals. Always define them as constants.
    'no-magic-numbers': 'off',
    '@typescript-eslint/no-magic-numbers': ['error', { 
      ignore: [0, 1, -1, 2], // Common safe numbers
      ignoreArrayIndexes: true, 
      enforceConst: true,
      ignoreEnums: true
    }],

    // --------------------------------------------------------
    // 5. Advanced AST Rules (SQL, JWT Auth, Hardcoded Strings)
    // --------------------------------------------------------
    'no-restricted-syntax': [
      'error',
      
      // SQL SAFETY: Block hardcoded string literals inside db.query()
      {
        selector: "CallExpression[callee.object.name='db'][callee.property.name='query'] Literal[typeof='string']",
        message: 'SQL Safety: NEVER hardcode table or column names. Always use template literals with DB_TABLES and DB_COLS from utils/dbConstants.js.'
      },
      
      // JWT AUTH: Block extracting user_id from req.body
      {
        selector: "MemberExpression[object.object.name='req'][object.property.name='body'][property.name='user_id']",
        message: 'JWT Auth: Do not ask for user_id in request bodies. Authenticated APIs must extract user_id from req.user (populated by JWT middleware).'
      },
      
      // JWT AUTH: Block extracting brokerId from req.body
      {
        selector: "MemberExpression[object.object.name='req'][object.property.name='body'][property.name='brokerId']",
        message: 'JWT Auth: Do not ask for brokerId in request bodies. Authenticated APIs must extract user_id from req.user (populated by JWT middleware).'
      },
      
      // TRANSLATION STRINGS: Prevent hardcoded string messages in res.json / res.status().json()
      // This forces developers to use constants/strings.ts
      {
        selector: "CallExpression[callee.property.name='json'] ObjectExpression Property[key.name='message'] > Literal[typeof='string']",
        message: 'Translation Strings: All user-facing messages must be picked from translation strings (e.g., constants/strings.ts). Do not hardcode strings in API responses.'
      }
    ]
  }
};
```

## 2. Enforcement via Husky & lint-staged

To ensure these rules are strictly enforced and that documentation is always updated before a commit, you should configure `husky` and `lint-staged` in your `package.json`.

> [!IMPORTANT]
> The post-commit hook ensures that `webapi-documentation.html` is synchronized with the latest commit ID as mandated by your context.

### `package.json` setup:

```json
{
  "scripts": {
    "lint": "eslint . --ext .js,.ts",
    "lint:fix": "eslint . --ext .js,.ts --fix",
    "prepare": "husky install",
    "update-docs-commit": "node scripts/update-docs-commit.js"
  },
  "lint-staged": {
    "*.{js,ts}": [
      "eslint --fix"
    ]
  }
}
```

### Husky Hooks Setup:

1. **Pre-commit Hook** (`.husky/pre-commit`):
   Runs ESLint on staged files to ensure no unlinted code makes it into the repo.
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"

   npx lint-staged
   ```

2. **Post-commit Hook** (`.husky/post-commit`):
   Runs a script to update your `webapi-documentation.html` header with the latest commit hash.
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"

   npm run update-docs-commit
   ```

## 3. Helper Script: `update-docs-commit.js`

To fulfill the rule: *"Synchronize all backend changes with webapi-documentation.html. Keep the 'Last Updated: Commit [ID]' header current."*, you can use this simple Node script triggered by the post-commit hook.

```javascript
// scripts/update-docs-commit.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

try {
  const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
  const docsPath = path.join(__dirname, '../docs/webapi-documentation.html');
  
  if (fs.existsSync(docsPath)) {
    let docsContent = fs.readFileSync(docsPath, 'utf8');
    
    // Replaces existing header or injects a new one
    const regex = /Last Updated: Commit \[[a-zA-Z0-9]+\]/g;
    const replacement = `Last Updated: Commit [${commitHash}]`;
    
    if (regex.test(docsContent)) {
      docsContent = docsContent.replace(regex, replacement);
    } else {
      // Fallback if not found, add it near the body tag
      docsContent = docsContent.replace('<body>', `<body>\n    <p><i>${replacement}</i></p>`);
    }
    
    fs.writeFileSync(docsPath, docsContent);
    console.log(`✅ Documentation updated with latest commit ID: ${commitHash}`);
  }
} catch (error) {
  console.error('Failed to update documentation with commit ID:', error);
}
```
