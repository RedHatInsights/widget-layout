const path = require('path');
const dependencies = require('./package.json').dependencies;

module.exports = {
  appUrl: ['/staging/starter'],
  sassPrefix: process.env.CONFIG_PORT || process.env.PROXY ? '.frontendStarterApp' : '.widgetLayout',
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
    moduleName: process.env.CONFIG_PORT || process.env.PROXY ? 'frontendStarterApp' : 'widgetLayout', // overwriting starter app locally for ease of development
    exposes: {
      './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
      // TODO these will likely need to be restructured to be more consumable
      './WidgetLayout': path.resolve(__dirname, './src/Components/DnDLayout/GridLayout.tsx'),
      './WidgetDrawer': path.resolve(__dirname, './src/Components/WidgetDrawer/WidgetDrawer.tsx'),
      './WidgetHeader': path.resolve(__dirname, './src/Components/Header/Header.tsx'),
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
