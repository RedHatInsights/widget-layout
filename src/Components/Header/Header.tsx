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
import { CodeIcon, CopyIcon, EditAltIcon, EllipsisVIcon, PlusCircleIcon, PlusIcon, ThIcon } from '@patternfly/react-icons';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { templateIdAtom } from '../../state/templateAtom';
import { resetDashboardTemplate } from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { WarningModal } from '@patternfly/react-component-groups';
import { Link } from 'react-router-dom';
import { useFlag } from '@unleash/proxy-client-react';
import useGetDashboards from '../../hooks/useGetDashboards';
import { dashboardsAtom } from '../../state/dashboardsAtom';
import { CreateModal } from '../CreateModal/CreateModal';
import { ImportModal } from '../DashboardHub/ImportModal/ImportModal';
import { DuplicateModal } from '../DuplicateModal/DuplicateModal';

export const KebabDropdown = () => {
  const dashboards = useAtomValue(dashboardsAtom);
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
      aria-label="kebab dropdown toggle"
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
                  isSelected={dashboard.default}
                  actions={
                    <MenuItemAction
                      icon={<EditAltIcon />}
                      actionId="edit"
                      // eslint-disable-next-line no-console
                      onClick={() => console.log('clicked on edit icon')}
                      aria-label="Edit"
                      isDisabled
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
                  Create new dashboard
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
                  Create from blank
                </MenuItem>
                <MenuItem
                  itemId="import-config"
                  icon={<CodeIcon />}
                  onClick={() => {
                    setIsImportModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  Import from config string
                </MenuItem>
                <MenuItem
                  itemId="duplicate-dashboard"
                  icon={<CopyIcon />}
                  onClick={() => {
                    setIsDuplicateModalOpen(true);
                    setIsOpen(false);
                  }}
                >
                  Duplicate existing
                </MenuItem>
              </DrilldownMenu>
            }
          >
            Create new dashboard
          </MenuItem>
          <Divider component="li" key="separator" />
          <MenuItem component={(props) => <Link {...props} to="/dashboard-hub" />} description="Create, manage, share dashboards">
            Dashboard Hub
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
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
      <DuplicateModal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} />
    </>
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
  const isDashboardHub = useFlag('platform.widget-layout.dashboard-dropdown');
  useGetDashboards();
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
