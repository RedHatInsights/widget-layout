# Creating Custom Widgets for Widget Layout

## Overview

Custom widgets are React components that integrate with the Widget Layout system through federated modules. They are loaded dynamically via ScalprumComponent and displayed within GridTile containers that provide drag-and-drop functionality.

## Widget System Architecture

### How Widgets Are Loaded

Widgets are loaded through a multi-step process:

1. **Widget Mapping**: The backend provides widget configuration via `/api/chrome-service/v1/dashboard-templates/widget-mapping`
2. **Module Federation**: Widgets are loaded as federated modules using ScalprumComponent (configured via `fec.config.js`)
3. **Grid Integration**: Each widget is wrapped in a GridTile that provides layout and interaction capabilities

*Note: Module federation is handled by the Red Hat Cloud Services frontend tooling. You don't need to configure webpack directly.*

### Widget Loading Flow

```tsx
// From src/Components/Widgets/widgetDefaults.tsx
export const getWidget = (widgetMapping: WidgetMapping, type: string, onFinishedLoading?: () => void) => {
  const mappedWidget = widgetMapping[type];
  if (!mappedWidget) {
    return null;
  }
  return {
    node: mappedWidget ? <ScalprumComponent fallback={<LoadingComponent onFinishedLoading={onFinishedLoading} />} {...mappedWidget} /> : <Fragment />,
    scope: mappedWidget?.scope,
    module: mappedWidget?.module,
    importName: mappedWidget?.importName,
    config: mappedWidget?.config,
  };
};
```

## Widget Configuration Structure

### WidgetMapping Type Definition

```tsx
// From src/api/dashboard-templates.ts
export type WidgetMapping = {
  [key: string]: Pick<ScalprumComponentProps, 'scope' | 'module' | 'importName'> & {
    defaults: WidgetDefaults;
    config?: WidgetConfiguration;
  };
};

export type WidgetDefaults = {
  w: number;      // Width in grid units
  h: number;      // Height in grid units
  maxH: number;   // Maximum height
  minH: number;   // Minimum height
};

export type WidgetConfiguration = {
  icon?: string;                    // Icon identifier
  headerLink?: WidgetHeaderLink;    // Header link configuration
  title?: string;                   // Widget display title
  permissions?: WidgetPermission[]; // Permission requirements
};

export type WidgetHeaderLink = {
  title?: string;  // Link text
  href?: string;   // Link URL
};

export type WidgetPermission = {
  method: VisibilityFunctionKeys;
  args?: Parameters<VisibilityFunctions[VisibilityFunctionKeys]>;
};
```

## Creating a Custom Widget

### Step 1: Create the Widget Component

Your widget is a standard React component that provides content for the CardBody wrapper. **Note**: The Card wrapper (including header, title, and actions) is automatically provided by the GridTile component - your widget should only provide the content.

```tsx
// MyCustomWidget.tsx
import React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';

const MyCustomWidget: React.FC = () => {
  return (
    <Flex direction={{ default: 'column' }} style={{ height: '100%', padding: '1rem' }}>
      <FlexItem>
        <h3>My Custom Widget</h3>
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }}>
        <p>This is my custom widget content!</p>
      </FlexItem>
    </Flex>
  );
};

export default MyCustomWidget;
```

### Step 2: Set Up Module Federation

Configure your widget as a federated module in your `fec.config.js`. This requires the `@redhat-cloud-services/frontend-components-config` package, which handles the underlying webpack configuration:

```javascript
// fec.config.js
const path = require('path');
const dependencies = require('./package.json').dependencies;

module.exports = {
  appUrl: ['/my-widget-app'],
  // ... other configuration
  moduleFederation: {
    moduleName: 'myWidgetApp',
    exposes: {
      './MyCustomWidget': path.resolve(__dirname, './src/MyCustomWidget.tsx'),
    },
  },
};
```

Then build your widget using the standard tooling:

```bash
npm run build
```

### Step 3: Configure Widget Mapping

The widget mapping must be provided by the backend API at `/api/chrome-service/v1/dashboard-templates/widget-mapping`. Example configuration:

```json
{
  "myCustomWidget": {
    "scope": "myWidgetApp",
    "module": "./MyCustomWidget",
    "importName": "default",
    "defaults": {
      "w": 2,
      "h": 3,
      "maxH": 6,
      "minH": 2
    },
    "config": {
      "title": "My Custom Widget",
      "icon": "my-widget-icon",
      "headerLink": {
        "title": "View Details",
        "href": "/my-widget/details"
      },
      "permissions": [
        {
          "method": "isEntitled",
          "args": ["my-widget-access"]
        }
      ]
    }
  }
}
```

## Widget Integration Details

### GridTile Integration

Your widget is automatically wrapped in a GridTile component that provides:

- **Drag and Drop**: Move widgets around the grid
- **Resize Handles**: Resize widgets within min/max constraints
- **Widget Menu**: Lock/unlock, resize, and remove options
- **Header**: Displays title, icon, and action buttons

### Widget Container Structure

Your custom widget content is automatically wrapped in a Card structure by the GridTile component:

```tsx
// From src/Components/DnDLayout/GridTile.tsx - Simplified structure
<Card className="grid-tile">
  <CardHeader actions={{ actions: headerActions }}>
    <Flex>
      <HeaderIcon icon={widgetConfig?.config?.icon} />
      <CardTitle>{widgetConfig?.config?.title || widgetType}</CardTitle>
    </Flex>
  </CardHeader>
  <Divider />
  <CardBody className="pf-v6-u-p-0">
    {/* Your widget component renders here - this is where your custom component appears */}
    {node}
  </CardBody>
</Card>
```

**Important**: Your widget should **NOT** include Card, CardHeader, or CardTitle components as these are provided by the GridTile wrapper.

## Widget Sizing and Layout

### Grid System

The widget layout uses a responsive grid system:

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
export const breakpoints: {
  [key in Variants]: number;
} = { xl: 1550, lg: 1400, md: 1100, sm: 800 };
```

### Grid Columns by Breakpoint

```tsx
// From src/consts.ts (referenced in GridLayout)
export const columns = {
  xl: 4,
  lg: 3, 
  md: 2,
  sm: 1
};
```

### Widget Defaults Configuration

- **w**: Width in grid columns (1-4 for xl, 1-3 for lg, 1-2 for md, 1 for sm)
- **h**: Height in grid rows (each row = 56px)
- **maxH**: Maximum height the widget can be resized to
- **minH**: Minimum height the widget can be resized to

### Example Size Configurations

```json
{
  "smallWidget": {
    "defaults": { "w": 1, "h": 2, "maxH": 4, "minH": 2 }
  },
  "mediumWidget": {
    "defaults": { "w": 2, "h": 3, "maxH": 6, "minH": 2 }
  },
  "largeWidget": {
    "defaults": { "w": 3, "h": 4, "maxH": 8, "minH": 3 }
  }
}
```

## Widget Permissions

### Permission System

Widgets can specify permission requirements that are checked against Chrome's visibility functions:

```tsx
// From src/Routes/Default/Default.tsx
const checkPermissions = async (permissions: WidgetPermission[]): Promise<boolean> => {
  const permissionResults = await Promise.all(
    permissions.map(async (permission) => {
      try {
        const { method, args } = permission;
        if (visibilityFunctions[method] && typeof visibilityFunctions[method] === 'function') {
          const permissionGranted = await (visibilityFunctions[method] as (...args: unknown[]) => Promise<boolean>)(...(args || []));
          return permissionGranted;
        }
        return true;
      } catch (error) {
        console.error('Error checking permissions', error);
        return false;
      }
    })
  );
  return permissionResults.every(Boolean);
};
```

### Permission Examples

```json
{
  "permissions": [
    {
      "method": "isEntitled",
      "args": ["my-service-access"]
    },
    {
      "method": "hasPermission", 
      "args": ["my-service:read"]
    }
  ]
}
```

## Widget Styling Guidelines

### PatternFly Integration

Widgets should use PatternFly components for consistency:

```tsx
import { 
  Flex,
  FlexItem,
  Skeleton,
  EmptyState,
  // ... other PatternFly components
} from '@patternfly/react-core';
```

### Height Considerations

- **Always set height: 100%** on your root container to fill the grid tile
- **Use flexbox layouts** for responsive content within the widget
- **Consider overflow behavior** for content that exceeds widget bounds

```tsx
const MyWidget: React.FC = () => {
  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '1rem' }}>
      {/* Your content */}
    </div>
  );
};
```

## Widget Development Best Practices

### 1. Loading States

Handle loading states gracefully:

```tsx
const MyWidget: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <div style={{ height: '100%', padding: '1rem' }}>
      {isLoading ? (
        <Skeleton height="100%" />
      ) : (
        // Your content
      )}
    </div>
  );
};
```

### 2. Error Handling

Include error boundaries and graceful error handling:

```tsx
const MyWidget: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  
  if (error) {
    return (
      <div style={{ height: '100%', padding: '1rem' }}>
        <EmptyState>
          <EmptyStateBody>
            Failed to load widget: {error}
          </EmptyStateBody>
        </EmptyState>
      </div>
    );
  }
  
  // Normal render
};
```

### 3. Responsive Design

Design for different widget sizes:

```tsx
const MyWidget: React.FC = () => {
  return (
    <div className="pf-v6-u-h-100 pf-v6-u-display-flex pf-v6-u-flex-direction-column pf-v6-u-p-md">
      {/* Content that adapts to container size */}
    </div>
  );
};
```

## Testing Custom Widgets

### Widget Registration Validation

Ensure your widget is properly registered by checking the widget mapping:

```tsx
// Test if widget is available
const widgetMapping = await fetch('/api/chrome-service/v1/dashboard-templates/widget-mapping')
  .then(res => res.json());
  
console.log('Available widgets:', Object.keys(widgetMapping.data));
```

### Widget Type Validation

```tsx
// From src/Components/Widgets/widgetTypes.ts
export function isWidgetType(widgetMapping: WidgetMapping, type: string): boolean {
  return Object.keys(widgetMapping).includes(type);
}
```

## Common Issues and Solutions

### 1. Widget Not Appearing

- **Check widget mapping**: Verify the backend API returns your widget configuration
- **Verify module federation**: Ensure your widget is properly exposed
- **Check permissions**: Ensure permission checks are passing

### 2. Widget Sizing Issues

- **Review grid constraints**: Ensure width doesn't exceed column limits for breakpoints
- **Check min/max heights**: Verify height constraints are reasonable
- **Test responsive behavior**: Test across different screen sizes

### 3. Module Federation Issues

- **Shared dependencies**: Ensure shared dependencies are configured correctly in `fec.config.js`
- **Import paths**: Verify module and importName match your exposed configuration in `fec.config.js`
- **Build output**: Check that your federated module is being built correctly (run `npm run build`)
- **Module name consistency**: Ensure the `moduleName` in `fec.config.js` matches the `scope` in widget mapping

## Example Complete Widget Implementation

```tsx
// MyDashboardWidget.tsx
import React, { useState, useEffect } from 'react';
import {
  Skeleton,
  EmptyState,
  EmptyStateBody
} from '@patternfly/react-core';

interface WidgetData {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

const MyDashboardWidget: React.FC = () => {
  const [data, setData] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch widget data
    fetch('/api/my-service/dashboard-data')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) {
    return (
      <div style={{ height: '100%', padding: '1rem' }}>
        <EmptyState>
          <EmptyStateBody>
            Error loading data: {error}
          </EmptyStateBody>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="pf-v6-u-h-100 pf-v6-u-display-flex pf-v6-u-flex-direction-column pf-v6-u-justify-content-center pf-v6-u-p-md">
      {isLoading ? (
        <Skeleton height="100%" />
      ) : (
        <div className="pf-v6-u-text-align-center">
          <div className="pf-v6-u-font-size-2xl pf-v6-u-font-weight-bold">
            {data?.value}
          </div>
          <div className="pf-v6-u-color-200">
            {data?.title}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDashboardWidget;
```

---

*This documentation is based on the actual implementation patterns found in the widget-layout repository and reflects the current system architecture.* 
