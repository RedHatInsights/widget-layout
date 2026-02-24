import './Header.scss';

import {
  AlertActionLink,
  Button,
  ButtonVariant,
  Content,
  Dropdown,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemHeader,
  PageSection,
  Split,
  SplitItem,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React from 'react';
import { EllipsisVIcon, PlusCircleIcon, UsersIcon } from '@patternfly/react-icons';
import { useAtom, useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { templateIdAtom } from '../../state/templateAtom';
import { resetDashboardTemplate } from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { WarningModal } from '@patternfly/react-component-groups';
import { Alert } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

const Controls = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggleOpen = useSetAtom(drawerExpandedAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);

  return (
    <>
      <WarningModal
        withCheckbox
        isOpen={isOpen}
        title="Reset layout?"
        checkboxLabel="I understand that this action cannot be undone"
        confirmButtonLabel="Reset layout"
        confirmButtonVariant={ButtonVariant.danger}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          setIsOpen(false);
          if (templateId > 0) {
            resetDashboardTemplate(templateId).then(() => {
              setTemplateId(NaN);
            });
          }
        }}
      >
        All your widget customizations will be discarded.
      </WarningModal>
      <ToolbarGroup className="pf-v6-u-flex-direction-column-reverse pf-v6-u-flex-direction-row-reverse-on-md pf-v6-u-flex-direction-row-on-lg">
        <ToolbarItem>
          <Button
            ouiaId="widget-layout-reset-button"
            onClick={() => {
              setIsOpen(true);
            }}
            variant={ButtonVariant.link}
          >
            Reset to default
          </Button>
        </ToolbarItem>
        <ToolbarItem className="pf-v6-u-pr-sm pf-v6-u-pr-0-on-lg pf-v6-u-pb-xs pf-v6-u-pb-0-on-lg">
          <Button
            onClick={() => {
              toggleOpen((prev) => !prev);
            }}
            variant="secondary"
            icon={<PlusCircleIcon />}
            ouiaId="add-widget-button"
          >
            Add widgets
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
    </>
  );
};

const Header = () => {
  const { currentUser } = useCurrentUser();
  const userName = currentUser?.first_name && currentUser?.last_name ? ` ${currentUser.first_name} ${currentUser.last_name}` : currentUser?.username;

  const [isWizardOpen, setIsWizardOpen] = React.useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = React.useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);
  const onToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--header pf-v6-u-p-lg pf-v6-u-p-r-0-on-sm">
      <Flex className="widg-l-flex--header" direction={{ default: 'column', lg: 'row' }}>
        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
          <Content>
            <Content component="h1">Hi{userName ? `, ${userName}` : '!'}</Content>
            <Content component="h2" className="pf-v6-u-mt-0">
              Welcome to your Hybrid Cloud Console.
            </Content>
          </Content>
        </FlexItem>
        <FlexItem align={{ default: 'alignLeft', lg: 'alignRight' }}>
          <Toolbar>
            <ToolbarContent>
              <Controls />
            </ToolbarContent>
          </Toolbar>
        </FlexItem>
      </Flex>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Alert
            title={
              <>
                <Split>
                  <SplitItem>
                    <h1>You are qualified to opt into the workspace user access model for your organization.</h1>
                  </SplitItem>
                  <SplitItem isFilled></SplitItem>
                  <SplitItem>
                    <Dropdown
                      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                        <MenuToggle ref={toggleRef} isExpanded={isDropdownOpen} onClick={onToggle} variant="plain" icon={<EllipsisVIcon />} />
                      )}
                    ></Dropdown>
                  </SplitItem>
                </Split>
              </>
            }
            customIcon={<UsersIcon />}
            ouiaId="enable-workspaces-alert"
            className="enable-workspaces-alert"
            actionLinks={
              <Flex>
                <FlexItem>
                  <Switch
                    className="pf-v6-u-mt-xs"
                    isChecked={isWizardOpen}
                    onChange={(_e, value) => setIsWizardOpen(value)}
                    label="Enable workspaces"
                    ouiaId="enable-workspaces-switch"
                    id="enable-workspaces-switch"
                  />
                </FlexItem>
                <FlexItem>
                  <AlertActionLink component="a" href="/iam/user-access/workspaces">
                    Workspace hierarchy
                  </AlertActionLink>
                </FlexItem>
              </Flex>
            }
          ></Alert>
          {isWizardOpen && (
            <AsyncComponent
              appName="rbac"
              module="./CreateWorkspaceWizardModule"
              scope="rbac"
              onCancel={() => setIsWizardOpen(!isWizardOpen)}
              afterSubmit={() => setIsConfirmed(true)}
            />
          )}
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default Header;
