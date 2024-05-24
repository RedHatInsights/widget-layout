import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { lockedLayoutAtom } from '../../state/lockedLayoutAtom';
import { notificationsAtom, useRemoveNotification } from '../../state/notificationsAtom';
import Header from '../../Components/Header/Header';
import React, { useEffect } from 'react';
import useCurrentUser from '../../hooks/useCurrentUser';
import { LayoutTypes, WidgetPermission, getWidgetMapping } from '../../api/dashboard-templates';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import '../../App.scss';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';

const DefaultRoute = (props: { layoutType?: LayoutTypes }) => {
  const isLayoutLocked = useAtomValue(lockedLayoutAtom);
  const notifications = useAtomValue(notificationsAtom);
  const removeNotification = useRemoveNotification();
  const setWidgetMapping = useSetAtom(widgetMappingAtom);
  const { currentUser } = useCurrentUser();
  const { visibilityFunctions } = useChrome();

  const checkPermissions = async (permissions: WidgetPermission[]): Promise<boolean> => {
    const permissionResults = await Promise.all(
      permissions.map(async (permission) => {
        try {
          const { method, args } = permission;
          if (visibilityFunctions[method] && typeof visibilityFunctions[method] === 'function') {
            const permissionGranted = await (visibilityFunctions[method] as (...args: unknown[]) => Promise<boolean>)(...(args || []));
            return permissionGranted;
          }
          return true;
        } catch (error) {
          console.error('Error checking permissions', error);
          return false;
        }
      })
    );
    return permissionResults.every(Boolean);
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const getWidgetMap = async () => {
      const mapping = await getWidgetMapping();

      if (mapping) {
        const checkedMapping = await Object.entries(mapping).reduce(async (acc, [key, value]) => {
          const resolvedAcc = await acc;
          const widgetConfig = value.config;
          const hasPermissions = widgetConfig && widgetConfig.permissions ? await checkPermissions(widgetConfig.permissions) : true;
          if (hasPermissions) {
            resolvedAcc[key] = value;
          }
          return acc;
        }, Promise.resolve({} as Record<string, (typeof mapping)[string]>));

        setWidgetMapping(checkedMapping);
      }
    };

    getWidgetMap();
  }, [currentUser]);

  return (
    <div className="widgetLayout">
      <Portal notifications={notifications} removeNotification={removeNotification} />
      <Header />
      <AddWidgetDrawer dismissible={false}>
        <PageSection className="widg-c-page__main-section--grid pf-v5-u-p-md-on-sm">
          <GridLayout isLayoutLocked={isLayoutLocked} {...props} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

export default DefaultRoute;
