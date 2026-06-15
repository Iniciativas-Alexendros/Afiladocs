import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "cobertura"],
      include: ["src/lib/**", "src/app/api/**"],
      exclude: [
        "src/__tests__/**",
        "node_modules/**",
        // Wrappers de infra puros: factories de SDK / singletons sin lógica
        // de negocio. Testearlos solo mide el constructor del SDK de terceros,
        // no nuestro código. Se excluyen para que el % refleje lógica real.
        "src/lib/prisma/client.ts",
        "src/lib/supabase/client.ts",
        "src/lib/supabase/server.ts",
        "src/lib/supabase/service.ts",
        "src/lib/supabase/middleware.ts",
        "src/lib/supabase/lazy-client.ts",
      ],
      // Gate de regresión: anclado al nivel real verificado (2026-06-15)
      // tras la pista de cobertura — 84.6% stmts / 85.6% lines / 83.4% funcs
      // / 69.6% branches. Umbrales con ~1-2 pts de holgura para no romper CI
      // por ruido. El build de CI FALLA si la cobertura baja de aquí.
      thresholds: {
        statements: 82,
        branches: 68,
        functions: 80,
        lines: 83,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
