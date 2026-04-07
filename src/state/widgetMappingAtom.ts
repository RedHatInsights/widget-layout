import { atom } from 'jotai';
import type { VisibilityFunctions } from '@redhat-cloud-services/types';
import type { WidgetMapping, WidgetPermission } from '../api/dashboard-templates';
import { getWidgetMapping } from '../api/dashboard-templates';

const checkPermissions = async (visibilityFunctions: VisibilityFunctions, permissions: WidgetPermission[]): Promise<boolean> => {
  const results = await Promise.all(
    permissions.map(async (permission) => {
      try {
        const { method, args } = permission;
        if (visibilityFunctions[method] && typeof visibilityFunctions[method] === 'function') {
          return await (visibilityFunctions[method] as (...args: unknown[]) => Promise<boolean>)(...(args || []));
        }
        return true;
      } catch (error) {
        console.error('Error checking permissions', error);
        return false;
      }
    })
  );
  return results.every(Boolean);
};

export const widgetMappingAtom = atom<WidgetMapping>({});

export const resolvedWidgetMappingAtom = atom(null, async (_get, set, visibilityFunctions: VisibilityFunctions) => {
  const mapping = await getWidgetMapping();

  if (!mapping) {
    return;
  }

  const entries = await Promise.all(
    Object.entries(mapping).map(async ([key, value]) => {
      const permissions = value.config?.permissions;
      const hasPermissions = permissions ? await checkPermissions(visibilityFunctions, permissions) : true;
      return hasPermissions ? ([key, value] as const) : null;
    })
  );

  set(widgetMappingAtom, Object.fromEntries(entries.filter(Boolean) as [string, WidgetMapping[string]][]));
});
