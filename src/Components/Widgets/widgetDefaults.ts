import { WidgetTypes } from './widgetTypes';
import { BaconIcon } from '@patternfly/react-icons';
import { RocketIcon } from '@patternfly/react-icons';

export const widgetDefaultWidth: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 4,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.ExploreCapabilities]: 4,
};

export const widgetDefaultHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.ExploreCapabilities]: 3,
};

// these will depend entirely on widget implementation
export const widgetMaxHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 6,
  [WidgetTypes.MediumWidget]: 4,
  [WidgetTypes.SmallWidget]: 2,
  [WidgetTypes.ExploreCapabilities]: 3,
};

export const widgetMinHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 1,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.ExploreCapabilities]: 3,
};

export const widgetDefaultTitles: { [widgetName in WidgetTypes]: string } = {
  [WidgetTypes.LargeWidget]: 'Large Widget',
  [WidgetTypes.MediumWidget]: 'Medium Widget',
  [WidgetTypes.SmallWidget]: 'Small Widget',
  [WidgetTypes.ExploreCapabilities]: 'Explore Capabilities',
};

export const widgetDefaultIcons: { [widgetName in WidgetTypes]: React.ComponentClass } = {
  [WidgetTypes.LargeWidget]: BaconIcon,
  [WidgetTypes.MediumWidget]: BaconIcon,
  [WidgetTypes.SmallWidget]: BaconIcon,
  [WidgetTypes.ExploreCapabilities]: RocketIcon,
};
