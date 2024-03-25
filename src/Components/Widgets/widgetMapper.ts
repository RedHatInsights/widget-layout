import React from 'react';
import { WidgetTypes } from './widgetTypes';
import RecentlyVisited from './RecentlyVisited';
import Events from './EventsWidget';
import { ExploreCapabilities } from './ExploreCapabilities';
import { RhelWidget } from './SimpleServiceWidgets/rhelWidget';
import { OpenShiftWidget } from './SimpleServiceWidgets/openshiftWidget';
import { AnsibleWidget } from './SimpleServiceWidgets/ansibleWidget';
import { EdgeWidget } from './SimpleServiceWidgets/edgeWidget';

// This maps the unique widget ID to the actual React component to be rendered
const widgetMapper: {
  [widgetName in WidgetTypes]: React.ComponentType<React.PropsWithChildren<object>>;
} = {
  [WidgetTypes.RecentlyVisited]: RecentlyVisited,
  [WidgetTypes.Events]: Events,
  [WidgetTypes.ExploreCapabilities]: ExploreCapabilities,
  [WidgetTypes.RhelWidget]: RhelWidget,
  [WidgetTypes.OpenShiftWidget]: OpenShiftWidget,
  [WidgetTypes.AnsibleWidget]: AnsibleWidget,
  [WidgetTypes.EdgeWidget]: EdgeWidget,
};

export default widgetMapper;
