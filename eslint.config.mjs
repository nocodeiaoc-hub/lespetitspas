import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Autorise les paramètres inutilisés préfixés par `_`
      // (ex. `_prev` requis par la signature de `useActionState`).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Projet autonome (maquette Phase 2), a son propre lint/build.
    "prototype/**",
    // Fichiers de test : runner (vitest) mis en place en Phase 8 (US-30).
    "**/*.test.ts",
    "**/*.test.tsx",
    // Tests E2E Playwright : compilés par Playwright, hors périmètre du lint Next.
    "tests/**",
  ]),
]);

export default eslintConfig;
