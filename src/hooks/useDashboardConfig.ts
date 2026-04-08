import { useCallback, useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import DebouncePromise from 'awesome-debounce-promise';
import { templateAtom, templateIdAtom } from '../state/templateAtom';
import { layoutVariantAtom } from '../state/layoutAtom';
import {
  ExtendedTemplateConfig,
  LayoutTypes,
  PartialTemplateConfig,
  Variants,
  getDashboardTemplates,
  getDefaultTemplate,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplate,
} from '../api/dashboard-templates';
import useCurrentUser from './useCurrentUser';
import { useAddNotification } from '../state/notificationsAtom';

const sidebarBreakpoints = { xl: 1250, lg: 1100, md: 800, sm: 500 };

const debouncedPatchDashboardTemplate = DebouncePromise(patchDashboardTemplate, 1500, {
  onlyResolvesLast: true,
});

const useDashboardConfig = (layoutType: LayoutTypes = 'landingPage') => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [template, setTemplate] = useAtom(templateAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);
  const [, setLayoutVariant] = useAtom(layoutVariantAtom);
  const { currentUser } = useCurrentUser();
  const addNotification = useAddNotification();
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser || templateId >= 0) {
      return;
    }

    getDashboardTemplates(layoutType)
      .then((templates) => {
        const customDefaultTemplate = getDefaultTemplate(templates);
        if (!customDefaultTemplate) {
          throw new Error('No custom default template found');
        }
        const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(customDefaultTemplate.templateConfig);
        const currentWidth = layoutRef?.current?.clientWidth || document.body.clientWidth;
        let targetVariant: Variants;
        if (currentWidth >= sidebarBreakpoints.xl) {
          targetVariant = 'xl';
        } else if (currentWidth >= sidebarBreakpoints.lg) {
          targetVariant = 'lg';
        } else if (currentWidth >= sidebarBreakpoints.md) {
          targetVariant = 'md';
        } else {
          targetVariant = 'sm';
        }
        setTemplate(extendedTemplateConfig);
        setTemplateId(customDefaultTemplate.id);
        setLayoutVariant(targetVariant);
      })
      .catch((err) => {
        console.error(err);
        addNotification({
          variant: 'danger',
          title: 'Failed to fetch dashboard template',
          description: 'Try reloading the page.',
        });
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, [currentUser, templateId]);

  const saveTemplate = useCallback(
    async (newTemplate: ExtendedTemplateConfig) => {
      if (templateId < 0) {
        return;
      }

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

        await debouncedPatchDashboardTemplate(templateId, { templateConfig } as Parameters<typeof patchDashboardTemplate>[1]);
      } catch (error) {
        console.error(error);
        addNotification({
          variant: 'danger',
          title: 'Failed to patch dashboard configuration',
          description: 'Your dashboard changes were unable to be saved.',
        });
      }
    },
    [templateId, setTemplate, addNotification]
  );

  return {
    template,
    templateId,
    isLoaded,
    saveTemplate,
    layoutRef,
  };
};

export default useDashboardConfig;
