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
    console.log('Checking permissions: ', permissions);
    for (const permission of permissions) {
      if (permission.method === 'permissions' && permission.args && !(await visibilityFunctions.hasPermissions(permission.args))) {
        return false;
      }

      if (permission.method === 'loosePermissions' && permission.args && !(await visibilityFunctions.loosePermissions(permission.args))) {
        return false;
      }

      if (permission.method === 'isOrgAdmin' && !(await visibilityFunctions.isOrgAdmin())) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    (async () => {
      const getWidgetMap = async () => {
        const mapping = await getWidgetMapping();
        if (mapping) {
          const filteredMapping = await Object.entries(mapping).reduce<Promise<Record<string, (typeof mapping)[string]>>>(
            async (acc, [key, value]) => {
              const widgetConfig = value.config;
              const isVisible = !(
                widgetConfig &&
                widgetConfig.permissions &&
                !(await checkPermissions(widgetConfig.permissions as WidgetPermission[]))
              );
              if (isVisible) {
                (await acc)[key] = value;
              }
              return acc;
            },
            Promise.resolve({})
          );
          setWidgetMapping(filteredMapping);
        }
      };

      await getWidgetMap();
    })();
  }, [currentUser]);

  return (
    <div className="widgetLayout">
      <Portal notifications={notifications} removeNotification={removeNotification} />
      <Header />
      <AddWidgetDrawer dismissible={false}>
        <PageSection className="widg-c-page__main-section--grid pf-v5-u-p-md pf-v5-u-p-lg-on-sm">
          <GridLayout isLayoutLocked={isLayoutLocked} {...props} />
        </PageSection>
      </AddWidgetDrawer>
    </div>
  );
};

export default DefaultRoute;
