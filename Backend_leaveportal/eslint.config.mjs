import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jsdoc from "eslint-plugin-jsdoc";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "*.js",
      "seed.ts",
      "delete_employees.ts",
      "find_users.ts",
      "update_designations.ts",
      "utils/**"
    ],
    files: ["**/*.{js,ts}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2024,
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      jsdoc,
    },
    rules: {
      "max-lines-per-function": ["error", { max: 25, skipBlankLines: true, skipComments: true }],
      "max-len": ["error", { code: 140, ignoreComments: false, ignoreStrings: true, ignoreTemplateLiterals: true }],
      
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "all",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_"
      }],
      
      "jsdoc/require-param-type": "error",
      "jsdoc/require-param-description": "error",
      "jsdoc/require-jsdoc": ["error", {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: true,
          FunctionExpression: true
        }
      }],
      
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": ["error", {
        ignore: [0, 1, -1, 2],
        ignoreArrayIndexes: true,
        enforceConst: true,
        ignoreEnums: true
      }],
      
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.object.name='db'][callee.property.name='query'] Literal[typeof='string']",
          message: "SQL Safety: NEVER hardcode table or column names. Always use template literals with DB_TABLES and DB_COLS from utils/dbConstants.js."
        },
        {
          selector: "MemberExpression[object.object.name='req'][object.property.name='body'][property.name='user_id']",
          message: "JWT Auth: Do not ask for user_id in request bodies. Authenticated APIs must extract user_id from req.user (populated by JWT middleware)."
        },
        {
          selector: "MemberExpression[object.object.name='req'][object.property.name='body'][property.name='brokerId']",
          message: "JWT Auth: Do not ask for brokerId in request bodies. Authenticated APIs must extract user_id from req.user (populated by JWT middleware)."
        },
        {
          selector: "MemberExpression[object.object.name='req'][object.property.name='body'][property.name='employee_id']",
          message: "JWT Auth: Do not ask for employee_id in request bodies. Authenticated APIs must extract employee_id from req.user."
        },
        {
          selector: "CallExpression[callee.property.name='json'] ObjectExpression Property[key.name='message'] > Literal[typeof='string']",
          message: "Translation Strings: All user-facing messages must be picked from translation strings (e.g., constants/strings.ts). Do not hardcode strings in API responses."
        }
      ]
    }
  }
];
