import React from 'react';
import LargeWidget from './LargeWidget';
import { WidgetTypes } from './widgetTypes';
import MediumWidget from './MediumWidget';
import SmallWidget from './SmallWidget';
import { RhelWidget } from './SimpleServiceWidgets/rhelWidget';
import { OpenShiftWidget } from './SimpleServiceWidgets/openshiftWidget';
import { AnsibleWidget } from './SimpleServiceWidgets/ansibleWidget';
import { EdgeWidget } from './SimpleServiceWidgets/edgeWidget';

const widgetMapper: {
  [widgetName in WidgetTypes]: React.ComponentType<React.PropsWithChildren<object>>;
} = {
  [WidgetTypes.LargeWidget]: LargeWidget,
  [WidgetTypes.MediumWidget]: MediumWidget,
  [WidgetTypes.SmallWidget]: SmallWidget,
  [WidgetTypes.RhelWidget]: RhelWidget,
  [WidgetTypes.OpenShiftWidget]: OpenShiftWidget,
  [WidgetTypes.AnsibleWidget]: AnsibleWidget,
  [WidgetTypes.EdgeWidget]: EdgeWidget,
};

export default widgetMapper;
