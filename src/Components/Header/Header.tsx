import './Header.scss';

import {
  Button,
  ButtonVariant,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useState } from 'react';
import { CodeIcon, CopyIcon, EllipsisVIcon, PlusCircleIcon, UsersIcon } from '@patternfly/react-icons';
import { useAtom, useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { templateIdAtom } from '../../state/templateAtom';
import { resetDashboardTemplate } from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { WarningModal } from '@patternfly/react-component-groups';
import { Link } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';

export const KebabDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    console.log('selected', value);
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      popperProps={{ position: 'end' }}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="kebab dropdown toggle"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<EllipsisVIcon />}
        />
      )}
      shouldFocusToggleOnSelect
    >
      <DropdownList>
        <DropdownItem key="copy-config" isDisabled icon={<CodeIcon />}>
          Copy configuration string
        </DropdownItem>
        <DropdownItem key="duplicate-dashboard" isDisabled icon={<CopyIcon />}>
          Duplicate dashboard
        </DropdownItem>
        <DropdownItem key="share-dashboard" isDisabled icon={<UsersIcon />}>
          Share dashboard
        </DropdownItem>
        <Divider component="li" key="separator" />
        <MenuItem component={(props) => <Link {...props} to="/staging/dashboard-hub" />} description="Create, manage, share dashboards">
          Dashboard Hub
        </MenuItem>
      </DropdownList>
    </Dropdown>
  );
};

const Controls = () => {
  const [isOpen, setIsOpen] = useState(false);
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
  const isDashboardHub = useFlag('platform.chrome.dashboard-hub');
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
              {isDashboardHub && (
                <ToolbarItem>
                  <KebabDropdown />
                </ToolbarItem>
              )}
            </ToolbarContent>
          </Toolbar>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default Header;
