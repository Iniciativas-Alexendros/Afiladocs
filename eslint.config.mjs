import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:sonarjs/recommended",
    "plugin:security/recommended",
    "plugin:promise/recommended"
  ),
  {
    rules: {
      "complexity": ["warn", 10],
      "max-depth": ["warn", 3],
      "max-lines": ["warn", 300],
    }
  }
];

export default eslintConfig;
