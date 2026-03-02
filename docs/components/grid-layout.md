# GridLayout Component Documentation

## Overview

The `GridLayout` component (`src/Components/DnDLayout/GridLayout.tsx`) is the core layout engine that provides responsive, drag-and-drop functionality for widget positioning. It uses `@patternfly/widgetized-dashboard` which internally uses `react-grid-layout` to manage template persistence, responsive breakpoints, and widget interactions.

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

## PatternFly Grid Layout Integration

### Widget Management

Widget addition, removal, drag-and-drop, and other layout operations are now handled by the `@patternfly/widgetized-dashboard` PatternFlyGridLayout component. The component provides callbacks for template changes and widget tracking:

```tsx
// Template change handler
const handleTemplateChange = async (newTemplate: ExtendedTemplateConfig) => {
  if (isLayoutLocked || templateId < 0) {
    return;
  }

  // Update local state
  setTemplate(newTemplate as any);

  // Update currently used widgets
  const activeLayout = newTemplate[layoutVariant] || [];
  setCurrentlyUsedWidgets(activeLayout.map((item) => item.widgetType));

  try {
    // Convert and persist to backend
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

// Active widgets tracking
const handleActiveWidgetsChange = (widgetTypes: string[]) => {
  setCurrentlyUsedWidgets(widgetTypes);
};

// Drawer expand/collapse tracking
const handleDrawerExpandChange = (expanded: boolean) => {
  setDrawerExpanded(expanded);
};
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

Responsive breakpoint detection and layout adjustments are now handled automatically by the `@patternfly/widgetized-dashboard` PatternFlyGridLayout component. The component internally manages viewport width detection and automatically switches between responsive variants (xl, lg, md, sm) based on the defined breakpoints.

## Widget Rendering with PatternFly Grid Layout

The component now uses `@patternfly/widgetized-dashboard` for widget rendering and management. Widget cards, drag-and-drop functionality, and layout management are handled by the PatternFlyGridLayout component.

### PatternFly Integration

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
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
```

### Widget Mapping Conversion

The component converts Scalprum widget mapping to PatternFly widget mapping format:

```tsx
const convertWidgetMapping = (scalprumMapping: ScalprumWidgetMapping): WidgetMapping => {
  const result: WidgetMapping = {};

  Object.keys(scalprumMapping).forEach((widgetType) => {
    const scalprumWidget = scalprumMapping[widgetType];
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
          fallback={<Skeleton />}
          scope={scalprumWidget.scope}
          module={scalprumWidget.module}
          importName={scalprumWidget.importName}
        />
      ),
    };
  });

  return result;
};
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

## Layout Configuration

The PatternFly GridLayout component is configured with the following props:

```tsx
<PatternFlyGridLayout
  widgetMapping={widgetMapping}           // Converted widget mapping
  template={patternFlyTemplate}           // Template for all breakpoints
  onTemplateChange={handleTemplateChange} // Template persistence handler
  isLayoutLocked={isLayoutLocked}         // Lock/unlock layout editing
  emptyStateComponent={<LayoutEmptyState />}
  documentationLink={documentationLink}   // Link to documentation
  analytics={analytics?.track}            // Analytics tracking function
  showEmptyState={!isLoaded}              // Show empty state while loading
  onDrawerExpandChange={handleDrawerExpandChange}
  onActiveWidgetsChange={handleActiveWidgetsChange}
/>
```

Widget cards, resize handles, drag handles, and other UI elements are provided by the PatternFly component internally.

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

Analytics tracking is passed to the PatternFly GridLayout component:

```tsx
<PatternFlyGridLayout
  analytics={analytics?.track ? (event, data) => analytics.track(event, data) : undefined}
  // ... other props
/>
```

The PatternFly component handles tracking of widget operations (add, move, remove, resize, etc.) internally.

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
- `@patternfly/widgetized-dashboard`: Core grid functionality and widget management
- `awesome-debounce-promise`: Debounced API calls
- `jotai`: State management
- `@patternfly/react-core`: UI components
- `@scalprum/react-core`: Federated module loading for widgets

---

*This documentation is based on the actual implementation found in `src/Components/DnDLayout/GridLayout.tsx` and related files as of the current codebase state.* 
