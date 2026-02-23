# Layout Data Format Documentation

## Overview

The widget layout system uses a comprehensive data format for managing dashboard templates, widget positioning, and responsive layouts. This document details the complete data structure based on the actual implementation in the codebase.

## Core Data Types

### Layout (React Grid Layout)

The foundation of the layout system is the `Layout` type from `react-grid-layout` (version 1.5.1):

```tsx
// From react-grid-layout package
interface Layout {
  i: string;        // Widget identifier (unique key)
  x: number;        // X position in grid columns
  y: number;        // Y position in grid rows
  w: number;        // Width in grid columns
  h: number;        // Height in grid rows
  minW?: number;    // Minimum width
  maxW?: number;    // Maximum width
  minH?: number;    // Minimum height
  maxH?: number;    // Maximum height
  static?: boolean; // If true, widget cannot be moved/resized
  isDraggable?: boolean; // Override draggable behavior
  isResizable?: boolean; // Override resizable behavior
  isBounded?: boolean;   // If true, widget cannot be moved outside the grid
}
```

### LayoutWithTitle

The system extends the base Layout with a title property:

```tsx
// From src/api/dashboard-templates.ts
export type LayoutWithTitle = Layout & { 
  title: string;
};
```

### ExtendedLayoutItem

The frontend tracks additional metadata not stored in the backend:

```tsx
// From src/api/dashboard-templates.ts
export type ExtendedLayoutItem = LayoutWithTitle & {
  widgetType: string;           // Type of widget (e.g., 'complianceScoreCard')
  config?: WidgetConfiguration; // Widget-specific configuration
  locked?: boolean;             // If true, widget cannot be moved/resized
};
```

### Widget Identifier Format

Widget identifiers follow a specific pattern:

```tsx
// From src/api/dashboard-templates.ts
export const widgetIdSeparator = '#';

// Format: "widgetType#uniqueId"
// Example: "complianceScoreCard#550e8400-e29b-41d4-a716-446655440000"
export const getWidgetIdentifier = (widgetType: string, uniqueId: string = crypto.randomUUID()) => {
  return `${widgetType}${widgetIdSeparator}${uniqueId}`;
};
```

## Responsive Layout System

### Breakpoints and Variants

The system uses four responsive breakpoints:

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
export const breakpoints: {
  [key in Variants]: number;
} = { 
  xl: 1550,  // Extra large screens
  lg: 1400,  // Large screens
  md: 1100,  // Medium screens
  sm: 800    // Small screens
};

// From src/api/dashboard-templates.ts
export type Variants = 'sm' | 'md' | 'lg' | 'xl';
```

### Grid Columns per Breakpoint

```tsx
// From src/consts.ts
export const columns = {
  xl: 4,  // 4 columns on extra large screens
  lg: 3,  // 3 columns on large screens
  md: 2,  // 2 columns on medium screens
  sm: 1   // 1 column on small screens
};
```

### Row Height

```tsx
// Fixed row height across all breakpoints
const rowHeight = 56; // pixels
```

## Template Configuration Structure

### TemplateConfig

The backend stores layout configurations for all responsive breakpoints:

```tsx
// From src/api/dashboard-templates.ts
export type TemplateConfig = {
  [k in Variants]: LayoutWithTitle[];
};

// Example structure:
const exampleTemplateConfig: TemplateConfig = {
  sm: [
    { i: "widget1#uuid", x: 0, y: 0, w: 1, h: 3, title: "System Status" },
    { i: "widget2#uuid", x: 0, y: 3, w: 1, h: 2, title: "Compliance Score" }
  ],
  md: [
    { i: "widget1#uuid", x: 0, y: 0, w: 1, h: 3, title: "System Status" },
    { i: "widget2#uuid", x: 1, y: 0, w: 1, h: 2, title: "Compliance Score" }
  ],
  lg: [
    { i: "widget1#uuid", x: 0, y: 0, w: 2, h: 3, title: "System Status" },
    { i: "widget2#uuid", x: 2, y: 0, w: 1, h: 2, title: "Compliance Score" }
  ],
  xl: [
    { i: "widget1#uuid", x: 0, y: 0, w: 2, h: 3, title: "System Status" },
    { i: "widget2#uuid", x: 2, y: 0, w: 1, h: 2, title: "Compliance Score" }
  ]
};
```

### ExtendedTemplateConfig

The frontend extends the template configuration with additional metadata:

```tsx
// From src/api/dashboard-templates.ts
export type ExtendedTemplateConfig = {
  [k in Variants]: ExtendedLayoutItem[];
};

// Example with extended properties:
const exampleExtendedConfig: ExtendedTemplateConfig = {
  sm: [
    { 
      i: "complianceScoreCard#uuid", 
      x: 0, y: 0, w: 1, h: 3, 
      title: "Compliance Score",
      widgetType: "complianceScoreCard",
      config: {
        icon: "SecurityIcon",
        title: "Compliance Score",
        headerLink: { title: "View Details", href: "/compliance" }
      },
      locked: false
    }
  ],
  // ... other breakpoints
};
```

## Backend Data Structures

### BaseTemplate

Base template structure returned by the backend:

```tsx
// From src/api/dashboard-templates.ts
export type BaseTemplate = {
  name: string;              // Template identifier
  displayName: string;       // Human-readable name
  templateConfig: TemplateConfig;  // Layout configuration
};

// Example API response:
{
  "data": {
    "name": "landingPage",
    "displayName": "Landing Page",
    "templateConfig": {
      "sm": [...],
      "md": [...],
      "lg": [...],
      "xl": [...]
    }
  }
}
```

### DashboardTemplate

User-specific template with metadata:

```tsx
// From src/api/dashboard-templates.ts
export type DashboardTemplate = {
  id: number;                    // Template ID
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  deletedAt: string | null;      // ISO timestamp or null
  userIdentityID: number;        // User identifier
  default: boolean;              // If true, this is the user's default template
  TemplateBase: {
    name: string;                // Template type (e.g., "landingPage")
    displayName: string;         // Human-readable name
  };
  templateConfig: TemplateConfig;  // Layout configuration
};

// Example API response:
{
  "data": [
    {
      "id": 123,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:45:00Z",
      "deletedAt": null,
      "userIdentityID": 456,
      "default": true,
      "TemplateBase": {
        "name": "landingPage",
        "displayName": "Landing Page"
      },
      "templateConfig": {
        "sm": [...],
        "md": [...],
        "lg": [...],
        "xl": [...]
      }
    }
  ]
}
```

## Widget Configuration

### WidgetDefaults

Default sizing constraints for widgets:

```tsx
// From src/api/dashboard-templates.ts
export type WidgetDefaults = {
  w: number;      // Default width in grid columns
  h: number;      // Default height in grid rows
  maxH: number;   // Maximum height
  minH: number;   // Minimum height
};

// Example widget defaults:
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

### WidgetConfiguration

Widget-specific configuration and metadata:

```tsx
// From src/api/dashboard-templates.ts
export type WidgetConfiguration = {
  icon?: string;                    // Icon identifier
  headerLink?: WidgetHeaderLink;    // Header link configuration
  title?: string;                   // Widget title
  permissions?: WidgetPermission[]; // Permission requirements
};

export type WidgetHeaderLink = {
  title?: string;  // Link text
  href?: string;   // Link URL
};

export type WidgetPermission = {
  method: keyof VisibilityFunctions;    // Permission check method
  args?: unknown[];                     // Arguments for permission check
};
```

### WidgetMapping

Complete widget registry with federated module information:

```tsx
// From src/api/dashboard-templates.ts
export type WidgetMapping = {
  [key: string]: Pick<ScalprumComponentProps, 'scope' | 'module' | 'importName'> & {
    defaults: WidgetDefaults;
    config?: WidgetConfiguration;
  };
};

// Example widget mapping:
{
  "complianceScoreCard": {
    "scope": "compliance",
    "module": "./ComplianceScoreCard",
    "importName": "ComplianceScoreCard",
    "defaults": {
      "w": 2,
      "h": 3,
      "maxH": 6,
      "minH": 2
    },
    "config": {
      "icon": "SecurityIcon",
      "title": "Compliance Score",
      "headerLink": {
        "title": "View Details",
        "href": "/compliance"
      },
      "permissions": [
        {
          "method": "hasPermissions",
          "args": [["compliance:*:read"]]
        }
      ]
    }
  }
}
```

## API Endpoints

**Note**: The API has been migrated from `/api/chrome-service/v1/dashboard-templates` to `/api/widget-layout/v1/`. The base template fetch functions have been removed, and the delete dashboard template functionality is no longer available. They were not used in this codebase.

### Dashboard Templates

```bash
GET /api/widget-layout/v1/
# Returns: DashboardTemplate[]

GET /api/widget-layout/v1/?dashboardType=landingPage
# Returns: DashboardTemplate[]
```

### Widget Mapping

```bash
GET /api/widget-layout/v1/widget-mapping
# Returns: WidgetMapping
```

### Template Management

```bash
# Update template configuration
PATCH /api/widget-layout/v1/{templateId}
Content-Type: application/json

{
  "templateConfig": {
    "sm": [...],
    "md": [...],
    "lg": [...],
    "xl": [...]
  }
}

# Reset template to base configuration
POST /api/widget-layout/v1/{templateId}/reset
```

## Data Flow and Persistence

### Template Loading Process

1. **User Authentication**: System waits for `currentUser` to be available
2. **Template Fetch**: Calls `getDashboardTemplates(layoutType)` to get user templates
3. **Default Selection**: Uses `getDefaultTemplate()` to find the template with `default: true`
4. **Data Transformation**: Converts `TemplateConfig` to `ExtendedTemplateConfig` using `mapTemplateConfigToExtendedTemplateConfig()`
5. **Responsive Setup**: Determines initial layout variant based on screen width

### Template Persistence

Layout changes are automatically persisted with a **1.5-second debounce**:

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
const debouncedPatchDashboardTemplate = DebouncePromise(patchDashboardTemplate, 1500, {
  onlyResolvesLast: true,
});

const onLayoutChange = async (currentLayout: Layout[]) => {
  // Skip if initial render or layout is locked
  if (isInitialRender || isLayoutLocked || templateId < 0) {
    return;
  }

  // Transform layout data
  const data = extendLayout({ ...template, [layoutVariant]: currentLayout });
  
  // Persist changes
  try {
    await debouncedPatchDashboardTemplate(templateId, { templateConfig: data });
  } catch (error) {
    // Handle error with notification
  }
};
```

### Widget Addition Process

When a widget is dropped onto the grid:

1. **Widget Identification**: Extract widget type from `event.dataTransfer.getData('text')`
2. **Widget Validation**: Check if widget type exists in `widgetMapping`
3. **ID Generation**: Create unique identifier using `getWidgetIdentifier()`
4. **Multi-breakpoint Update**: Update layout for all responsive breakpoints
5. **Constraint Application**: Apply widget defaults and column constraints
6. **Automatic Positioning**: Push existing widgets down if needed
7. **Analytics Tracking**: Track widget addition event

## Layout Validation and Constraints

### Column Constraints

Widgets are automatically constrained to valid column ranges:

```tsx
// From src/Components/DnDLayout/GridLayout.tsx
const newWidget = {
  // Ensure width doesn't exceed columns for each breakpoint
  w: size === layoutVariant ? layoutItem.w : Math.min(widgetMapping[data].defaults.w, columns[size as Variants]),
  // Ensure X position doesn't exceed grid bounds
  x: size === layoutVariant ? layoutItem.x : Math.min(layoutItem.x, columns[size as Variants]),
  // ... other properties
};
```

### Grid Behavior

- **Vertical Compaction**: Enabled via `verticalCompact` prop
- **CSS Transforms**: Enabled via `useCSSTransforms` for better performance
- **Draggable Handle**: Restricted to `.drag-handle` class elements
- **Resize Handles**: Available on all corners (`['sw', 'nw', 'se', 'ne']`)

## Example Complete Data Structure

```json
{
  "dashboardTemplate": {
    "id": 123,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:45:00Z",
    "deletedAt": null,
    "userIdentityID": 456,
    "default": true,
    "TemplateBase": {
      "name": "landingPage",
      "displayName": "Landing Page"
    },
    "templateConfig": {
      "sm": [
        {
          "i": "complianceScoreCard#550e8400-e29b-41d4-a716-446655440000",
          "x": 0,
          "y": 0,
          "w": 1,
          "h": 3,
          "title": "Compliance Score"
        }
      ],
      "md": [
        {
          "i": "complianceScoreCard#550e8400-e29b-41d4-a716-446655440000",
          "x": 0,
          "y": 0,
          "w": 2,
          "h": 3,
          "title": "Compliance Score"
        }
      ],
      "lg": [
        {
          "i": "complianceScoreCard#550e8400-e29b-41d4-a716-446655440000",
          "x": 0,
          "y": 0,
          "w": 2,
          "h": 3,
          "title": "Compliance Score"
        }
      ],
      "xl": [
        {
          "i": "complianceScoreCard#550e8400-e29b-41d4-a716-446655440000",
          "x": 0,
          "y": 0,
          "w": 2,
          "h": 3,
          "title": "Compliance Score"
        }
      ]
    }
  },
  "widgetMapping": {
    "complianceScoreCard": {
      "scope": "compliance",
      "module": "./ComplianceScoreCard",
      "importName": "ComplianceScoreCard",
      "defaults": {
        "w": 2,
        "h": 3,
        "maxH": 6,
        "minH": 2
      },
      "config": {
        "icon": "SecurityIcon",
        "title": "Compliance Score",
        "headerLink": {
          "title": "View Details",
          "href": "/compliance"
        },
        "permissions": [
          {
            "method": "hasPermissions",
            "args": [["compliance:*:read"]]
          }
        ]
      }
    }
  }
}
```

## Type Definitions Summary

```tsx
// Complete type hierarchy
export type LayoutTypes = 'landingPage';
export type Variants = 'sm' | 'md' | 'lg' | 'xl';

export type LayoutWithTitle = Layout & { title: string };
export type ExtendedLayoutItem = LayoutWithTitle & {
  widgetType: string;
  config?: WidgetConfiguration;
  locked?: boolean;
};

export type TemplateConfig = {
  [k in Variants]: LayoutWithTitle[];
};

export type ExtendedTemplateConfig = {
  [k in Variants]: ExtendedLayoutItem[];
};

export type DashboardTemplate = {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  userIdentityID: number;
  default: boolean;
  TemplateBase: {
    name: string;
    displayName: string;
  };
  templateConfig: TemplateConfig;
};

export type WidgetMapping = {
  [key: string]: Pick<ScalprumComponentProps, 'scope' | 'module' | 'importName'> & {
    defaults: WidgetDefaults;
    config?: WidgetConfiguration;
  };
};
```

This comprehensive data format enables responsive, persistent, and extensible widget layouts while maintaining a clean separation between frontend presentation logic and backend data storage. 
