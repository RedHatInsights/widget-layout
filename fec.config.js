const path = require('path');
const dependencies = require('./package.json').dependencies;

module.exports = {
  appUrl: ['/staging/widget-layout'],
  sassPrefix: '.widgetLayout, .landing',
  frontendCRDPath: path.resolve(__dirname, './deploy/frontend.yaml'),
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
    moduleName: 'widgetLayout',
    exposes: {
      './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
      './WidgetLayout': path.resolve(__dirname, './src/Routes/Default/Default.tsx'),
    },
    exclude: ['react-router-dom'],
    shared: [
      {
        'react-router-dom': { singleton: true, version: dependencies['react-router-dom'], requiredVersion: '*' },
      },
    ],
  },
};
