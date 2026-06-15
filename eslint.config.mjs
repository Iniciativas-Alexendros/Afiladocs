import sonarjs from "eslint-plugin-sonarjs";
import security from "eslint-plugin-security";
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
    ignores: ["next-env.d.ts", ".next/**", ".claude/**", "coverage/**"],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:promise/recommended"
  ),
  sonarjs.configs.recommended,
  security.configs.recommended,
  {
    rules: {
      "complexity": ["warn", 10],
      "max-depth": ["warn", 3],
      "max-lines": ["warn", 300],
      // detect-object-injection genera ruido: alerta ante cualquier acceso
      // obj[var] aunque la clave no provenga de input externo sin sanear.
      // El resto de reglas de seguridad (child-process, unsafe-regex, eval,
      // non-literal-fs-filename) permanecen activas.
      "security/detect-object-injection": "off",
    }
  }
];

export default eslintConfig;
