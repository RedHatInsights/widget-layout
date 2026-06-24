import { useCallback, useEffect, useMemo, useState } from 'react';
import DebouncePromise from 'awesome-debounce-promise';
import {
  DashboardTemplate,
  ExtendedTemplateConfig,
  PartialTemplateConfig,
  Variants,
  WidgetMapping,
  mapTemplateConfigToExtendedTemplateConfig,
  widgetIdSeparator,
} from '../api/dashboard-templates';
import { useApi } from './useApi';
import { useSetAtom } from 'jotai';
import { renameDashboardAtom } from '../state/dashboardsAtom';
import { templateIdAtom } from '../state/templateAtom';

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
  const api = useApi();
  const debouncedPatchDashboardTemplate = useMemo(() => DebouncePromise(api.patchDashboardTemplateHub, 1500, { onlyResolvesLast: true }), [api]);
  const renameDashboardInList = useSetAtom(renameDashboardAtom);
  const invalidateStartPage = useSetAtom(templateIdAtom);

  useEffect(() => {
    const fetchTemplate = async () => {
      setIsLoaded(false);
      setError(null);

      try {
        const result = await api.getDashboardTemplate(id);
        setDashboard(result);
        const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(result.templateConfig);
        const widgetMap = await api.getWidgetMapping();
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
      const updated = await renameDashboardInList({ id, dashboardName });
      setDashboard((prev) => (prev ? { ...prev, ...updated } : prev));
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

        await debouncedPatchDashboardTemplate(id, { templateConfig });
        if (dashboard?.default) {
          invalidateStartPage(-1);
        }
      } catch (err) {
        console.error(err);
      }
    },
    [id, dashboard?.default]
  );

  return { template, saveTemplate, renameDashboard, isLoaded, dashboard, error };
};

export default useDashboardTemplate;
