import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import { IntlProvider } from 'react-intl';
import { Controls } from './Header';
import { loadedLayoutTypeAtom, templateIdAtom } from '../../state/templateAtom';

const mockResetDashboardTemplate = jest.fn().mockResolvedValue(undefined);
jest.mock('../../hooks/useApi', () => ({
  __esModule: true,
  useApi: () => ({
    resetDashboardTemplate: mockResetDashboardTemplate,
  }),
}));

// react-component-groups pulls in react-jss (ESM-only), which the jest
// transform allowlist does not cover — stub the pieces Header uses
jest.mock('@patternfly/react-component-groups', () => ({
  __esModule: true,
  WarningModal: () => null,
}));

const renderControls = (layoutType: string | undefined, store = createStore()) => {
  const wrapper = ({ children }: { children?: React.ReactNode }) => (
    <IntlProvider locale="en">
      <Provider store={store}>{children}</Provider>
    </IntlProvider>
  );
  render(<Controls layoutType={layoutType} />, { wrapper });
  return store;
};

describe('Controls', () => {
  beforeEach(() => {
    mockResetDashboardTemplate.mockClear();
  });

  it('disables reset while the shared store holds another layout type selection', () => {
    const store = createStore();
    store.set(templateIdAtom, 11);
    store.set(loadedLayoutTypeAtom, 'landing-landingPage');

    renderControls('dashboard-insightsDashboard', store);

    // resetting now would discard the previous dashboard's customizations
    expect(screen.getByRole('button', { name: 'Reset to default' })).toBeDisabled();
  });

  it('enables reset once the loaded layout type matches', () => {
    const store = createStore();
    store.set(templateIdAtom, 11);
    store.set(loadedLayoutTypeAtom, 'dashboard-insightsDashboard');

    renderControls('dashboard-insightsDashboard', store);

    expect(screen.getByRole('button', { name: 'Reset to default' })).toBeEnabled();
  });
});
