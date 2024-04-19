const path = require('path');
const dependencies = require('./package.json').dependencies;

module.exports = {
  appUrl: ['/staging/widget-layout'],
  sassPrefix: '.widgetLayout, .landing',
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
    exclude: ['@patternfly/react-core', 'jotai', 'react', 'react-dom', 'react-redux', 'react-router-dom'],
    shared: [
      {
        '@patternfly/react-core': { singleton: true, requiredVersion: dependencies['@patternfly/react-core'] },
        jotai: { singleton: true, requiredVersion: '*' },
        react: { singleton: true, requiredVersion: dependencies.react },
        'react-dom': { singleton: true, requiredVersion: dependencies['react-dom'] },
        'react-redux': { singleton: true, requiredVersion: dependencies['react-redux'] },
        'react-router-dom': { singleton: true, requiredVersion: dependencies['react-router-dom'] },
      },
    ],
  },
};
