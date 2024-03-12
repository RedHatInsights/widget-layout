import React from 'react';
import LargeWidget from './LargeWidget';
import { WidgetTypes } from './widgetTypes';
import MediumWidget from './MediumWidget';
import SmallWidget from './SmallWidget';
import ExploreCapabilities from './ExploreCapabilities';
import { Explore1 } from './Explore1';

const widgetMapper: {
  [widgetName in WidgetTypes]: React.ComponentType<React.PropsWithChildren<object>>;
} = {
  [WidgetTypes.LargeWidget]: LargeWidget,
  [WidgetTypes.MediumWidget]: MediumWidget,
  [WidgetTypes.SmallWidget]: SmallWidget,
  [WidgetTypes.ExploreCapabilities]: ExploreCapabilities,
  [WidgetTypes.Explore1]: Explore1,
};

export default widgetMapper;
