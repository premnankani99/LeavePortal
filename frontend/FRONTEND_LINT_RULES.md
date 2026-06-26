# LeavePortal Frontend: Strict ESLint Rules & Setup

Based on your project context and configuration, here is a comprehensive guide to the strict ESLint rules enforced on the frontend. This configuration ensures consistent styling, prevents hardcoded values, enforces translations, and keeps components modular.

## 1. ESLint Configuration (`eslint.config.js`)

This configuration uses ESLint's new Flat Config format. It relies heavily on advanced AST traversal (`no-restricted-syntax`) to block magic numbers, hardcoded strings, inline styles, and un-extracted components.

> [!TIP]
> Ensure you have the required dependencies: `npm install --save-dev eslint globals eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-react typescript-eslint`

```javascript
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import reactPlugin from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores([
    'dist',
    '**/node_modules/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended, 
      ...tseslint.configs.recommended, 
      reactHooks.configs.flat.recommended, 
      reactRefresh.configs.vite
    ],
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      react: reactPlugin,
      custom: {
        rules: {
          // --------------------------------------------------------
          // 1. Component Modularity (max-div-lines)
          // --------------------------------------------------------
          // Forces developers to extract large <div> blocks (>= 40 lines) 
          // into separate reusable components unless they already compose custom components.
          'max-div-lines': {
            create(context) {
              const hasCustomComponent = (node) => {
                if (node.type === 'JSXElement') {
                  const nameNode = node.openingElement.name;
                  if (nameNode.type === 'JSXIdentifier' && /^[A-Z]/.test(nameNode.name)) {
                    return true;
                  }
                  if (nameNode.type === 'JSXMemberExpression') {
                    return true;
                  }
                }
                if (node.children) {
                  return node.children.some((child) => hasCustomComponent(child));
                }
                return false;
              };

              return {
                JSXElement(node) {
                  if (node.openingElement.name.name === 'div') {
                    const lines = node.loc.end.line - node.loc.start.line + 1;
                    if (lines >= 40) {
                      const hasCustom = node.children.some((child) => hasCustomComponent(child));
                      if (!hasCustom) {
                        context.report({
                          node,
                          message: 'Div has too many lines ({{ lines }}). Extract it into a separate component.',
                          data: { lines },
                        });
                      }
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'max-len': ['error', { code: 200, ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }],
      'custom/max-div-lines': 'error',
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
    },
  },
  
  // --------------------------------------------------------
  // 2. Strict Hardcoding & Magic Values Ban
  // --------------------------------------------------------
  {
    files: ['**/*.{ts,tsx}'],
    ignores: [
      '**/constants/*.ts', 
      '**/i18n/*.ts', 
      'vite.config.ts', 
      '**/design-library/**/*', 
      '**/mock*/**', 
      '**/*[mM]ock*.*', 
      '**/*.backup.*', 
      '**/temp/**', 
      '**/scripts/**'
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        
        // NO HARDCODED STRINGS: Force usage of constants for logic and translations for UI
        {
          selector: ":not(ImportDeclaration, ExportNamedDeclaration, ExportAllDeclaration, Property, JSXAttribute, TSLiteralType, ImportExpression, CallExpression[callee.name='t'], CallExpression[callee.name='tn'], LogicalExpression) > Literal[raw=/^['\"]/]:not([value='']):not([value=/^[(): \\-₹. /]+$/])",
          message: 'Do not use hardcoded string literals. Import a constant from constants/ instead.',
        },
        {
          selector: 'JSXText[value=/[a-zA-Z]/]',
          message: "Public-facing string must be used using 't' with useLanguage() and its translation in English and Hindi should exist.",
        },
        
        // NO MOCK DATA IN COMPONENTS
        {
          selector: 'VariableDeclarator[id.name=/Mock/i]',
          message: 'Mock data should be kept in separate files (e.g., utils/mockData.ts) and imported.',
        },
        
        // NO HARDCODED ENVIRONMENT URLS
        {
          selector: "BinaryExpression[left.property.name='hostname'][right.value=/localhost|ngrok|127.0.0.1/]",
          message: 'Environment checks should be kept in a utils file for reusability.',
        },
        
        // PREVENT SPECIFIC HARDCODED KEYS
        {
          selector: "CallExpression[callee.object.name='localStorage'] > Literal[value='userData']",
          message: "Do not use hardcoded 'userData' string. Use STORAGE_KEYS.USER_DATA instead.",
        },
        
        // MANDATE SUFFIXES FOR NUMERICS (Time, Size)
        {
          selector: "VariableDeclarator[init.type='Literal'][id.name=/DURATION|TIMEOUT|SIZE|LIMIT|INTERVAL|DELAY/]:not([id.name=/(_SECS|_MS|_MB|_KB|_BYTES|_PX|_REM|_PERCENT|_VH|_VW)$/])",
          message: 'Numeric constants representing units (durations, sizes, etc.) must include a suffix (e.g., _SECS, _MS, _MB, _PX) to avoid ambiguity.',
        },
        
        // BAN MAGIC NUMBERS IN COMPONENTS
        {
          selector: 'Literal[raw=/^[0-9.]/]',
          message: 'Numeric literal found. All numeric values must be defined as named constants in constants/ files.',
        },
        
        // STRICT STYLING: Ban Hardcoded Colors & Spacing
        {
          selector: "JSXAttribute[name.name='style'] Literal[value=/^#([A-Fa-f0-9]{3}){1,2}$|^rgb|^rgba|^(red|blue|green|white|black|gray|slate|emerald|indigo|violet|cyan|rose|sky|orange|amber|teal)$/i]",
          message: 'Do not use hardcoded colors in style attributes. Import COLORS from src/constants/colors.ts instead.',
        },
        {
          selector: 'Property[key.name=/color|backgroundColor|borderColor|fill|stroke/i] > Literal[value=/^#([A-Fa-f0-9]{3}){1,2}$|^rgb|^rgba|^(red|blue|green|white|black|gray|slate|emerald|indigo|violet|cyan|rose|sky|orange|amber|teal)$/i]',
          message: 'Do not use hardcoded colors in style objects. Import COLORS from src/constants/colors.ts instead.',
        },
        {
          selector: 'Property[key.name=/^(margin|padding|gap)(Top|Bottom|Left|Right)?$/i] > Literal',
          message: 'Do not use hardcoded spacing values (margin/padding/gap) in style objects. Use CSS classes with spacing variables instead.',
        },
        
        // STRICT HTTP STATUS CODES
        {
          selector: "BinaryExpression[left.property.name=/^(status|statusCode)$/][right.type='Literal'], BinaryExpression[right.property.name=/^(status|statusCode)$/][left.type='Literal'], BinaryExpression[left.name=/^(status|statusCode)$/][right.type='Literal'], BinaryExpression[right.name=/^(status|statusCode)$/][left.type='Literal']",
          message: 'Do not use hardcoded status codes. Import HTTP_STATUS from src/constants/appConstants.ts instead.',
        },
        
        // PREVENT UNDERSCORES IN PUBLIC ATTRIBUTES
        {
          selector: "JSXAttribute[name.name!='value'][name.name!='name'][name.name!='id'][name.name!='key'] > Literal[value=/.*_.*/]",
          message: 'Underscores should not appear in public-facing attribute values. Use t() with a translation key or reference a constant instead.',
        },
      ],
    },
  },
  
  // --------------------------------------------------------
  // 3. API Endpoints Segregation
  // --------------------------------------------------------
  {
    files: ['**/constants/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "VariableDeclarator[id.name!='BASE_URL'] > Literal[value=/^https?:\\/\\//]",
          message: 'API URLs must be kept in src/constants/apiEndpoints.ts and must NOT include the base URL (use BASE_URL instead).',
        },
      ],
    },
  },
]);
```

## 2. Setting Up Pre-commit Enforcement (Husky & lint-staged)

To guarantee that these frontend rules are verified before every commit, make sure `husky` and `lint-staged` are configured in your `package.json`.

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix"
    ]
  }
}
```

### Pre-commit Hook (`.husky/pre-commit`)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```
