import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import useCurrentUser from './useCurrentUser';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { WidgetPermission, getWidgetMapping } from '../api/dashboard-templates';
import { widgetMappingAtom } from '../state/widgetMappingAtom';

const useWidgetMapping = () => {
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
};

export default useWidgetMapping;
