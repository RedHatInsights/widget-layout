# WidgetLayout Entrypoint Interface

## Overview

The `DefaultRoute` component (`src/Routes/Default/Default.tsx`) is the main UI entry point for the widget layout application. It serves as the primary route that renders the dashboard interface with drag-and-drop widget functionality.

**Important**: This component is exported as a federated module `./WidgetLayout` from the `widgetLayout` module and is designed to be consumed via ScalprumComponent.

## Component Interface

### Props

The `DefaultRoute` component accepts the following props:

```tsx
interface DefaultRouteProps {
  layoutType?: LayoutTypes;
}
```

#### layoutType (optional)
- **Type**: `LayoutTypes` 
- **Default**: `'landingPage'` (handled internally by GridLayout)
- **Description**: Specifies the type of dashboard layout to render
- **Possible Values**: Currently only `'landingPage'` is supported (as defined in `src/api/dashboard-templates.ts`)

## Module Federation Export

The component is exported as a federated module in `fec.config.js`:

```javascript
moduleFederation: {
  moduleName: 'widgetLayout',
  exposes: {
    './RootApp': path.resolve(__dirname, './src/AppEntry.tsx'),
    './WidgetLayout': path.resolve(__dirname, './src/Routes/Default/Default.tsx'),
  },
  // ... other config
}
```

## Usage Examples

### Consumption via ScalprumComponent

```tsx
import { ScalprumComponent } from '@scalprum/react-core';

// Consume the federated WidgetLayout module
const MyDashboard = () => {
  return (
    <ScalprumComponent
      scope="widgetLayout"
      module="./WidgetLayout"
      fallback={<div>Loading...</div>}
      layoutType="landingPage"
    />
  );
};
```

### Direct Usage (Internal)

```tsx
import DefaultRoute from './Routes/Default/Default';

// Direct usage within the same application
const App = () => {
  return <DefaultRoute />;
};
```

*Note: This is the actual usage pattern found in `src/App.tsx`*

### With Layout Type Specification

```tsx
import DefaultRoute from './Routes/Default/Default';
import { LayoutTypes } from './api/dashboard-templates';

const App = () => {
  return <DefaultRoute layoutType="landingPage" />;
};
```

## Component Structure

The `DefaultRoute` component renders the following structure:

```jsx
<div className="widgetLayout">
  <Portal notifications={notifications} removeNotification={removeNotification} />
  <Header />
  <AddWidgetDrawer dismissible={false}>
    <PageSection hasBodyWrapper={false} className="widg-c-page__main-section--grid 6-u-p-md-on-sm">
      <GridLayout isLayoutLocked={isLayoutLocked} {...props} />
    </PageSection>
  </AddWidgetDrawer>
</div>
```

## Dependencies

### Required Imports

```tsx
import { PageSection } from '@patternfly/react-core';
import AddWidgetDrawer from '../../Components/WidgetDrawer/WidgetDrawer';
import GridLayout from '../../Components/DnDLayout/GridLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { lockedLayoutAtom } from '../../state/lockedLayoutAtom';
import { notificationsAtom, useRemoveNotification } from '../../state/notificationsAtom';
import Header from '../../Components/Header/Header';
import useCurrentUser from '../../hooks/useCurrentUser';
import { LayoutTypes, WidgetPermission, getWidgetMapping } from '../../api/dashboard-templates';
import { widgetMappingAtom } from '../../state/widgetMappingAtom';
import Portal from '@redhat-cloud-services/frontend-components-notifications/Portal';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
```

### State Dependencies

The component uses the following Jotai atoms:

- `lockedLayoutAtom`: Determines if the layout is locked (read-only)
- `notificationsAtom`: Manages application notifications
- `widgetMappingAtom`: Stores widget configuration mapping

### Hook Dependencies

- `useCurrentUser()`: Provides current user information
- `useChrome()`: Provides Chrome service functionality including `visibilityFunctions`

## Key Features

### 1. Permission-Based Widget Filtering

The component filters available widgets based on user permissions:

```tsx
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

### 2. Widget Mapping Initialization

On component mount (when `currentUser` is available), it:
1. Fetches widget mapping via `getWidgetMapping()`
2. Filters widgets based on permissions
3. Updates the `widgetMappingAtom` with permitted widgets

### 3. Notification System

Integrates with the notification system through:
- `Portal` component for rendering notifications
- `notificationsAtom` for notification state
- `useRemoveNotification` hook for notification management

## Integration with Child Components

### GridLayout Component

The `DefaultRoute` passes the following props to `GridLayout`:

```tsx
<GridLayout 
  isLayoutLocked={isLayoutLocked} 
  {...props} // Spreads any props passed to DefaultRoute (including layoutType)
/>
```

### AddWidgetDrawer Component

Wraps the main content and provides the widget selection interface:

```tsx
<AddWidgetDrawer dismissible={false}>
  {/* Main content */}
</AddWidgetDrawer>
```

## Type Definitions

```tsx
// From src/api/dashboard-templates.ts
export type LayoutTypes = 'landingPage';

export type WidgetPermission = {
  method: VisibilityFunctionKeys;
  args?: Parameters<VisibilityFunctions[VisibilityFunctionKeys]>;
};
```

## Error Handling

The component includes error handling for:
- Permission checking failures (logged to console)
- Network errors during widget mapping fetch
- Invalid widget configurations

## Styling

The component uses the following CSS classes:
- `widgetLayout`: Main container class
- `widg-c-page__main-section--grid`: Grid layout styling
- `6-u-p-md-on-sm`: Responsive padding utilities

*Note: Styles are defined in `src/App.scss`*

## Module Federation Integration

This component is designed to work within the Red Hat Cloud Services platform's module federation architecture as a federated module.

### Federated Module Details

- **Module Name**: `widgetLayout`
- **Exposed Component**: `./WidgetLayout` 
- **Source Path**: `src/Routes/Default/Default.tsx`
- **Consumption**: Via ScalprumComponent from `@scalprum/react-core`

### Integration Points

- **Chrome Services**: User authentication and permissions via `useChrome()` hook
- **Notification System**: Platform notifications through `@redhat-cloud-services/frontend-components-notifications`
- **Widget Ecosystem**: Dynamic widget loading through federated module system
- **Permission System**: Role-based access control via Chrome's `visibilityFunctions`

### Consumer Applications

Other applications can consume this widget layout interface by:

1. **Using ScalprumComponent** to load the `./WidgetLayout` module
2. **Passing layout configuration** via props (e.g., `layoutType`)
3. **Configuring shared dependencies** in their `fec.config.js` if needed

Example configuration in a consuming application's `fec.config.js`:

```javascript
// fec.config.js for consuming application
module.exports = {
  // ... other configuration
  moduleFederation: {
    moduleName: 'consumerApp',
    shared: [
      {
        'react-router-dom': { singleton: true, version: dependencies['react-router-dom'], requiredVersion: '*' },
      },
    ],
  },
};
```

*Note: The actual remote module consumption is handled by the ScalprumComponent at runtime, not through static webpack remotes configuration.*

---

*This documentation is based on the actual implementation found in `src/Routes/Default/Default.tsx` and related files as of the current codebase state.* 