const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:1234',
    supportFile: false,

    video: false,
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/downloads/screenshots',

    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,

    retries: {
      runMode: 1,
      openMode: 0
    },

    viewportWidth: 1280,
    viewportHeight: 720,

    reporter: 'spec',
    reporterOptions: {
      mochaFile: 'cypress/results/test-output-[hash].xml',
      toConsole: true
    },

    testIsolation: true,
    modifyObstructiveCode: false
  }
});
