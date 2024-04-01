import 'react-grid-layout/css/styles.css';
import './GridLayout.scss';
import { Layout, ReactGridLayoutProps, Responsive, ResponsiveProps, WidthProvider } from 'react-grid-layout';
import ResizeHandleIcon from './resize-handle.svg';
import GridTile, { SetWidgetAttribute } from './GridTile';
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isWidgetType } from '../Widgets/widgetTypes';
import { useAtom, useAtomValue } from 'jotai';
import { currentDropInItemAtom } from '../../state/currentDropInItemAtom';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import { activeItemAtom, layoutAtom, layoutVariantAtom, prevLayoutAtom } from '../../state/layoutAtom';
import { templateAtom, templateIdAtom } from '../../state/templateAtom';
import React from 'react';
import {
  DashboardTemplate,
  ExtendedLayoutItem,
  Variants,
  getDashboardTemplates,
  getDefaultTemplate,
  getWidgetIdentifier,
  mapPartialExtendedTemplateConfigToPartialTemplateConfig,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplate,
} from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';
import { debounce, isEqual } from 'lodash';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  PageSection,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, GripVerticalIcon, PlusCircleIcon } from '@patternfly/react-icons';

export const dropping_elem_id = '__dropping-elem__';

export const breakpoints = { xl: 1100, lg: 996, md: 768, sm: 480 };

const ResponsiveGridLayout = WidthProvider(Responsive);

const getResizeHandle = (resizeHandleAxis: string, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={`react-resizable-handle react-resizable-handle-${resizeHandleAxis}`}>
      <img src={ResizeHandleIcon} />
    </div>
  );
};

const LayoutEmptyState = () => {
  return (
    <PageSection className="empty-layout pf-v5-u-p-0">
      <EmptyState variant={EmptyStateVariant.lg} className="pf-v5-u-p-sm">
        <EmptyStateHeader titleText="No dashboard content" headingLevel="h2" icon={<EmptyStateIcon icon={PlusCircleIcon} />} />
        <EmptyStateBody>
          You don’t have any widgets on your dashboard. To populate your dashboard, drag <GripVerticalIcon /> items from the blue widget bank to
          dashboard body here.
        </EmptyStateBody>
        <EmptyStateActions>
          <Button variant="link" icon={<ExternalLinkAltIcon />} iconPosition="end">
            Learn about your widget dashboard
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </PageSection>
  );
};

const GridLayout = ({ isLayoutLocked = false }: { isLayoutLocked?: boolean }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [layout, setLayout] = useAtom(layoutAtom);
  const [prevLayout, setPrevLayout] = useAtom(prevLayoutAtom);
  const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
  const [template, setTemplate] = useAtom(templateAtom);
  const [templateId, setTemplateId] = useAtom(templateIdAtom);
  const [activeItem, setActiveItem] = useAtom(activeItemAtom);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { currentToken } = useCurrentUser();
  const widgetMapping = useAtomValue(widgetMappingAtom);
  const dispatch = useDispatch();

  const [currentDropInItem, setCurrentDropInItem] = useAtom(currentDropInItemAtom);
  const droppingItemTemplate: ReactGridLayoutProps['droppingItem'] = useMemo(() => {
    if (currentDropInItem && isWidgetType(widgetMapping, currentDropInItem)) {
      return {
        ...widgetMapping[currentDropInItem].defaults,
        i: dropping_elem_id,
        widgetType: currentDropInItem,
        title: 'New title',
      };
    }
  }, [currentDropInItem]);

  const setWidgetAttribute: SetWidgetAttribute = (id, attributeName, value) => {
    setLayout((prev) => prev.map((item) => (item.i === id ? { ...item, [attributeName]: value } : item)));
  };

  const removeWidget = (id: string) => {
    setLayout((prev) => prev.filter((item) => item.i !== id));
  };

  const onDrop: ReactGridLayoutProps['onDrop'] = (_layout: ExtendedLayoutItem[], layoutItem: ExtendedLayoutItem, event: DragEvent) => {
    const data = event.dataTransfer?.getData('text') || '';
    // fix placement order
    if (isWidgetType(widgetMapping, data)) {
      const newWidget = {
        ...layoutItem,
        ...widgetMapping[data].defaults,
        // w: layoutItem.x + layoutItem.w > 3 ? 1 : 3,
        // x: 4 % layoutItem.w,
        // x: layoutItem.x + layoutItem.w > 3 ? 3 : 0,
        widgetType: data,
        i: getWidgetIdentifier(data),
        title: 'New title',
      };
      setCurrentDropInItem(undefined);
      setLayout((prev) =>
        prev.reduce<ExtendedLayoutItem[]>(
          (acc, curr) => {
            if (curr.x + curr.w > newWidget.x && curr.y + curr.h <= newWidget.y) {
              acc.push(curr);
            } else {
              // Wee need to push the current items down on the Y axis if they are supposed to be below the new widget
              acc.push({ ...curr, y: curr.y + curr.h });
            }

            return acc;
          },
          [newWidget]
        )
      );
    }
    event.preventDefault();
  };

  const activeLayout = useMemo(
    () =>
      layout.map((item) => ({
        ...item,
        locked: isLayoutLocked ? isLayoutLocked : item.locked,
      })),
    [isLayoutLocked, layout]
  );

  const onLayoutChange: ResponsiveProps['onLayoutChange'] = useCallback(
    (currentLayout: Layout[]) => {
      if (isInitialRender) {
        setIsInitialRender(false);
        return;
      }
      if (isLayoutLocked || templateId < 0 || !layoutVariant || currentDropInItem) {
        return;
      }
      // TODO in certain scenarios prevLayout contains additional undefined metadata on each widget causing this check to fail and multiple patches for dropping widgets in
      if (isEqual(prevLayout, layout)) {
        return;
      }
      const data = mapPartialExtendedTemplateConfigToPartialTemplateConfig({ [layoutVariant]: currentLayout });
      patchDashboardTemplate(templateId, { templateConfig: data }, currentToken)
        .then((template: DashboardTemplate) => {
          const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(template.templateConfig);
          setTemplate(extendedTemplateConfig);
          setPrevLayout(layout);
          setLayout(extendedTemplateConfig[layoutVariant]);
        })
        .catch((err) => {
          console.error(err);
          dispatch(
            addNotification({
              variant: 'danger',
              title: 'Failed to patch dashboard configuration',
              description: 'Your dashboard changes were unable to be saved.',
            })
          );
        });
    },
    [isLayoutLocked, templateId, layoutVariant, currentToken, layout, currentDropInItem, isInitialRender]
  );

  const debouncedOnLayoutChange = debounce(onLayoutChange, 500);

  const onBreakpointChange: ResponsiveProps['onBreakpointChange'] = (newBreakpoint) => {
    setLayoutVariant(newBreakpoint as Variants);
  };

  const onKeyUp = (event: KeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.code === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      setActiveItem((prev) => {
        if (prev === id) {
          return undefined;
        }
        return id;
      });
    }
  };

  const handleArrows = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (!activeItem) {
        return;
      }

      const item = layout.find(({ i }) => i === activeItem);
      if (!item) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      if (e.code === 'ArrowUp') {
        setLayout((prev) =>
          prev.map((layoutItem) => {
            if (layoutItem.i === activeItem) {
              return {
                ...layoutItem,
                y: Math.max(layoutItem.y - 1, 0),
              };
            }
            return layoutItem;
          })
        );
      }

      if (e.code === 'ArrowDown') {
        setLayout((prev) =>
          prev.map((layoutItem) => {
            if (layoutItem.i === activeItem) {
              return {
                ...layoutItem,
                y: layoutItem.y + 1,
              };
            }
            return layoutItem;
          })
        );
      }

      if (e.code === 'ArrowLeft') {
        setLayout((prev) =>
          prev.map((layoutItem) => {
            if (layoutItem.i === activeItem) {
              return {
                ...layoutItem,
                x: Math.max(layoutItem.x - 1, 0),
              };
            }
            return layoutItem;
          })
        );
      }

      if (e.code === 'ArrowRight') {
        setLayout((prev) =>
          prev.map((layoutItem) => {
            if (layoutItem.i === activeItem) {
              return {
                ...layoutItem,
                x: layoutItem.x + 1,
              };
            }
            return layoutItem;
          })
        );
      }
    },
    [activeItem]
  );

  useEffect(() => {
    if (activeItem && layoutRef.current) {
      layoutRef.current.addEventListener('keydown', handleArrows);
    }
    return () => {
      layoutRef.current?.removeEventListener('keydown', handleArrows);
    };
  }, [activeItem]);

  useEffect(() => {
    if (!currentToken || templateId >= 0) {
      return;
    }
    // TODO template type should be pulled from app config for reusability
    getDashboardTemplates(currentToken, 'landingPage')
      .then((templates) => {
        const defaultTemplate = getDefaultTemplate(templates);
        if (!defaultTemplate) {
          throw new Error('No default template found');
        }
        const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(defaultTemplate.templateConfig);
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
        setTemplateId(defaultTemplate.id);
        setLayout(extendedTemplateConfig[targetVariant]);
        setLayoutVariant(targetVariant);
      })
      .catch((err) => {
        console.log(err);
        dispatch(
          addNotification({
            variant: 'danger',
            title: 'Failed to fetch dashboard template',
            description: 'Try reloading the page.',
          })
        );
      });
  }, [currentToken, templateId]);

  return (
    // {/* relative position is required for the grid layout to properly calculate
    // child translation while dragging is in progress */}
    <div style={{ position: 'relative' }} ref={layoutRef}>
      <ResponsiveGridLayout
        className="layout"
        draggableHandle=".drag-handle"
        layouts={template}
        breakpoints={breakpoints}
        cols={{ xl: 4, lg: 3, md: 2, sm: 1 }}
        rowHeight={88}
        //width={1200}
        isDraggable={!isLayoutLocked}
        isResizable={!isLayoutLocked}
        resizeHandle={getResizeHandle}
        containerPadding={{ xl: [0, 0], lg: [0, 0], md: [0, 0], sm: [0, 0] }}
        margin={{ xl: [16, 16], lg: [16, 16], md: [16, 16], sm: [16, 16] }}
        resizeHandles={['sw', 'nw', 'se', 'ne']}
        // add droppping item default based on dragged template
        droppingItem={droppingItemTemplate}
        isDroppable={!isLayoutLocked}
        onDrop={onDrop}
        useCSSTransforms
        verticalCompact
        onLayoutChange={debouncedOnLayoutChange}
        onBreakpointChange={onBreakpointChange}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          activeLayout.map(({ widgetType, title, ...rest }, index) => (
            <div
              key={rest.i}
              data-grid={rest}
              onKeyUp={(e) => onKeyUp(e, rest.i)}
              tabIndex={index}
              style={{
                boxShadow: activeItem === rest.i ? '0 0 2px 2px #2684FF' : 'none',
                ...(activeItem === rest.i ? { outline: 'none' } : {}),
              }}
            >
              <GridTile
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                title={rest.i}
                widgetType={widgetType}
                // these will be dynamically calculated once the dimensions are calculated
                widgetConfig={{ ...rest, colWidth: 1200 / 4 }}
                setWidgetAttribute={setWidgetAttribute}
                removeWidget={removeWidget}
              >
                {rest.i}
              </GridTile>
            </div>
          ))
        }
      </ResponsiveGridLayout>
      {activeLayout.length === 0 && <LayoutEmptyState />}
    </div>
  );
};

export default GridLayout;
