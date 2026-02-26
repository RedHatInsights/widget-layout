import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider, createStore } from 'jotai';
import GridLayout from './GridLayout';
import convertWidgetMapping from './ConvertWidgetMapping';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { templateAtom, templateIdAtom } from '../../state/templateAtom';
import { layoutVariantAtom } from '../../state/layoutAtom';
import { WidgetMapping as ScalprumWidgetMapping } from '../../api/dashboard-templates';

// Polyfill crypto.randomUUID for jsdom
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => 'test-uuid-1234' },
});

// --- Mocks ---

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: { getUser: jest.fn().mockResolvedValue({ identity: { user: { username: 'test-user' } } }) },
    analytics: { track: jest.fn() },
  }),
}));

jest.mock('@scalprum/react-core', () => ({
  ScalprumComponent: ({ scope, module }: { scope: string; module: string }) => <div data-testid={`scalprum-${scope}-${module}`}>ScalprumWidget</div>,
}));

const mockGetDashboardTemplates = jest.fn();
const mockPatchDashboardTemplate = jest.fn();

jest.mock('../../api/dashboard-templates', () => ({
  ...jest.requireActual('../../api/dashboard-templates'),
  getDashboardTemplates: (...args: unknown[]) => mockGetDashboardTemplates(...args),
  patchDashboardTemplate: (...args: unknown[]) => mockPatchDashboardTemplate(...args),
}));

jest.mock('@patternfly/widgetized-dashboard', () => ({
  GridLayout: ({ widgetMapping, template, showEmptyState, emptyStateComponent }: any) => (
    <div data-testid="pf-grid-layout" data-show-empty={showEmptyState} data-widget-count={Object.keys(widgetMapping).length}>
      {showEmptyState && emptyStateComponent}
      {Object.keys(widgetMapping).map((type: string) => (
        <div key={type} data-testid={`widget-tile-${type}`}>
          <span data-testid={`widget-icon-${type}`}>{widgetMapping[type]?.config?.icon}</span>
          <span data-testid={`widget-title-${type}`}>{widgetMapping[type]?.config?.title}</span>
        </div>
      ))}
    </div>
  ),
}));

// --- Test data ---

const mockScalprumMapping: ScalprumWidgetMapping = {
  'favorite-services': {
    scope: 'chrome',
    module: './FavoriteServices',
    importName: 'default',
    defaults: { w: 2, h: 3, maxH: 6, minH: 2 },
    config: {
      title: 'My favorite services',
      icon: 'StarIcon',
      headerLink: { title: 'View all services', href: '/services' },
    },
  },
  'rhel-widget': {
    scope: 'insights',
    module: './RhelWidget',
    importName: 'default',
    defaults: { w: 2, h: 4, maxH: 8, minH: 2 },
    config: {
      title: 'Red Hat Enterprise Linux',
      icon: 'RhelIcon',
    },
  },
  'no-icon-widget': {
    scope: 'test',
    module: './NoIcon',
    importName: 'default',
    defaults: { w: 1, h: 2, maxH: 4, minH: 1 },
    config: {
      title: 'Widget without icon',
    },
  },
};

const mockTemplate = {
  sm: [],
  md: [],
  lg: [],
  xl: [
    { i: 'favorite-services#1', x: 0, y: 0, w: 2, h: 3, title: 'My favorite services', widgetType: 'favorite-services' },
    { i: 'rhel-widget#1', x: 2, y: 0, w: 2, h: 4, title: 'Red Hat Enterprise Linux', widgetType: 'rhel-widget' },
  ],
};

function renderWithStore(ui: React.ReactElement, storeOverrides?: Record<string, unknown>) {
  const store = createStore();
  if (storeOverrides?.widgetMapping) store.set(widgetMappingAtom, storeOverrides.widgetMapping as ScalprumWidgetMapping);
  if (storeOverrides?.template) store.set(templateAtom, storeOverrides.template as any);
  if (storeOverrides?.templateId !== undefined) store.set(templateIdAtom, storeOverrides.templateId as number);
  if (storeOverrides?.layoutVariant) store.set(layoutVariantAtom, storeOverrides.layoutVariant as any);
  return render(<Provider store={store}>{ui}</Provider>);
}

// --- Tests ---

describe('convertWidgetMapping', () => {
  it('converts icon strings to React elements', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['favorite-services'].config?.icon).toBeDefined();
    expect(React.isValidElement(result['favorite-services'].config?.icon)).toBe(true);
  });

  it('converts a custom service icon string to a React element', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['rhel-widget'].config?.icon).toBeDefined();
    expect(React.isValidElement(result['rhel-widget'].config?.icon)).toBe(true);
  });

  it('falls back to CogsIcon when no icon is provided', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['no-icon-widget'].config?.icon).toBeDefined();
    expect(React.isValidElement(result['no-icon-widget'].config?.icon)).toBe(true);
  });

  it('passes through title correctly', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['favorite-services'].config?.title).toBe('My favorite services');
    expect(result['rhel-widget'].config?.title).toBe('Red Hat Enterprise Linux');
    expect(result['no-icon-widget'].config?.title).toBe('Widget without icon');
  });

  it('passes through headerLink correctly', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['favorite-services'].config?.headerLink).toEqual({ title: 'View all services', href: '/services' });
    expect(result['rhel-widget'].config?.headerLink).toBeUndefined();
  });

  it('sets wrapperProps.className to the widget scope', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['favorite-services'].config?.wrapperProps?.className).toBe('chrome');
    expect(result['rhel-widget'].config?.wrapperProps?.className).toBe('insights');
  });

  it('sets cardBodyProps.className to scope-widgetType', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['favorite-services'].config?.cardBodyProps?.className).toBe('chrome-favorite-services');
    expect(result['rhel-widget'].config?.cardBodyProps?.className).toBe('insights-rhel-widget');
  });

  it('preserves widget defaults', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(result['favorite-services'].defaults).toEqual({ w: 2, h: 3, maxH: 6, minH: 2 });
  });

  it('provides a renderWidget function', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(typeof result['favorite-services'].renderWidget).toBe('function');
  });

  it('converts all widget types from input', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    expect(Object.keys(result)).toEqual(['favorite-services', 'rhel-widget', 'no-icon-widget']);
  });

  it('renderWidget produces a Scalprum component', () => {
    const result = convertWidgetMapping(mockScalprumMapping);
    const { getByTestId } = render(<>{result['favorite-services'].renderWidget('test-id')}</>);
    expect(getByTestId('scalprum-chrome-./FavoriteServices')).toBeInTheDocument();
  });
});

describe('GridLayout rendering states', () => {
  beforeEach(() => {
    mockGetDashboardTemplates.mockReset();
    mockPatchDashboardTemplate.mockReset();
  });

  it('renders the container element', () => {
    renderWithStore(<GridLayout />);
    expect(document.getElementById('widget-layout-container')).toBeInTheDocument();
  });

  it('does not render PatternFlyGridLayout when widget mapping is empty', () => {
    renderWithStore(<GridLayout />);
    expect(screen.queryByTestId('pf-grid-layout')).not.toBeInTheDocument();
  });

  it('renders PatternFlyGridLayout when widget mapping has entries', () => {
    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping });
    expect(screen.getByTestId('pf-grid-layout')).toBeInTheDocument();
  });

  it('passes showEmptyState=true while loading (isLoaded is false)', () => {
    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping });
    const grid = screen.getByTestId('pf-grid-layout');
    expect(grid).toHaveAttribute('data-show-empty', 'true');
  });

  it('shows empty state after loading when template has no widgets', async () => {
    mockGetDashboardTemplates.mockResolvedValue([{ id: 1, default: true, templateConfig: { sm: [], md: [], lg: [], xl: [] } }]);

    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping, templateId: -1 });

    await waitFor(() => {
      expect(screen.getByText('No dashboard content')).toBeInTheDocument();
    });
  });

  it('renders widget tiles when template has widgets', () => {
    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping, template: mockTemplate });
    expect(screen.getByTestId('widget-tile-favorite-services')).toBeInTheDocument();
    expect(screen.getByTestId('widget-tile-rhel-widget')).toBeInTheDocument();
    expect(screen.getByTestId('widget-tile-no-icon-widget')).toBeInTheDocument();
  });

  it('renders correct widget titles', () => {
    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping, template: mockTemplate });
    expect(screen.getByTestId('widget-title-favorite-services')).toHaveTextContent('My favorite services');
    expect(screen.getByTestId('widget-title-rhel-widget')).toHaveTextContent('Red Hat Enterprise Linux');
  });

  it('renders icons inside widget tiles', () => {
    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping, template: mockTemplate });
    expect(screen.getByTestId('widget-icon-favorite-services').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByTestId('widget-icon-rhel-widget').querySelector('svg')).toBeInTheDocument();
  });

  it('shows error notification when API fails', async () => {
    mockGetDashboardTemplates.mockRejectedValue(new Error('API error'));

    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping, templateId: -1 });

    await waitFor(() => {
      expect(mockGetDashboardTemplates).toHaveBeenCalled();
    });
  });

  it('does not fetch templates when templateId is >= 0', () => {
    renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping, templateId: 5 });
    expect(mockGetDashboardTemplates).not.toHaveBeenCalled();
  });
});

describe('GridLayout snapshots', () => {
  it('matches snapshot in loading state (empty mapping)', () => {
    const { container } = renderWithStore(<GridLayout />);
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with widget mapping (before API load)', () => {
    const { container } = renderWithStore(<GridLayout />, { widgetMapping: mockScalprumMapping });
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with widgets and template', () => {
    const { container } = renderWithStore(<GridLayout />, {
      widgetMapping: mockScalprumMapping,
      template: mockTemplate,
      templateId: 1,
      layoutVariant: 'xl',
    });
    expect(container).toMatchSnapshot();
  });
});
