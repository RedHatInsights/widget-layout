import './Header.scss';

import {
  Button,
  ButtonVariant,
  Content,
  Divider,
  DrilldownMenu,
  Flex,
  FlexItem,
  Menu,
  MenuContainer,
  MenuContent,
  MenuItem,
  MenuItemAction,
  MenuList,
  MenuToggle,
  PageSection,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import React, { useRef, useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { CodeIcon, CopyIcon, EditAltIcon, EllipsisVIcon, PlusCircleIcon, PlusIcon, ThIcon, TimesIcon } from '@patternfly/react-icons';
import { useAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { templateIdAtom } from '../../state/templateAtom';
import { useApi } from '../../hooks/useApi';
import useCurrentUser from '../../hooks/useCurrentUser';
import { WarningModal } from '@patternfly/react-component-groups';
import { Link, useNavigate } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';
import useGetDashboards from '../../hooks/useGetDashboards';
import { CreateModal } from '../CreateModal/CreateModal';
import { ImportModal } from '../DashboardHub/ImportModal/ImportModal';
import { DuplicateModal } from '../DuplicateModal/DuplicateModal';
import ConversionBanner from './ConversionBanner';

const messages = defineMessages({
  kebabDropdownToggle: {
    id: 'widgetLayout.header.kebabDropdownToggle',
    description: 'Kebab dropdown toggle aria label',
    defaultMessage: 'kebab dropdown toggle',
  },
  edit: {
    id: 'widgetLayout.header.edit',
    description: 'Edit dashboard action aria label',
    defaultMessage: 'Edit',
  },
  createNewDashboard: {
    id: 'widgetLayout.header.createNewDashboard',
    description: 'Menu item to create a new dashboard',
    defaultMessage: 'Create new dashboard',
  },
  createFromBlank: {
    id: 'widgetLayout.header.createFromBlank',
    description: 'Menu item to create a dashboard from blank',
    defaultMessage: 'Create from blank',
  },
  importFromConfigString: {
    id: 'widgetLayout.header.importFromConfigString',
    description: 'Menu item to import a dashboard from a config string',
    defaultMessage: 'Import from config string',
  },
  duplicateExisting: {
    id: 'widgetLayout.header.duplicateExisting',
    description: 'Menu item to duplicate an existing dashboard',
    defaultMessage: 'Duplicate existing',
  },
  dashboardHub: {
    id: 'widgetLayout.header.dashboardHub',
    description: 'Dashboard Hub link label',
    defaultMessage: 'Dashboard Hub',
  },
  dashboardHubDescription: {
    id: 'widgetLayout.header.dashboardHubDescription',
    description: 'Dashboard Hub link description',
    defaultMessage: 'Create, manage, share dashboards',
  },
  resetLayoutTitle: {
    id: 'widgetLayout.header.resetLayoutTitle',
    description: 'Reset layout confirmation modal title',
    defaultMessage: 'Reset layout?',
  },
  resetLayoutCheckbox: {
    id: 'widgetLayout.header.resetLayoutCheckbox',
    description: 'Reset layout confirmation checkbox label',
    defaultMessage: 'I understand that this action cannot be undone',
  },
  resetLayoutConfirm: {
    id: 'widgetLayout.header.resetLayoutConfirm',
    description: 'Reset layout confirmation button label',
    defaultMessage: 'Reset layout',
  },
  resetLayoutBody: {
    id: 'widgetLayout.header.resetLayoutBody',
    description: 'Reset layout confirmation modal body',
    defaultMessage: 'All your widget customizations will be discarded.',
  },
  resetToDefault: {
    id: 'widgetLayout.header.resetToDefault',
    description: 'Reset to default button label',
    defaultMessage: 'Reset to default',
  },
  addWidgets: {
    id: 'widgetLayout.header.addWidgets',
    description: 'Add widgets button label',
    defaultMessage: 'Add widgets',
  },
  closeWidgetPanel: {
    id: 'widgetLayout.header.closeWidgetPanel',
    description: 'Close widget panel button label',
    defaultMessage: 'Close widget panel',
  },
  greeting: {
    id: 'widgetLayout.header.greeting',
    description: 'Header greeting without a user name',
    defaultMessage: 'Hi!',
  },
  greetingNamed: {
    id: 'widgetLayout.header.greetingNamed',
    description: 'Header greeting with the user name',
    defaultMessage: 'Hi, {name}',
  },
  welcome: {
    id: 'widgetLayout.header.welcome',
    description: 'Header welcome subtitle',
    defaultMessage: 'Welcome to your Hybrid Cloud Console.',
  },
});

export const KebabDropdown = ({ layoutType }: { layoutType?: string }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { dashboards } = useGetDashboards();
  const [templateId] = useAtom(templateIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [drilldownState, setDrilldownState] = useState({
    menuDrilledIn: [] as string[],
    drilldownPath: [] as string[],
    activeMenu: 'kebab-rootMenu',
  });
  const [menuHeights, setMenuHeights] = useState<Record<string, number>>({});
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    setDrilldownState({
      menuDrilledIn: [],
      drilldownPath: [],
      activeMenu: 'kebab-rootMenu',
    });
  };

  const drillIn = (_event: React.KeyboardEvent | React.MouseEvent, fromMenuId: string, toMenuId: string, pathId: string) => {
    setDrilldownState((prev) => ({
      menuDrilledIn: [...prev.menuDrilledIn, fromMenuId],
      drilldownPath: [...prev.drilldownPath, pathId],
      activeMenu: toMenuId,
    }));
  };

  const drillOut = (_event: React.KeyboardEvent | React.MouseEvent, toMenuId: string) => {
    setDrilldownState((prev) => ({
      menuDrilledIn: prev.menuDrilledIn.slice(0, -1),
      drilldownPath: prev.drilldownPath.slice(0, -1),
      activeMenu: toMenuId,
    }));
  };

  const setHeight = (menuId: string, height: number) => {
    if (menuHeights[menuId] === undefined || (menuId !== 'kebab-rootMenu' && menuHeights[menuId] !== height)) {
      setMenuHeights({ ...menuHeights, [menuId]: height });
    }
  };

  const toggle = (
    <MenuToggle
      ref={toggleRef}
      aria-label={intl.formatMessage(messages.kebabDropdownToggle)}
      variant="plain"
      onClick={onToggleClick}
      isExpanded={isOpen}
      icon={<EllipsisVIcon />}
    />
  );

  const menu = (
    <Menu
      id="kebab-rootMenu"
      containsDrilldown
      drilldownItemPath={drilldownState.drilldownPath}
      drilledInMenus={drilldownState.menuDrilledIn}
      activeMenu={drilldownState.activeMenu}
      onDrillIn={drillIn}
      onDrillOut={drillOut}
      onGetMenuHeight={setHeight}
      ref={menuRef}
    >
      <MenuContent menuHeight={drilldownState.activeMenu !== 'kebab-rootMenu' ? `${menuHeights[drilldownState.activeMenu]}px` : undefined}>
        <MenuList>
          {dashboards.length > 0 && (
            <>
              {dashboards.map((dashboard) => (
                <MenuItem
                  key={dashboard.id}
                  itemId={`dashboard-${dashboard.id}`}
                  isSelected={dashboard.id === templateId}
                  actions={
                    <MenuItemAction
                      icon={<EditAltIcon />}
                      actionId="edit"
                      onClick={() => navigate(`/dashboard-hub/${dashboard.id}`)}
                      aria-label={intl.formatMessage(messages.edit)}
                    />
                  }
                  component={(props) => <Link {...props} to={`/dashboard-hub/${dashboard.id}`} />}
                >
                  {dashboard.dashboardName}
                </MenuItem>
              ))}
              <Divider component="li" />
            </>
          )}
          <MenuItem
            itemId="group:create"
            direction="down"
            icon={<PlusIcon />}
            drilldownMenu={
              <DrilldownMenu id="kebab-drilldownMenuCreate">
                <MenuItem itemId="group:create_breadcrumb" direction="up" icon={<PlusCircleIcon />}>
                  <FormattedMessage {...messages.createNewDashboard} />
                </MenuItem>
                <Divider component="li" />
                <MenuItem
                  itemId="create-blank"
                  icon={<ThIcon />}
                  onClick={() => {
                    setIsCreateModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <FormattedMessage {...messages.createFromBlank} />
                </MenuItem>
                <MenuItem
                  itemId="import-config"
                  icon={<CodeIcon />}
                  onClick={() => {
                    setIsImportModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <FormattedMessage {...messages.importFromConfigString} />
                </MenuItem>
                <MenuItem
                  itemId="duplicate-dashboard"
                  icon={<CopyIcon />}
                  onClick={() => {
                    setIsDuplicateModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  <FormattedMessage {...messages.duplicateExisting} />
                </MenuItem>
              </DrilldownMenu>
            }
          >
            <FormattedMessage {...messages.createNewDashboard} />
          </MenuItem>
          <Divider component="li" key="separator" />
          <MenuItem component={(props) => <Link {...props} to="/dashboard-hub" />} description={intl.formatMessage(messages.dashboardHubDescription)}>
            <FormattedMessage {...messages.dashboardHub} />
          </MenuItem>
        </MenuList>
      </MenuContent>
    </Menu>
  );

  return (
    <>
      <MenuContainer
        isOpen={isOpen}
        onOpenChange={(isOpen) => setIsOpen(isOpen)}
        menu={menu}
        menuRef={menuRef}
        toggle={toggle}
        toggleRef={toggleRef}
        popperProps={{ position: 'end' }}
      />
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} layoutType={layoutType} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <DuplicateModal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} />
    </>
  );
};

const Controls = () => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawerExpanded, toggleOpen] = useAtom(drawerExpandedAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);
  const api = useApi();

  return (
    <>
      <WarningModal
        withCheckbox
        isOpen={isOpen}
        title={intl.formatMessage(messages.resetLayoutTitle)}
        checkboxLabel={intl.formatMessage(messages.resetLayoutCheckbox)}
        confirmButtonLabel={intl.formatMessage(messages.resetLayoutConfirm)}
        confirmButtonVariant={ButtonVariant.danger}
        onClose={() => setIsOpen(false)}
        onConfirm={() => {
          setIsOpen(false);
          if (templateId > 0) {
            api.resetDashboardTemplate(templateId).then(() => {
              setTemplateId(NaN);
            });
          }
        }}
      >
        <FormattedMessage {...messages.resetLayoutBody} />
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
            <FormattedMessage {...messages.resetToDefault} />
          </Button>
        </ToolbarItem>
        <ToolbarItem className="pf-v6-u-pr-sm pf-v6-u-pr-0-on-lg pf-v6-u-pb-xs pf-v6-u-pb-0-on-lg">
          <Button
            onClick={() => {
              toggleOpen((prev) => !prev);
            }}
            variant="primary"
            icon={isDrawerExpanded ? <TimesIcon /> : <PlusCircleIcon />}
            ouiaId="add-widget-button"
          >
            {isDrawerExpanded ? <FormattedMessage {...messages.closeWidgetPanel} /> : <FormattedMessage {...messages.addWidgets} />}
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
    </>
  );
};

const Header = ({ layoutType }: { layoutType?: string }) => {
  const { currentUser } = useCurrentUser();
  const userName = currentUser?.first_name && currentUser?.last_name ? ` ${currentUser.first_name} ${currentUser.last_name}` : currentUser?.username;
  const isDashboardHub = useFlag('platform.widget-layout.dashboard-dropdown');
  return (
    <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--header pf-v6-u-p-lg pf-v6-u-p-r-0-on-sm">
      <Flex className="widg-l-flex--header" direction={{ default: 'column', lg: 'row' }}>
        <FlexItem alignSelf={{ default: 'alignSelfFlexStart' }}>
          <Content>
            <Content component="h1">
              {userName ? <FormattedMessage {...messages.greetingNamed} values={{ name: userName }} /> : <FormattedMessage {...messages.greeting} />}
            </Content>
            <Content component="h2" className="pf-v6-u-mt-0">
              <FormattedMessage {...messages.welcome} />
            </Content>
          </Content>
        </FlexItem>
        <FlexItem align={{ default: 'alignLeft', lg: 'alignRight' }}>
          <Toolbar>
            <ToolbarContent>
              <Controls />
              {isDashboardHub && (
                <ToolbarItem>
                  <KebabDropdown layoutType={layoutType} />
                </ToolbarItem>
              )}
            </ToolbarContent>
          </Toolbar>
        </FlexItem>
      </Flex>
      <ConversionBanner />
    </PageSection>
  );
};

export default Header;
