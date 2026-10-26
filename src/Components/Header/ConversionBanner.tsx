import React, { useState } from 'react';
import { ScalprumComponent, ScalprumComponentProps } from '@scalprum/react-core';
import { useFlag } from '@unleash/proxy-client-react';
import useCurrentUser from '../../hooks/useCurrentUser';

/** Props of RBAC's `./modules/ConversionOptInBanner`. */
type ConversionOptInBannerProps = {
  isOrgAdmin: boolean;
  onGetStarted: () => void;
};

/** Props of RBAC's `./modules/ConversionWizard`. */
type ConversionWizardProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

/**
 * `ScalprumComponent` is exported non-generically, so its props type drops anything meant
 * for the remote. Re-typing it per module keeps the remote's contract checked here, which
 * is the only place it can be checked at all.
 */
const ConversionOptInBannerModule = ScalprumComponent as React.ComponentType<
  ScalprumComponentProps<Record<string, never>, ConversionOptInBannerProps>
>;
const ConversionWizardModule = ScalprumComponent as React.ComponentType<ScalprumComponentProps<Record<string, never>, ConversionWizardProps>>;

/**
 * Where a converted tenant lands.
 *
 * This has to be a full page load, not a router navigation. By the time `onSuccess` fires
 * the tenant is on V2, but this page is not: the opt-in status it was built from is cached
 * both in RBAC's own tenant query and in Chrome's `isKesselOrgOnboarded` behind the nav
 * (120s, identity-scoped). Closing the wizard in place leaves the user on a V1 page with V1
 * nav until those lapse, which makes the breakage intermittent rather than obvious.
 * Reloading re-runs both, so they get V2 pages and V2 nav together.
 */
const leaveForV2Overview = () => window.location.assign('/iam/overview');

/**
 * Invites org admins to convert to workspace-based access management (RBAC V2).
 *
 * Both the banner and the wizard are federated modules owned by RBAC, so the copy and the
 * conversion flow stay in one place. This component only decides *whether* to offer the
 * conversion and wires the banner to the wizard.
 *
 * Gating mirrors RBAC's own in-app consumer (`OverviewContent`): the flag plus org admin.
 * Tenant eligibility is deliberately not checked here — the wizard calls
 * `GET /tenant/opt-in/eligibility/` before converting and names any blocking roles and
 * groups, which is more useful to an admin than silently hiding the banner.
 */
const ConversionBanner = () => {
  const isConversionOptInEnabled = useFlag('platform.conversion.opt-in-banner');
  const { currentUser } = useCurrentUser();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const isOrgAdmin = Boolean(currentUser?.is_org_admin);

  if (!isConversionOptInEnabled || !isOrgAdmin) {
    return null;
  }

  return (
    <>
      {/*
        Scalprum's default ErrorComponent renders a raw stack trace, which must never reach
        the landing page. The banner is promotional, so failing to load it is a non-event —
        render nothing. Same for the fallback: a placeholder would only add layout shift for
        something the user never asked for.
      */}
      <ConversionOptInBannerModule
        scope="rbac"
        module="./modules/ConversionOptInBanner"
        isOrgAdmin={isOrgAdmin}
        onGetStarted={() => setIsWizardOpen(true)}
        fallback={<></>}
        ErrorComponent={<></>}
      />
      {isWizardOpen && (
        <ConversionWizardModule
          scope="rbac"
          module="./modules/ConversionWizard"
          onCancel={() => setIsWizardOpen(false)}
          onSuccess={leaveForV2Overview}
          fallback={<></>}
          ErrorComponent={<></>}
        />
      )}
    </>
  );
};

export default ConversionBanner;
