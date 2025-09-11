import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import prettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    ignores: ["**/dist/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
      prettier: prettier,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...prettierConfig.rules,
      "prettier/prettier": "error",
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "block-like", next: "*" },
        { blankLine: "always", prev: "*", next: "block-like" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      curly: ["error", "all"],
    },
  },
];
