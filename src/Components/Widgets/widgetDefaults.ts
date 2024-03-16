import HistoryIcon from '@patternfly/react-icons/dist/js/icons/history-icon';
import { BaconIcon } from '@patternfly/react-icons';
import { BellIcon } from '@patternfly/react-icons';
import { RocketIcon } from '@patternfly/react-icons';

import { WidgetTypes } from './widgetTypes';

import AnsibleIcon from './SimpleServiceWidgets/images/AnsibleIcon';
import EdgeIcon from './SimpleServiceWidgets/images/EdgeIcon';
import RhelIcon from './SimpleServiceWidgets/images/RhelIcon';
import OpenShiftIcon from './SimpleServiceWidgets/images/OpenShiftIcon';

import React from 'react';

// these will depend entirely on widget implementation
// these control how the widget behaves as you add it to your dashboard and manipulate it
export const widgetDefaultWidth: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 4,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RecentlyVisited]: 1,
  [WidgetTypes.Events]: 4,
  [WidgetTypes.ExploreCapabilities]: 4,
  [WidgetTypes.RhelWidget]: 1,
  [WidgetTypes.OpenShiftWidget]: 1,
  [WidgetTypes.AnsibleWidget]: 1,
  [WidgetTypes.EdgeWidget]: 1,
};

export const widgetDefaultHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RecentlyVisited]: 2,
  [WidgetTypes.Events]: 4,
  [WidgetTypes.ExploreCapabilities]: 3,
  [WidgetTypes.RhelWidget]: 3,
  [WidgetTypes.OpenShiftWidget]: 3,
  [WidgetTypes.AnsibleWidget]: 3,
  [WidgetTypes.EdgeWidget]: 3,
};

export const widgetMaxHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 6,
  [WidgetTypes.MediumWidget]: 4,
  [WidgetTypes.SmallWidget]: 2,
  [WidgetTypes.RecentlyVisited]: 4,
  [WidgetTypes.Events]: 4,
  [WidgetTypes.ExploreCapabilities]: 3,
  [WidgetTypes.RhelWidget]: 3,
  [WidgetTypes.OpenShiftWidget]: 3,
  [WidgetTypes.AnsibleWidget]: 3,
  [WidgetTypes.EdgeWidget]: 3,
};

export const widgetMinHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 1,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RecentlyVisited]: 2,
  [WidgetTypes.Events]: 1,
  [WidgetTypes.ExploreCapabilities]: 3,
  [WidgetTypes.RhelWidget]: 1,
  [WidgetTypes.OpenShiftWidget]: 1,
  [WidgetTypes.AnsibleWidget]: 1,
  [WidgetTypes.EdgeWidget]: 1,
};

export const widgetDefaultTitles: { [widgetName in WidgetTypes]: string } = {
  [WidgetTypes.LargeWidget]: 'Large Widget',
  [WidgetTypes.MediumWidget]: 'Medium Widget',
  [WidgetTypes.SmallWidget]: 'Small Widget',
  [WidgetTypes.RecentlyVisited]: 'Recently Visited',
  [WidgetTypes.Events]: 'Events',
  [WidgetTypes.ExploreCapabilities]: 'Explore Capabilities',
  [WidgetTypes.RhelWidget]: 'Red Hat Enterprise Linux',
  [WidgetTypes.OpenShiftWidget]: 'Red Hat OpenShift',
  [WidgetTypes.AnsibleWidget]: 'Ansible Automation Platform',
  [WidgetTypes.EdgeWidget]: 'Edge Management',
};

export const widgetDefaultIcons: { [widgetName in WidgetTypes]: React.ComponentClass } = {
  [WidgetTypes.LargeWidget]: BaconIcon,
  [WidgetTypes.MediumWidget]: BaconIcon,
  [WidgetTypes.SmallWidget]: BaconIcon,
  [WidgetTypes.RecentlyVisited]: HistoryIcon,
  [WidgetTypes.Events]: BellIcon,
  [WidgetTypes.ExploreCapabilities]: RocketIcon,
  [WidgetTypes.RhelWidget]: RhelIcon,
  [WidgetTypes.OpenShiftWidget]: OpenShiftIcon,
  [WidgetTypes.AnsibleWidget]: AnsibleIcon,
  [WidgetTypes.EdgeWidget]: EdgeIcon,
};
