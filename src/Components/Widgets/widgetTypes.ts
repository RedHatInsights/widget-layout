export enum WidgetTypes {
  LargeWidget = 'LargeWidget',
  MediumWidget = 'MediumWidget',
  SmallWidget = 'SmallWidget',
  ExploreCapabilities = 'ExploreCapabilities',
  Explore1 = 'Explore1',
}

export function isWidgetType(type: string): type is WidgetTypes {
  return Object.values(WidgetTypes).includes(type as WidgetTypes);
}
