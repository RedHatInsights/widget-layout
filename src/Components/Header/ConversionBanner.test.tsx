import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ConversionBanner from './ConversionBanner';

// --- Mocks ---

const mockUseFlag = jest.fn();
jest.mock('@unleash/proxy-client-react', () => ({
  useFlag: (flag: string) => mockUseFlag(flag),
}));

const mockGetUser = jest.fn();
jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  __esModule: true,
  default: () => ({
    auth: { getUser: mockGetUser },
  }),
}));

// Stands in for the remote modules RBAC owns. Rendering the props we pass lets the test
// assert the contract (scope, module, callbacks) without loading anything federated.
jest.mock('@scalprum/react-core', () => ({
  ScalprumComponent: ({ scope, module, isOrgAdmin, onGetStarted, onCancel, onSuccess }: Record<string, any>) => (
    <div data-testid={`scalprum-${scope}-${module}`} data-is-org-admin={isOrgAdmin}>
      {onGetStarted && <button onClick={onGetStarted}>Get started now</button>}
      {onCancel && <button onClick={onCancel}>Cancel</button>}
      {onSuccess && <button onClick={onSuccess}>Finish</button>}
    </div>
  ),
}));

const BANNER = 'scalprum-rbac-./modules/ConversionOptInBanner';
const WIZARD = 'scalprum-rbac-./modules/ConversionWizard';

const setUser = (isOrgAdmin: boolean) => mockGetUser.mockResolvedValue({ identity: { user: { username: 'test-user', is_org_admin: isOrgAdmin } } });

describe('ConversionBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFlag.mockReturnValue(true);
    setUser(true);
  });

  it('renders the RBAC banner for org admins when the flag is on', async () => {
    render(<ConversionBanner />);

    expect(await screen.findByTestId(BANNER)).toBeInTheDocument();
    expect(mockUseFlag).toHaveBeenCalledWith('platform.conversion.opt-in-banner');
  });

  it('renders nothing when the flag is off', async () => {
    mockUseFlag.mockReturnValue(false);
    render(<ConversionBanner />);

    // Wait for the identity to resolve first, otherwise this passes on the pending state
    // rather than on the flag.
    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(screen.queryByTestId(BANNER)).not.toBeInTheDocument();
  });

  it('renders nothing for non-admins', async () => {
    setUser(false);
    render(<ConversionBanner />);

    await waitFor(() => expect(mockGetUser).toHaveBeenCalled());
    expect(screen.queryByTestId(BANNER)).not.toBeInTheDocument();
  });

  it('does not mount the wizard until "Get started" is clicked', async () => {
    render(<ConversionBanner />);
    await screen.findByTestId(BANNER);

    expect(screen.queryByTestId(WIZARD)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Get started now' }));

    expect(screen.getByTestId(WIZARD)).toBeInTheDocument();
  });

  it('unmounts the wizard on cancel', async () => {
    render(<ConversionBanner />);
    await screen.findByTestId(BANNER);

    fireEvent.click(screen.getByRole('button', { name: 'Get started now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByTestId(WIZARD)).not.toBeInTheDocument();
  });

  it('leaves for the V2 overview with a full page load on success', async () => {
    // A router push would strand the user on a V1 page with stale V1 nav, so this must be
    // a real navigation. See the comment on leaveForV2Overview.
    const assign = jest.fn();
    Object.defineProperty(window, 'location', { value: { assign }, writable: true });

    render(<ConversionBanner />);
    await screen.findByTestId(BANNER);

    fireEvent.click(screen.getByRole('button', { name: 'Get started now' }));
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

    expect(assign).toHaveBeenCalledWith('/iam/overview');
  });
});
