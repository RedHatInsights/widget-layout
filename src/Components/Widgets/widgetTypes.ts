import { WidgetMapping } from '../../api/dashboard-templates';

export function isWidgetType(widgetMapping: WidgetMapping, type: string): boolean {
  return Object.keys(widgetMapping).includes(type);
}
