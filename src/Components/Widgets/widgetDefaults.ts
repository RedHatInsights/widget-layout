import AnsibleIcon from './SimpleServiceWidgets/images/AnsibleIcon';
import EdgeIcon from './SimpleServiceWidgets/images/EdgeIcon';
import InsightsIcon from './SimpleServiceWidgets/images/InsightsIcon';
import OpenShiftIcon from './SimpleServiceWidgets/images/OpenShiftIcon';
import { WidgetTypes } from './widgetTypes';
import { BaconIcon } from '@patternfly/react-icons';

export const widgetDefaultWidth: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 4,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RhelWidget]: 2,
  [WidgetTypes.OpenShiftWidget]: 2,
  [WidgetTypes.AnsibleWidget]: 2,
  [WidgetTypes.EdgeWidget]: 2,
};

export const widgetDefaultHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RhelWidget]: 3,
  [WidgetTypes.OpenShiftWidget]: 2,
  [WidgetTypes.AnsibleWidget]: 2,
  [WidgetTypes.EdgeWidget]: 2,
};

// these will depend entirely on widget implementation
export const widgetMaxHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 6,
  [WidgetTypes.MediumWidget]: 4,
  [WidgetTypes.SmallWidget]: 2,
  [WidgetTypes.RhelWidget]: 4,
  [WidgetTypes.OpenShiftWidget]: 4,
  [WidgetTypes.AnsibleWidget]: 4,
  [WidgetTypes.EdgeWidget]: 4,
};

export const widgetMinHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 1,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RhelWidget]: 2,
  [WidgetTypes.OpenShiftWidget]: 2,
  [WidgetTypes.AnsibleWidget]: 2,
  [WidgetTypes.EdgeWidget]: 2,
};

export const widgetDefaultTitles: { [widgetName in WidgetTypes]: string } = {
  [WidgetTypes.LargeWidget]: 'Large Widget',
  [WidgetTypes.MediumWidget]: 'Medium Widget',
  [WidgetTypes.SmallWidget]: 'Small Widget',
  [WidgetTypes.RhelWidget]: 'Red Hat Enterprise Linux',
  [WidgetTypes.OpenShiftWidget]: 'Red Hat OpenShift',
  [WidgetTypes.AnsibleWidget]: 'Ansible Automation Platform',
  [WidgetTypes.EdgeWidget]: 'Edge Management',
};

export const widgetDefaultIcons: { [widgetName in WidgetTypes]: React.ComponentClass } = {
  [WidgetTypes.LargeWidget]: BaconIcon,
  [WidgetTypes.MediumWidget]: BaconIcon,
  [WidgetTypes.SmallWidget]: BaconIcon,
  [WidgetTypes.RhelWidget]: InsightsIcon,
  [WidgetTypes.OpenShiftWidget]: OpenShiftIcon,
  [WidgetTypes.AnsibleWidget]: AnsibleIcon,
  [WidgetTypes.EdgeWidget]: EdgeIcon,
};
