export type {
  LayoutTypes,
  Variants,
  LayoutWithTitle,
  TemplateConfig,
  PartialTemplateConfig,
  ExtendedLayoutItem,
  ExtendedTemplateConfig,
  PartialExtendedTemplateConfig,
  BaseTemplate,
  DashboardTemplate,
  ExportDashboardTemplate,
  WidgetDefaults,
  WidgetHeaderLink,
  WidgetPermission,
  WidgetConfiguration,
  WidgetMapping,
} from './dashboard-templates-new';

export {
  widgetIdSeparator,
  DashboardTemplatesError,
  getWidgetIdentifier,
  getDefaultTemplate,
  mapWidgetDefaults,
  mapTemplateConfigToExtendedTemplateConfig,
  extendLayout,
} from './dashboard-templates-new';
