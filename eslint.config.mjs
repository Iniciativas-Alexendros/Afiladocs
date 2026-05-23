import sonarjs from "eslint-plugin-sonarjs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: ["next-env.d.ts", ".next/**"],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:promise/recommended"
  ),
  sonarjs.configs.recommended,
  {
    rules: {
      "complexity": ["warn", 10],
      "max-depth": ["warn", 3],
      "max-lines": ["warn", 300],
    }
  }
];

export default eslintConfig;
