import tseslint from "typescript-eslint";
import nextConfig from "eslint-config-next";
import prettier from "eslint-config-prettier";

const config = [
  ...tseslint.configs.recommended,
  ...nextConfig,
  prettier,
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "build",
      "public",
      "*.config.js",
      "*.config.ts",
      "*.log",
      "coverage",
    ],
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-console": ["warn", { allow: ["error"] }],
      "no-debugger": "error",
      eqeqeq: ["error", "always"],
      "no-var": "error",
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default config;