import React from 'react';
import LargeWidget from './LargeWidget';
import { WidgetTypes } from './widgetTypes';
import MediumWidget from './MediumWidget';
import SmallWidget from './SmallWidget';
import RecentlyVisited from './RecentlyVisited';
import Events from './EventsWidget';
import { ExploreCapabilities } from './ExploreCapabilities';
import { RhelWidget } from './SimpleServiceWidgets/rhelWidget';
import { OpenShiftWidget } from './SimpleServiceWidgets/openshiftWidget';
import { AnsibleWidget } from './SimpleServiceWidgets/ansibleWidget';
import { EdgeWidget } from './SimpleServiceWidgets/edgeWidget';
import LearningResourcesWidget from './LearningResourcesWidget/LearningResourcesWidget';

// This maps the unique widget ID to the actual React component to be rendered
const widgetMapper: {
  [widgetName in WidgetTypes]: React.ComponentType<React.PropsWithChildren<object>>;
} = {
  [WidgetTypes.LargeWidget]: LargeWidget,
  [WidgetTypes.MediumWidget]: MediumWidget,
  [WidgetTypes.SmallWidget]: SmallWidget,
  [WidgetTypes.RecentlyVisited]: RecentlyVisited,
  [WidgetTypes.Events]: Events,
  [WidgetTypes.ExploreCapabilities]: ExploreCapabilities,
  [WidgetTypes.RhelWidget]: RhelWidget,
  [WidgetTypes.OpenShiftWidget]: OpenShiftWidget,
  [WidgetTypes.AnsibleWidget]: AnsibleWidget,
  [WidgetTypes.EdgeWidget]: EdgeWidget,
  [WidgetTypes.LearningResourcesWidget]: LearningResourcesWidget,
};

export default widgetMapper;
