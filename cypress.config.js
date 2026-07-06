const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      // Example: on('task', { ... })
    },
    baseUrl: "http://localhost:1234",
    supportFile: false,

    // Video and screenshots configuration
    video: true,
    videoCompression: 32, // Lower quality for smaller files (0-100)
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/downloads/screenshots",
    videosFolder: "cypress/downloads/videos",

    // Timeouts (in milliseconds)
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,

    // Retry configuration for flaky tests
    retries: {
      runMode: 2,      // Retry failed tests 2 times in CI
      openMode: 0      // No retries in interactive mode
    },

    // Viewport configuration
    viewportWidth: 1280,
    viewportHeight: 720,

    // Reporter configuration
    reporter: "spec",
    reporterOptions: {
      mochaFile: "cypress/results/test-output-[hash].xml",
      toConsole: true
    },

    // Chrome Web Security (if needed for cross-origin)
    chromeWebSecurity: false,


    // Test isolation - each test runs in a clean state
    testIsolation: true,

    // Avoid performance issues with large files
    modifyObstructiveCode: false,

    // Disable insecure Cypress.env() access from browser code
    allowCypressEnv: false
  },

  // Component testing (if needed in future)
  component: {
    devServer: {
      framework: "html",
      bundler: "webpack"
    }
  }
});
