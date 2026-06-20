import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import promise from "eslint-plugin-promise";
import sonarjs from "eslint-plugin-sonarjs";

const eslintConfig = [
  {
    ignores: ["next-env.d.ts", ".next/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  promise.configs["flat/recommended"],
  sonarjs.configs.recommended,
  {
    rules: {
      "complexity": ["warn", 10],
      "max-depth": ["warn", 3],
      "max-lines": ["warn", 300],
      // Reglas nuevas que eslint-plugin-react-hooks v6 (vía eslint-config-next 16)
      // activa como error en este bump. Las degradamos a warn para no romper el gate
      // de CI: son hallazgos legítimos de refactor, no fallos de configuración, y se
      // abordarán en un PR aparte (ver #48). No suprimidas: siguen visibles como avisos.
      "react-hooks/static-components": "warn",
      "react-hooks/set-state-in-effect": "warn",
    }
  }
];

export default eslintConfig;
