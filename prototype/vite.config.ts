/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// En mode "pages", l'app est servie depuis https://<user>.github.io/LesPetitsPas/
// En dev / preview local, elle est servie a la racine.
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/LesPetitsPas/" : "/",
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    globals: true,
  },
}));
