const { defineConfig } = require('cypress')

module.exports = defineConfig({
  projectId: 'rebszq',
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/index.js',
    defaultCommandTimeout: 10000
  }
})
