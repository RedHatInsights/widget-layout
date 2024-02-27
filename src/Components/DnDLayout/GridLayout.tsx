import 'react-grid-layout/css/styles.css';
import './GridLayout.scss';
import { Layout, ReactGridLayoutProps, Responsive, ResponsiveProps, WidthProvider } from 'react-grid-layout';
import ResizeHandleIcon from './resize-handle.svg';
import GridTile, { SetWidgetAttribute } from './GridTile';
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WidgetTypes } from '../Widgets/widgetTypes';
import { widgetDefaultHeight, widgetDefaultWidth, widgetMaxHeight, widgetMinHeight } from '../Widgets/widgetDefaults';
import { atom, useAtom, useAtomValue } from 'jotai';
import { currentDropInItemAtom } from '../../state/currentDropInItemAtom';
import { activeLayoutVariantAtom, layoutAtom } from '../../state/layoutAtom';
import { activeTemplateIdAtom, templateAtom } from '../../state/templateAtom';
import React from 'react';
import {
  DashboardTemplate,
  ExtendedLayoutItem,
  Variants,
  getDashboardTemplates,
  getDefaultTemplate,
  mapPartialExtendedTemplateConfigToPartialTemplateConfig,
  mapTemplateConfigToExtendedTemplateConfig,
  patchDashboardTemplate,
} from '../../api/dashboard-templates';
import useCurrentUser from '../../hooks/useCurrentUser';
import { useDispatch } from 'react-redux';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/redux';

const ResponsiveGridLayout = WidthProvider(Responsive);

const activeItemAtom = atom<string | undefined>(undefined);

function isWidgetType(type: string): type is WidgetTypes {
  return Object.values(WidgetTypes).includes(type as WidgetTypes);
}

const getResizeHandle = (resizeHandleAxis: string, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={`react-resizable-handle react-resizable-handle-${resizeHandleAxis}`}>
      <img src={ResizeHandleIcon} />
    </div>
  );
};

export const DROPPING_ELEM_ID = '__dropping-elem__';

const GridLayout = ({ isLayoutLocked = false }: { isLayoutLocked?: boolean }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [layout, setLayout] = useAtom(layoutAtom);
  const [template, setTemplate] = useAtom(templateAtom);
  const [activeTemplateId, setActiveTemplateId] = useAtom(activeTemplateIdAtom);
  const [activeLayoutVariant, setActiveLayoutVariant] = useAtom(activeLayoutVariantAtom);
  const [activeItem, setActiveItem] = useAtom(activeItemAtom);
  const layoutRef = useRef<HTMLDivElement>(null);
  const { currentToken } = useCurrentUser();
  const dispatch = useDispatch();

  const currentDropInItem = useAtomValue(currentDropInItemAtom);
  const droppingItemTemplate: ReactGridLayoutProps['droppingItem'] = useMemo(() => {
    if (currentDropInItem) {
      return {
        i: DROPPING_ELEM_ID,
        w: widgetDefaultWidth[currentDropInItem],
        h: widgetDefaultHeight[currentDropInItem],
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
    if (isWidgetType(data)) {
      const newWidget = {
        ...layoutItem,
        // w: layoutItem.x + layoutItem.w > 3 ? 1 : 3,
        // x: 4 % layoutItem.w,
        // x: layoutItem.x + layoutItem.w > 3 ? 3 : 0,
        h: widgetDefaultHeight[data],
        maxH: widgetMaxHeight[data],
        minH: widgetMinHeight[data],
        widgetType: data,
        i: `${data}#${Date.now() + Math.random()}`,
        title: 'New title',
      };
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
      if (isLayoutLocked || activeTemplateId < 0 || !activeLayoutVariant) {
        return;
      }
      const data = mapPartialExtendedTemplateConfigToPartialTemplateConfig({ [activeLayoutVariant]: currentLayout });
      patchDashboardTemplate(activeTemplateId, { templateConfig: data }, currentToken)
        .then((template: DashboardTemplate) => {
          const extendedTemplateConfig = mapTemplateConfigToExtendedTemplateConfig(template.templateConfig);
          setTemplate(extendedTemplateConfig);
          setLayout(extendedTemplateConfig[activeLayoutVariant]);
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
    [isLayoutLocked, activeTemplateId, activeLayoutVariant, currentToken]
  );

  const onBreakpointChange: ResponsiveProps['onBreakpointChange'] = (newBreakpoint) => {
    setActiveLayoutVariant(newBreakpoint as Variants);
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
    if (!currentToken || activeTemplateId >= 0) {
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
        setTemplate(extendedTemplateConfig);
        setLayout(extendedTemplateConfig['xl']);
        setActiveTemplateId(defaultTemplate.id);
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
  }, [currentToken, activeTemplateId]);

  return (
    // {/* relative position is required for the grid layout to properly calculate
    // child translation while dragging is in progress */}
    <div style={{ position: 'relative' }} ref={layoutRef}>
      <ResponsiveGridLayout
        className="layout"
        draggableHandle=".drag-handle"
        layouts={template}
        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
        cols={{ xl: 4, lg: 3, md: 2, sm: 1 }}
        rowHeight={88}
        width={1200}
        isDraggable={!isLayoutLocked}
        isResizable={!isLayoutLocked}
        resizeHandle={getResizeHandle}
        resizeHandles={['sw', 'nw', 'se', 'ne']}
        // add droppping item default based on dragged template
        droppingItem={droppingItemTemplate}
        isDroppable={!isLayoutLocked}
        onDrop={onDrop}
        useCSSTransforms
        verticalCompact
        onLayoutChange={onLayoutChange}
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
    </div>
  );
};

export default GridLayout;
