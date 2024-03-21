// These are unique identifiers for each widget that can appear on the dashboard
export enum WidgetTypes {
  LargeWidget = 'LargeWidget',
  MediumWidget = 'MediumWidget',
  SmallWidget = 'SmallWidget',
  RecentlyVisited = 'RecentlyVisited',
  Events = 'Events',
  ExploreCapabilities = 'ExploreCapabilities',
  RhelWidget = 'RhelWidget',
  OpenShiftWidget = 'OpenShiftWidget',
  AnsibleWidget = 'AnsibleWidget',
  EdgeWidget = 'EdgeWidget',
  LearningResourcesWidget = 'LearningResourcesWidget',
}

export function isWidgetType(type: string): type is WidgetTypes {
  return Object.values(WidgetTypes).includes(type as WidgetTypes);
}
