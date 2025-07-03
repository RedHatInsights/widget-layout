# GridLayout Component Documentation

## Overview

The `GridLayout` component (`src/Components/DnDLayout/GridLayout.tsx`) is the core layout engine that provides responsive, drag-and-drop functionality for widget positioning. It uses `react-grid-layout` under the hood and manages template persistence, responsive breakpoints, and widget interactions.

## Component Interface

### Props

```tsx
interface GridLayoutProps {
  isLayoutLocked?: boolean;
  layoutType?: LayoutTypes;
}
```

#### isLayoutLocked (optional)
- **Type**: `boolean`
- **Default**: `false`
- **Description**: When `true`, disables all drag, drop, and resize operations
- **Effect**: Sets `isDraggable={false}`, `isResizable={false}`, and `isDroppable={false}` on ReactGridLayout

#### layoutType (optional)
- **Type**: `LayoutTypes`
- **Default**: `'landingPage'`
- **Description**: Specifies which dashboard template type to load from the backend
- **Possible Values**: Currently only `'landingPage'` is supported (as defined in `src/api/dashboard-templates.ts`)

## Responsive Grid System

### Breakpoints

The grid uses responsive breakpoints with different column counts:

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
export const breakpoints: {
  [key in Variants]: number;
} = { xl: 1550, lg: 1400, md: 1100, sm: 800 };

// From src/consts.ts
export const columns = { xl: 4, lg: 3, md: 2, sm: 1 };
```

### Grid Configuration

- **Row Height**: `56px` (fixed)
- **Columns**: Variable based on breakpoint (4/3/2/1)
- **Responsive**: Automatically adjusts layout when screen size changes
- **Container**: Minimum height of `200px`

### Breakpoint Logic

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
function getGridDimensions(currentWidth: number) {
  let variant: Variants = 'xl';
  Object.entries(breakpoints).forEach(([breakpoint, value]) => {
    if (value >= currentWidth) {
      variant = breakpoint as Variants;
    }
  });
  return variant;
}
```

## State Management

### Jotai Atoms Used

```tsx
// From the actual implementation
const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
const [template, setTemplate] = useAtom(templateAtom);
const [templateId, setTemplateId] = useAtom(templateIdAtom);
const [currentDropInItem, setCurrentDropInItem] = useAtom(currentDropInItemAtom);
const widgetMapping = useAtomValue(widgetMappingAtom);
const setCurrentlyUsedWidgets = useSetAtom(currentlyUsedWidgetsAtom);
```

#### State Atoms

- **`layoutVariantAtom`**: Current responsive variant (`'xl' | 'lg' | 'md' | 'sm'`)
- **`templateAtom`**: Complete template configuration for all breakpoints
- **`templateIdAtom`**: ID of the current template for backend persistence
- **`currentDropInItemAtom`**: Widget type being dragged (for drop preview)
- **`widgetMappingAtom`**: Available widget configurations
- **`currentlyUsedWidgetsAtom`**: List of widget types currently in use

## Drag and Drop System

### Widget Addition via Drop

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
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
```

### Drop Preview

```tsx
// Drop preview template
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
```

### Widget Management Functions

```tsx
// Widget attribute modification
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

// Widget removal
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
```

## Template Persistence

### Debounced Save

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
const debouncedPatchDashboardTemplate = DebouncePromise(patchDashboardTemplate, 1500, {
  onlyResolvesLast: true,
});

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
```

### Template Loading

```tsx
// Template initialization from backend
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
```

## Responsive Behavior

### Resize Observer

```tsx
// Automatic layout variant detection
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
```

## Grid Tile Integration

### Widget Rendering

```tsx
// How widgets are rendered within GridTiles
{activeLayout
  .map(({ widgetType, title, ...rest }, index) => {
    const widget = getWidget(widgetMapping, widgetType);
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
```

### GridTile Props Interface

```tsx
// From src/Components/DnDLayout/GridTile.tsx
export type SetWidgetAttribute = <T extends string | number | boolean>(id: string, attributeName: keyof ExtendedLayoutItem, value: T) => void;

export type GridTileProps = React.PropsWithChildren<{
  widgetType: string;
  icon?: React.ComponentClass;
  setIsDragging: (isDragging: boolean) => void;
  isDragging: boolean;
  setWidgetAttribute: SetWidgetAttribute;
  widgetConfig: Layout & {
    colWidth: number;
    locked?: boolean;
    config?: WidgetConfiguration;
  };
  removeWidget: (id: string) => void;
}>;
```

## Empty State

### LayoutEmptyState Component

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
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
```

### Empty State Display Logic

```tsx
// Empty state is shown when no widgets exist and not currently dropping
{activeLayout.length === 0 && !currentDropInItem && isLoaded && <LayoutEmptyState />}
```

## Resize Handles

### Custom Resize Handle

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
const getResizeHandle = (resizeHandleAxis: string, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div ref={ref} className={`react-resizable-handle react-resizable-handle-${resizeHandleAxis}`}>
      <img src={ResizeHandleIcon} />
    </div>
  );
};
```

### ReactGridLayout Configuration

```tsx
<ReactGridLayout
  key={'grid-' + layoutVariant}
  draggableHandle=".drag-handle"
  layout={template[layoutVariant]}
  cols={columns[layoutVariant]}
  rowHeight={56}
  width={layoutWidth}
  isDraggable={!isLayoutLocked}
  isResizable={!isLayoutLocked}
  resizeHandle={getResizeHandle as unknown as ReactGridLayoutProps['resizeHandle']}
  resizeHandles={['sw', 'nw', 'se', 'ne']}
  droppingItem={droppingItemTemplate}
  isDroppable={!isLayoutLocked}
  onDrop={onDrop}
  useCSSTransforms
  verticalCompact
  onLayoutChange={onLayoutChange}
>
  {/* Widget content */}
</ReactGridLayout>
```

## Styling

### CSS Classes and Styling

The component uses several CSS files:

- **`react-grid-layout/css/styles.css`**: Base grid layout styles
- **`./GridLayout.scss`**: Custom overrides and enhancements

#### Key Style Features (from `GridLayout.scss`)

```scss
.react-grid-item {
  .react-resizable-handle-nw, .react-resizable-handle-sw, .react-resizable-handle-se {
    display: none;
  }

  &:hover, &:active {
    &:not(.static) {
      .react-resizable-handle-nw, .react-resizable-handle-sw, .react-resizable-handle-se {
        display: inherit;
      }
    }
  }

  &.react-grid-placeholder {
    background-color: var(--pf-t--color--gray--60);
    border-radius: 12px;
  }
}

#widget-layout-container {
  width: 100%;
  min-height: 200px;
}
```

### Widget CSS Classes

Each widget container gets dynamic CSS classes:

```tsx
className={`widget-columns-${rest.w} widget-rows-${rest.h}`}
```

## Analytics Integration

### Event Tracking

```tsx
// Widget addition tracking
analytics.track('widget-layout.widget-add', { data });

// Widget movement tracking (in GridTile)
analytics.track('widget-layout.widget-move', { widgetType });

// Widget removal tracking (in GridTile)
analytics.track('widget-layout.widget-remove', { widgetType });
```

## Error Handling

### Template Loading Errors

```tsx
.catch((err) => {
  console.error(err);
  addNotification({
    variant: 'danger',
    title: 'Failed to fetch dashboard template',
    description: 'Try reloading the page.',
  });
})
```

### Template Saving Errors

```tsx
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
```

## Usage Example

```tsx
import GridLayout from './Components/DnDLayout/GridLayout';

// Basic usage
<GridLayout />

// With layout locked
<GridLayout isLayoutLocked={true} />

// With specific layout type
<GridLayout layoutType="landingPage" />

// Combined
<GridLayout isLayoutLocked={false} layoutType="landingPage" />
```

## Performance Considerations

### Debounced Persistence
- Layout changes are debounced for **1.5 seconds** to avoid excessive API calls
- Uses `onlyResolvesLast: true` to cancel pending saves when new changes occur

### Grid Reset
- Critical key `key={'grid-' + layoutVariant}` forces ReactGridLayout remount when breakpoint changes
- Necessary for proper responsive behavior

### Resize Observer
- Uses modern `ResizeObserver` API for efficient layout monitoring
- Properly cleaned up in effect cleanup function

## Dependencies

### Required State Atoms
- `layoutVariantAtom` (from `src/state/layoutAtom.ts`)
- `templateAtom` and `templateIdAtom` (from `src/state/templateAtom.ts`)
- `currentDropInItemAtom` (from `src/state/currentDropInItemAtom.ts`)
- `widgetMappingAtom` (from `src/state/widgetMappingAtom.ts`)
- `drawerExpandedAtom` (from `src/state/drawerExpandedAtom.ts`)
- `currentlyUsedWidgetsAtom` (from `src/state/currentlyUsedWidgetsAtom.ts`)
- `notificationsAtom` (from `src/state/notificationsAtom.ts`)

### Required Hooks
- `useCurrentUser()` (from `src/hooks/useCurrentUser.ts`)
- `useChrome()` (from `@redhat-cloud-services/frontend-components/useChrome`)

### External Libraries
- `react-grid-layout`: Core grid functionality
- `awesome-debounce-promise`: Debounced API calls
- `jotai`: State management
- `@patternfly/react-core`: UI components

---

*This documentation is based on the actual implementation found in `src/Components/DnDLayout/GridLayout.tsx` and related files as of the current codebase state.* 
