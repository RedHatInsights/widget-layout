export enum WidgetTypes {
  LargeWidget = 'LargeWidget',
  MediumWidget = 'MediumWidget',
  SmallWidget = 'SmallWidget',
  RhelWidget = 'RhelWidget',
  OpenShiftWidget = 'OpenShiftWidget',
  AnsibleWidget = 'AnsibleWidget',
  EdgeWidget = 'EdgeWidget',
}

export function isWidgetType(type: string): type is WidgetTypes {
  return Object.values(WidgetTypes).includes(type as WidgetTypes);
}
