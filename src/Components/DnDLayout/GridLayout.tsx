import '@patternfly/widgetized-dashboard/dist/esm/styles.css';
import './GridLayout.scss';
import './WidgetHeader.scss';
import '../Icons/HeaderIcon.scss';
import React, { useEffect, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import ResizeHandleSVG from './resize-handle.svg';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { layoutVariantAtom } from '../../state/layoutAtom';
import { currentDropInItemAtom } from '../../state/currentDropInItemAtom';
import { ExtendedTemplateConfig as LocalExtendedTemplateConfig } from '../../api/dashboard-templates';
import { Button, EmptyState, EmptyStateActions, EmptyStateBody, EmptyStateVariant, PageSection } from '@patternfly/react-core';
import { ExternalLinkAltIcon, GripVerticalIcon, PlusCircleIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { currentlyUsedWidgetsAtom } from '../../state/currentlyUsedWidgetsAtom';
import { ExtendedTemplateConfig, GridLayout as PatternFlyGridLayout, Variants } from '@patternfly/widgetized-dashboard';
import convertWidgetMapping from './ConvertWidgetMapping';

const sidebarBreakpoints = { xl: 1250, lg: 1100, md: 800, sm: 500 };

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
          You don&apos;t have any widgets on your dashboard. To populate your dashboard, drag <GripVerticalIcon /> items from the blue widget bank to
          this dashboard body here.
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

const getResizeHandle = (resizeHandleAxis: string, ref: React.Ref<HTMLDivElement>) => (
  <div ref={ref} className={`react-resizable-handle react-resizable-handle-${resizeHandleAxis}`}>
    <img src={ResizeHandleSVG} alt="" aria-hidden="true" />
  </div>
);

interface GridLayoutProps {
  template: LocalExtendedTemplateConfig;
  saveTemplate: (newTemplate: LocalExtendedTemplateConfig) => Promise<void>;
  isLoaded: boolean;
  isLayoutLocked?: boolean;
  layoutRef?: React.Ref<HTMLDivElement>;
}

const GridLayout = ({ template, saveTemplate, isLoaded, isLayoutLocked = false, layoutRef }: GridLayoutProps) => {
  const layoutVariant = useAtomValue(layoutVariantAtom);
  const scalprumWidgetMapping = useAtomValue(widgetMappingAtom);
  const setCurrentlyUsedWidgets = useSetAtom(currentlyUsedWidgetsAtom);
  const setDrawerExpanded = useSetAtom(drawerExpandedAtom);
  const currentDropInItem = useAtomValue(currentDropInItemAtom);
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
    if (isLayoutLocked) {
      return;
    }

    // Update currently used widgets
    const activeLayout = newTemplate[layoutVariant] || [];
    setCurrentlyUsedWidgets(activeLayout.map((item) => item.widgetType));

    await saveTemplate(newTemplate as LocalExtendedTemplateConfig);
  };

  const handleActiveWidgetsChange = (widgetTypes: string[]) => {
    setCurrentlyUsedWidgets(widgetTypes);
  };

  const handleDrawerExpandChange = (expanded: boolean) => {
    setDrawerExpanded(expanded);
  };

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
          breakpoints={sidebarBreakpoints}
          resizeWidgetConfig={{
            enabled: true,
            handles: ['se', 'sw', 'ne', 'nw'] as const,
            handleComponent: getResizeHandle,
          }}
          documentationLink={documentationLink}
          analytics={analytics?.track ? (event, data) => analytics.track(event, data) : undefined}
          showEmptyState={!isLoaded}
          onDrawerExpandChange={handleDrawerExpandChange}
          onActiveWidgetsChange={handleActiveWidgetsChange}
          droppingWidgetType={currentDropInItem}
        />
      )}
    </div>
  );
};

export default GridLayout;
