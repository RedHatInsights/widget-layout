export enum WidgetTypes {
  LargeWidget = 'LargeWidget',
  MediumWidget = 'MediumWidget',
  SmallWidget = 'SmallWidget',
  ExploreCapabilities = 'ExploreCapabilities',
}

export function isWidgetType(type: string): type is WidgetTypes {
  return Object.values(WidgetTypes).includes(type as WidgetTypes);
}
