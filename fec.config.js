const path = require('path');

module.exports = {
  appUrl: ['/staging/starter'],
  sassPrefix: '.frontendStarterApp',
  debug: true,
  useProxy: true,
  proxyVerbose: true,
  /**
   * Change to false after your app is registered in configuration files
   */
  interceptChromeConfig: false,
  /**
   * Add additional webpack plugins
   */
  plugins: [],
  _unstableHotReload: process.env.HOT === 'true',
  routes: {
    ...(process.env.CONFIG_PORT && {
      '/api/chrome-service/v1/static': {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
      '/api/chrome-service/v1/dashboard-templates': {
        host: `http://localhost:${process.env.CONFIG_PORT}`,
      },
    }),
  },
  moduleFederation: {
    moduleName: 'frontendStarterApp',
    exposes: {
      './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
    },
    exclude: ['react-router-dom', 'jotai'],
    shared: [
      {
        'react-router-dom': { singleton: true, requiredVersion: '*' },
        jotai: { singleton: true, requiredVersion: '*' },
      },
    ],
  },
};
