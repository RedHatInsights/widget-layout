import './GridLayout.scss';
import './GridTile.scss';
import { useEffect, useRef, useState, useMemo } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { layoutVariantAtom } from '../../state/layoutAtom';
import { templateAtom, templateIdAtom } from '../../state/templateAtom';
import DebouncePromise from 'awesome-debounce-promise';
import React from 'react';
import {
  LayoutTypes,
  getDashboardTemplates,
  getDefaultTemplate,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplate,
  WidgetMapping as ScalprumWidgetMapping,
} from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Button, EmptyState, EmptyStateActions, EmptyStateBody, EmptyStateVariant, PageSection, Skeleton } from '@patternfly/react-core';
import { ExternalLinkAltIcon, GripVerticalIcon, PlusCircleIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { useAddNotification } from '../../state/notificationsAtom';
import { currentlyUsedWidgetsAtom } from '../../state/currentlyUsedWidgetsAtom';
import { GridLayout as PatternFlyGridLayout, WidgetMapping, ExtendedTemplateConfig, Variants } from '@patternfly/widgetized-dashboard';
import { ScalprumComponent } from '@scalprum/react-core';
import HeaderIcon from '../Icons/HeaderIcon';

export const breakpoints: {
  [key in Variants]: number;
} = { xl: 1550, lg: 1400, md: 1100, sm: 800 };

const documentationLink =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/getting_started_with_the_red_hat_hybrid_cloud_console/index#customizing-main-page_navigating-the-console';

const LayoutEmptyState = () => {
  const setDrawerExpanded = useSetAtom(drawerExpandedAtom);

  useEffect(() => {
    setDrawerExpanded(true);
  }, []);

  return (
    <PageSection hasBodyWrapper={false} className="empty-layout pf-v6-u-p-0">
      <EmptyState headingLevel="h2" icon={PlusCircleIcon} titleText="No dashboard content" variant={EmptyStateVariant.lg} className="pf-v6-u-p-sm">
        <EmptyStateBody>
          You don't have any widgets on your dashboard. To populate your dashboard, drag <GripVerticalIcon /> items from the blue widget bank to this
          dashboard body here.
        </EmptyStateBody>
        <EmptyStateActions>
          <Button variant="link" icon={<ExternalLinkAltIcon />} iconPosition="end" component="a" href={documentationLink}>
            Learn about your widget dashboard
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </PageSection>
  );
};

const debouncedPatchDashboardTemplate = DebouncePromise(patchDashboardTemplate, 1500, {
  onlyResolvesLast: true,
});

// Adapter to convert Scalprum WidgetMapping to PatternFly WidgetMapping
const convertWidgetMapping = (scalprumMapping: ScalprumWidgetMapping): WidgetMapping => {
  const result: WidgetMapping = {};

  Object.keys(scalprumMapping).forEach((widgetType) => {
    const scalprumWidget = scalprumMapping[widgetType];
    // Create scoped class name for styling purposes
    const scopedWidgetType = `${scalprumWidget.scope}-${widgetType}`;
    result[widgetType] = {
      defaults: scalprumWidget.defaults,
      config: {
        title: scalprumWidget.config?.title,
        icon: scalprumWidget.config?.icon ? <HeaderIcon icon={scalprumWidget.config.icon} /> : undefined,
        headerLink: scalprumWidget.config?.headerLink,
        wrapperProps: { className: scalprumWidget.scope },
        cardBodyProps: { className: scopedWidgetType }
      },
      renderWidget: (_widgetId: string) => (
        <ScalprumComponent
          fallback={<Skeleton style={{ borderRadius: 0 }} shape="square" width="100%" height="100%" />}
          scope={scalprumWidget.scope}
          module={scalprumWidget.module}
          importName={scalprumWidget.importName}
        />
      ),
    };
  });

  return result;
};

const GridLayout = ({ isLayoutLocked = false, layoutType = 'landingPage' }: { isLayoutLocked?: boolean; layoutType?: LayoutTypes }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
  const [template, setTemplate] = useAtom(templateAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useCurrentUser();
  const scalprumWidgetMapping = useAtomValue(widgetMappingAtom);
  const addNotification = useAddNotification();
  const setCurrentlyUsedWidgets = useSetAtom(currentlyUsedWidgetsAtom);
  const setDrawerExpanded = useSetAtom(drawerExpandedAtom);
  const { analytics } = useChrome();

  // Convert Scalprum mapping to PatternFly mapping
  const widgetMapping = useMemo(() => convertWidgetMapping(scalprumWidgetMapping), [scalprumWidgetMapping]);

  // Convert local ExtendedTemplateConfig to PatternFly ExtendedTemplateConfig
  const patternFlyTemplate: ExtendedTemplateConfig = useMemo(() => {
    const result: ExtendedTemplateConfig = { sm: [], md: [], lg: [], xl: [] };
    (Object.keys(template) as Variants[]).forEach((variant) => {
      result[variant] = template[variant].map((item) => ({
        ...item,
        // Use the original widgetType (no prefix) to match the widgetMapping keys
        widgetType: item.widgetType,
        title: item.title || 'Widget',
        config: scalprumWidgetMapping[item.widgetType]?.config,
      }));
    });
    return result;
  }, [template, scalprumWidgetMapping]);

  const handleTemplateChange = async (newTemplate: ExtendedTemplateConfig) => {
    if (isLayoutLocked || templateId < 0) {
      return;
    }

    // Update local state
    setTemplate(newTemplate as any); // Type compatibility handled by similar structure

    // Update currently used widgets
    const activeLayout = newTemplate[layoutVariant] || [];
    setCurrentlyUsedWidgets(activeLayout.map((item) => item.widgetType));

    try {
      // Convert ExtendedTemplateConfig to TemplateConfig for API
      const templateConfig: any = { sm: [], md: [], lg: [], xl: [] };
      (Object.keys(newTemplate) as Variants[]).forEach((variant) => {
        templateConfig[variant] = newTemplate[variant].map(({ widgetType, config, locked, ...item }) => ({
          ...item,
          title: item.title || 'Widget',
        }));
      });

      await debouncedPatchDashboardTemplate(templateId, { templateConfig });
    } catch (error) {
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'Failed to patch dashboard configuration',
        description: 'Your dashboard changes were unable to be saved.',
      });
    }
  };

  const handleActiveWidgetsChange = (widgetTypes: string[]) => {
    setCurrentlyUsedWidgets(widgetTypes);
  };

  const handleDrawerExpandChange = (expanded: boolean) => {
    setDrawerExpanded(expanded);
  };

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
        if (currentWidth > breakpoints.lg) {
          targetVariant = 'xl';
        } else if (breakpoints.lg >= currentWidth && currentWidth > breakpoints.md) {
          targetVariant = 'lg';
        } else if (breakpoints.md >= currentWidth && currentWidth > breakpoints.sm) {
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

  const activeLayout = patternFlyTemplate[layoutVariant] || [];

  return (
    <div id="widget-layout-container" style={{ position: 'relative' }} ref={layoutRef}>
      {activeLayout.length === 0 && isLoaded && <LayoutEmptyState />}
      {Object.keys(widgetMapping).length > 0 && (
        <PatternFlyGridLayout
          widgetMapping={widgetMapping}
          template={patternFlyTemplate}
          onTemplateChange={handleTemplateChange}
          isLayoutLocked={isLayoutLocked}
          emptyStateComponent={<LayoutEmptyState />}
          documentationLink={documentationLink}
          analytics={analytics?.track ? (event, data) => analytics.track(event, data) : undefined}
          showEmptyState={!isLoaded}
          onDrawerExpandChange={handleDrawerExpandChange}
          onActiveWidgetsChange={handleActiveWidgetsChange}
        />
      )}
    </div>
  );
};

export default GridLayout;
