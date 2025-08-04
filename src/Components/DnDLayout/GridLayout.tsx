import 'react-grid-layout/css/styles.css';
import './GridLayout.scss';
import ReactGridLayout, { Layout, ReactGridLayoutProps } from 'react-grid-layout';
import ResizeHandleIcon from './resize-handle.svg';
import GridTile, { SetWidgetAttribute } from './GridTile';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isWidgetType } from '../Widgets/widgetTypes';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentDropInItemAtom } from '../../state/currentDropInItemAtom';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { layoutVariantAtom } from '../../state/layoutAtom';
import { templateAtom, templateIdAtom } from '../../state/templateAtom';
import DebouncePromise from 'awesome-debounce-promise';
import React from 'react';
import {
  ExtendedLayoutItem,
  LayoutTypes,
  Variants,
  extendLayout,
  getDashboardTemplates,
  getDefaultTemplate,
  getWidgetIdentifier,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplate,
} from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Button, EmptyState, EmptyStateActions, EmptyStateBody, EmptyStateVariant, PageSection } from '@patternfly/react-core';
import { ExternalLinkAltIcon, GripVerticalIcon, PlusCircleIcon } from '@patternfly/react-icons';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { getWidget } from '../Widgets/widgetDefaults';
import { drawerExpandedAtom } from '../../state/drawerExpandedAtom';
import { columns, dropping_elem_id } from '../../consts';
import { useAddNotification } from '../../state/notificationsAtom';
import { currentlyUsedWidgetsAtom } from '../../state/currentlyUsedWidgetsAtom';

export const breakpoints: {
  [key in Variants]: number;
} = { xl: 1550, lg: 1400, md: 1100, sm: 800 };

const documentationLink =
  'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html-single/getting_started_with_the_red_hat_hybrid_cloud_console/index#customizing-main-page_navigating-the-console';

const getResizeHandle = (resizeHandleAxis: string, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={`react-resizable-handle react-resizable-handle-${resizeHandleAxis}`}>
      <img src={ResizeHandleIcon} />
    </div>
  );
};

const LayoutEmptyState = () => {
  const setDrawerExpanded = useSetAtom(drawerExpandedAtom);

  useEffect(() => {
    setDrawerExpanded(true);
  }, []);

  return (
    <PageSection hasBodyWrapper={false} className="empty-layout pf-v6-u-p-0">
      <EmptyState headingLevel="h2" icon={PlusCircleIcon} titleText="No dashboard content" variant={EmptyStateVariant.lg} className="pf-v6-u-p-sm">
        <EmptyStateBody>
          You don’t have any widgets on your dashboard. To populate your dashboard, drag <GripVerticalIcon /> items from the blue widget bank to this
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

const GridLayout = ({ isLayoutLocked = false, layoutType = 'landing-landingPage' }: { isLayoutLocked?: boolean; layoutType?: LayoutTypes }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
  const [template, setTemplate] = useAtom(templateAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);
  const [layoutWidth, setLayoutWidth] = useState<number>(1200);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useCurrentUser();
  const widgetMapping = useAtomValue(widgetMappingAtom);
  const addNotification = useAddNotification();
  const setCurrentlyUsedWidgets = useSetAtom(currentlyUsedWidgetsAtom);
  const { analytics } = useChrome();

  const [currentDropInItem, setCurrentDropInItem] = useAtom(currentDropInItemAtom);
  const droppingItemTemplate: ReactGridLayoutProps['droppingItem'] = useMemo(() => {
    if (currentDropInItem && isWidgetType(widgetMapping, currentDropInItem)) {
      return {
        ...widgetMapping[currentDropInItem].defaults,
        i: dropping_elem_id,
        widgetType: currentDropInItem,
        title: 'New title',
        config: widgetMapping[currentDropInItem].config,
      };
    }
  }, [currentDropInItem]);

  const setWidgetAttribute: SetWidgetAttribute = (id, attributeName, value) =>
    setTemplate((prev) =>
      Object.entries(prev).reduce(
        (acc, [size, layout]) => ({
          ...acc,
          [size]: layout.map((widget) => (widget.i === id ? { ...widget, [attributeName]: value } : widget)),
        }),
        prev
      )
    );

  const removeWidget = (id: string) =>
    setTemplate((prev) =>
      Object.entries(prev).reduce(
        (acc, [size, layout]) => ({
          ...acc,
          [size]: layout.filter((widget) => widget.i !== id),
        }),
        prev
      )
    );

  const onDrop: ReactGridLayoutProps['onDrop'] = (_layout: ExtendedLayoutItem[], layoutItem: ExtendedLayoutItem, event: DragEvent) => {
    const data = event.dataTransfer?.getData('text') || '';
    if (isWidgetType(widgetMapping, data)) {
      setCurrentDropInItem(undefined);
      setTemplate((prev) =>
        Object.entries(prev).reduce((acc, [size, layout]) => {
          const newWidget = {
            ...layoutItem,
            ...widgetMapping[data].defaults,
            // make sure the configuration is valid for all layout sizes
            w: size === layoutVariant ? layoutItem.w : Math.min(widgetMapping[data].defaults.w, columns[size as Variants]),
            x: size === layoutVariant ? layoutItem.x : Math.min(layoutItem.x, columns[size as Variants]),
            widgetType: data,
            i: getWidgetIdentifier(data),
            title: 'New title',
            config: widgetMapping[data].config,
          };
          return {
            ...acc,
            [size]: layout.reduce<ExtendedLayoutItem[]>(
              (acc, curr) => {
                if (curr.x + curr.w > newWidget.x && curr.y + curr.h <= newWidget.y) {
                  acc.push(curr);
                } else {
                  // push the current items down on the Y axis if they are supposed to be below the new widget
                  acc.push({ ...curr, y: curr.y + curr.h });
                }

                return acc;
              },
              [newWidget]
            ),
          };
        }, prev)
      );
      analytics.track('widget-layout.widget-add', { data });
    }
    event.preventDefault();
  };

  const onLayoutChange = async (currentLayout: Layout[]) => {
    if (isInitialRender) {
      setIsInitialRender(false);
      setCurrentlyUsedWidgets(activeLayout.map((item) => item.widgetType));
      return;
    }
    if (isLayoutLocked || templateId < 0 || !layoutVariant || currentDropInItem) {
      return;
    }

    const data = extendLayout({ ...template, [layoutVariant]: currentLayout });
    setCurrentlyUsedWidgets(activeLayout.map((item) => item.widgetType));
    setTemplate(data);

    try {
      await debouncedPatchDashboardTemplate(templateId, { templateConfig: data });
    } catch (error) {
      console.error(error);
      addNotification({
        variant: 'danger',
        title: 'Failed to patch dashboard configuration',
        description: 'Your dashboard changes were unable to be saved.',
      });
    }
  };

  useEffect(() => {
    if (!currentUser || templateId >= 0) {
      return;
    }
    // TODO template type should be pulled from app config for reusability
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

  function getGridDimensions(currentWidth: number) {
    let variant: Variants = 'xl';
    Object.entries(breakpoints).forEach(([breakpoint, value]) => {
      if (value >= currentWidth) {
        variant = breakpoint as Variants;
      }
    });
    return variant;
  }

  useEffect(() => {
    const currentWidth = layoutRef.current?.getBoundingClientRect().width ?? 1200;
    const variant: Variants = getGridDimensions(currentWidth);
    setLayoutVariant(variant);
    setLayoutWidth(currentWidth);
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;

      const currentWidth = entries[0].contentRect.width;

      const variant: Variants = getGridDimensions(currentWidth);
      setLayoutVariant(variant);
      setLayoutWidth(currentWidth);
    });
    if (layoutRef.current) {
      observer.observe(layoutRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const activeLayout = template[layoutVariant] || [];
  return (
    // {/* relative position is required for the grid layout to properly calculate
    // child translation while dragging is in progress */}
    <div id="widget-layout-container" style={{ position: 'relative' }} ref={layoutRef}>
      {activeLayout.length === 0 && !currentDropInItem && isLoaded && <LayoutEmptyState />}
      <ReactGridLayout
        // Critical key, we need to reset the grid when layout variant changes
        key={'grid-' + layoutVariant}
        draggableHandle=".drag-handle"
        layout={template[layoutVariant]}
        cols={columns[layoutVariant]}
        rowHeight={56}
        width={layoutWidth}
        isDraggable={!isLayoutLocked}
        isResizable={!isLayoutLocked}
        // The types package has outed types for this function
        resizeHandle={getResizeHandle as unknown as ReactGridLayoutProps['resizeHandle']}
        resizeHandles={['sw', 'nw', 'se', 'ne']}
        // add droppping item default based on dragged template
        droppingItem={droppingItemTemplate}
        isDroppable={!isLayoutLocked}
        onDrop={onDrop}
        useCSSTransforms
        verticalCompact
        onLayoutChange={onLayoutChange}
      >
        {activeLayout
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .map(({ widgetType, title, ...rest }, index) => {
            const widget = getWidget(widgetMapping, widgetType);
            console.log({ widgetType, widgetMapping, widget });
            if (!widget) {
              return null;
            }
            const config = widgetMapping[widgetType]?.config;
            return (
              <div key={rest.i} data-grid={rest} tabIndex={index} className={`widget-columns-${rest.w} widget-rows-${rest.h}`}>
                <GridTile
                  isDragging={isDragging}
                  setIsDragging={setIsDragging}
                  widgetType={widgetType}
                  // these will be dynamically calculated once the dimensions are calculated
                  widgetConfig={{ ...rest, colWidth: 1200 / 4, config }}
                  setWidgetAttribute={setWidgetAttribute}
                  removeWidget={removeWidget}
                >
                  {rest.i}
                </GridTile>
              </div>
            );
          })
          .filter((layoutItem) => layoutItem !== null)}
      </ReactGridLayout>
    </div>
  );
};

export default GridLayout;
