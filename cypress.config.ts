import { defineConfig } from 'cypress';

export default defineConfig({
  numTestsKeptInMemory: 0,
  component: {
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    excludeSpecPattern: ['/snapshots/*', '/src/*'],
    video: false,
    devServer: {
      framework: 'react',
      bundler: 'webpack',
      webpackConfig: require('./config/webpack.cy.config.js'),
    },
  },
});
