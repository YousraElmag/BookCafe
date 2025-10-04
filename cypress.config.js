const { defineConfig } = require("cypress");

module.exports = defineConfig({
  backendUrl: "https://bookcafe2.onrender.com",
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config);
    },
    specPattern: "cypress/e2e/**/*.spec.js",
    baseUrl: "http://localhost:8080",
  },
});
