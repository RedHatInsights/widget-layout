import { useCallback, useEffect, useState } from 'react';
import DebouncePromise from 'awesome-debounce-promise';
import {
  DashboardTemplate,
  ExtendedTemplateConfig,
  PartialTemplateConfig,
  Variants,
  WidgetMapping,
  getDashboardTemplate,
  getWidgetMapping,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplateHub,
  widgetIdSeparator,
} from '../api/dashboard-templates';
import { useSetAtom } from 'jotai';
import { renameDashboardAtom } from '../state/dashboardsAtom';

const debouncedPatchDashboardTemplate = DebouncePromise(patchDashboardTemplateHub, 1500, {
  onlyResolvesLast: true,
});

const remapWidgetTypes = (extendedTemplate: ExtendedTemplateConfig, widgetMapping: WidgetMapping): ExtendedTemplateConfig => {
  // Build reverse lookup: "landing-./RhelWidget" -> "rhel"
  const scopeModuleToKey: Record<string, string> = {};
  Object.entries(widgetMapping).forEach(([key, value]) => {
    scopeModuleToKey[`${value.scope}-${value.module}`] = key;
  });

  const result: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };
  (Object.keys(extendedTemplate) as Variants[]).forEach((variant) => {
    result[variant] = extendedTemplate[variant].map((item) => {
      const [scopeModule, index] = item.i.split(widgetIdSeparator);
      const shortKey = scopeModuleToKey[scopeModule];
      if (shortKey) {
        return {
          ...item,
          i: `${shortKey}${widgetIdSeparator}${index}`,
          widgetType: shortKey,
        };
      }
      return item;
    });
  });

  return result;
};

const useDashboardTemplate = (id: number) => {
  const [template, setTemplate] = useState<ExtendedTemplateConfig>({ sm: [], md: [], lg: [], xl: [] });
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [dashboard, setDashboard] = useState<DashboardTemplate>();
  const renameDashboardInList = useSetAtom(renameDashboardAtom);
  // widget mapping

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoaded(false);
      setError(null);

      try {
        const result = await getDashboardTemplate(id);
        setDashboard(result);
        const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(result.templateConfig);
        const widgetMap = await getWidgetMapping();
        const remappedTemplate = remapWidgetTypes(extendedTemplateConfig, widgetMap);
        setTemplate(remappedTemplate);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch dashboard template'));
      } finally {
        setIsLoaded(true);
      }
    };

    fetchTemplate();
  }, [id]);

  const renameDashboard = useCallback(
    async (dashboardName: string) => {
      await renameDashboardInList({ id, dashboardName });
      setDashboard((prev) => (prev ? { ...prev, dashboardName } : prev));
    },
    [id, renameDashboardInList]
  );

  const saveTemplate = useCallback(
    async (newTemplate: ExtendedTemplateConfig) => {
      setTemplate(newTemplate);

      try {
        const templateConfig: PartialTemplateConfig = { sm: [], md: [], lg: [], xl: [] };
        (Object.keys(newTemplate) as Variants[]).forEach((variant) => {
          templateConfig[variant] = newTemplate[variant].map((item) => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            maxH: item.maxH,
            minH: item.minH,
            title: item.title || 'Widget',
          }));
        });

        await debouncedPatchDashboardTemplate(id, { templateConfig } as Parameters<typeof patchDashboardTemplateHub>[1]);
      } catch (err) {
        console.error(err);
      }
    },
    [id]
  );

<<<<<<< HEAD
  return { template, saveTemplate, isLoaded, dashboard, error };
=======
<<<<<<< HEAD
  return { template, saveTemplate, isLoaded, dashboardName, error };
=======
  return { template, saveTemplate, renameDashboard, isLoaded, dashboard, error };
>>>>>>> 229c858 (feat: add inline editing for dashboard name)
>>>>>>> 9be2f2b (feat: add inline editing for dashboard name)
};

export default useDashboardTemplate;
