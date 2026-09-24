import js from "@eslint/js"
import next from "@next/eslint-plugin-next"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      ".agents/**",
      ".impeccable/**",
      "node_modules/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      "@next/next": next,
      "react-hooks": reactHooks,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      ...reactHooks.configs.recommended.rules,
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^(?:_|.*Internal$)",
        },
      ],
    },
  },
)
