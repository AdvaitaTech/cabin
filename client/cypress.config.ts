import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8080',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('file:preprocessor', vitePreprocessor())
    },
  },
});
