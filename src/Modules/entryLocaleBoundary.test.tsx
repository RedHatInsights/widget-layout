import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Direct-entry integration tests: each federated entry point must carry its
 * own locale boundary. These tests mount the entries exactly as the shell
 * would — WITHOUT any injected IntlProvider — and assert that localized
 * text renders. The react-intl automock is disabled so the REAL provider
 * and context are exercised: if an entry loses its IntlMessagesProvider,
 * useIntl throws and these tests fail.
 */
jest.unmock('react-intl');


Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
});

const mockChromeLanguage = { value: undefined as string | undefined };
const chromeMock = () => ({
  auth: { getUser: jest.fn().mockResolvedValue({ identity: { user: { username: 'test-user' } } }) },
  analytics: { track: jest.fn() },
  visibilityFunctions: undefined,
  get language() {
    return mockChromeLanguage.value;
  },
});

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: chromeMock,
  useChrome: chromeMock,
}));

// Nonempty French catalog so the entry tests also cover catalog loading.
jest.mock('../../messages/fr.json', () => ({
  __esModule: true,
  default: { 'widgetLayout.header.greeting': 'Bonjour !' },
}));

jest.mock('@scalprum/react-core', () => ({
  ScalprumComponent: ({ scope, module }: { scope: string; module: string }) => (
    <div data-testid={`scalprum-${scope}-${module}`}>ScalprumWidget</div>
  ),
}));

jest.mock('@patternfly/widgetized-dashboard', () => ({
  GridLayout: () => <div data-testid="pf-grid-layout">grid</div>,
}));

jest.mock('@redhat-cloud-services/frontend-components-notifications/Portal', () => ({
  __esModule: true,
  default: () => <div data-testid="notification-portal" />,
}));

jest.mock('../api/dashboard-templates-new', () => ({
  ...jest.requireActual('../api/dashboard-templates-new'),
  getDashboardTemplates: jest.fn().mockResolvedValue({ data: [] }),
  getDefaultTemplate: jest.fn().mockRejectedValue(new Error('No custom default template found')),
  mapTemplateConfigToExtendedTemplateConfig: jest.fn(() => EMPTY_CONFIG),
  patchDashboardTemplate: jest.fn(),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: () => false,
}));

jest.mock('../hooks/useCurrentUser', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue({ currentUser: undefined, isLoading: false }),
}));

jest.mock('../hooks/useApi', () => ({
  useApi: () => ({
    getDashboardTemplates: jest.fn().mockResolvedValue({ data: [] }),
    getDefaultTemplate: jest.fn().mockRejectedValue(new Error('No custom default template found')),
    patchDashboardTemplate: jest.fn(),
  }),
}));

const mockFetchDashboards = jest.fn().mockResolvedValue(undefined);
const EMPTY_CONFIG = {};
jest.mock('../hooks/useGetDashboards', () => ({
  __esModule: true,
  default: () => ({ dashboards: [], fetchDashboards: mockFetchDashboards }),
}));

// react-component-groups pulls react-jss (ESM) which jest does not transform;
// mock every import path the entry chain uses.
jest.mock('@patternfly/react-component-groups', () => ({
  WarningModal: () => <div data-testid="warning-modal" />,
}));
jest.mock('@patternfly/react-component-groups/dist/dynamic/PageHeader', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="page-header">{children}</div>,
}));


import DefaultRoute from '../Routes/Default/Default';
import DashboardHub from './DashboardHub';

describe('federated entry locale boundaries', () => {
  it('./WidgetLayout renders localized text without an injected provider', async () => {
    render(<DefaultRoute layoutType="landing-landingPage" />);
    // Header greeting renders through the entry's own IntlMessagesProvider
    await waitFor(() => {
      expect(screen.getByText('Hi!')).toBeInTheDocument();
    });
  });

  it('./DashboardHub renders localized text without an injected provider', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <DashboardHub />
      </MemoryRouter>
    );
    // The hub page title renders through the entry's own IntlMessagesProvider
    await waitFor(() => {
      expect(screen.getAllByText('Dashboard Hub').length).toBeGreaterThan(0);
    });
  });
});

describe('catalog loading through the entry boundary', () => {
  it('renders the French catalog when chrome reports language fr', async () => {
    mockChromeLanguage.value = 'fr';
    try {
      render(<DefaultRoute layoutType="landing-landingPage" />);
      await waitFor(() => {
        expect(screen.getByText('Bonjour !')).toBeInTheDocument();
      });
    } finally {
      mockChromeLanguage.value = undefined;
    }
  });
});
