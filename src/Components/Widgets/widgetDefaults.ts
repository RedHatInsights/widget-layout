import { WidgetTypes } from './widgetTypes';

export const widgetDefaultWidth: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.ExploreCapabilities]: 3,
  [WidgetTypes.Explore1]: 3,
};

export const widgetDefaultHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.ExploreCapabilities]: 4,
  [WidgetTypes.Explore1]: 4,
};

// these will depend entirely on widget implementation
export const widgetMaxHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 6,
  [WidgetTypes.MediumWidget]: 4,
  [WidgetTypes.SmallWidget]: 2,
  [WidgetTypes.ExploreCapabilities]: 6,
  [WidgetTypes.Explore1]: 6,
};

export const widgetMinHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 1,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.ExploreCapabilities]: 3,
  [WidgetTypes.Explore1]: 3,
};
