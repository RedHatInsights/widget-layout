import React from 'react';
import { IntlMessagesProvider, useChromeLocale } from './shared/i18n';
import App from './App';

const AppEntry = () => {
  const locale = useChromeLocale();
  return (
    <IntlMessagesProvider locale={locale}>
      <App />
    </IntlMessagesProvider>
  );
};

export default AppEntry;
