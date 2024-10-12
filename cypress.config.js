const { defineConfig } = require('cypress')
module.exports = defineConfig({
  e2e: {
    setupNodeEvents (on, config) {
      // node events listeners here
    }
  }
})
