import React from 'react';
import LargeWidget from './LargeWidget';
import { WidgetTypes } from './widgetTypes';
import MediumWidget from './MediumWidget';
import SmallWidget from './SmallWidget';
import RecentlyVisited from './RecentlyVisited';
import LearningResourcesWidget from './LearningResourcesWidget/LearningResourcesWidget';

// This maps the unique widget ID to the actual React component to be rendered
const widgetMapper: {
  [widgetName in WidgetTypes]: React.ComponentType<React.PropsWithChildren<object>>;
} = {
  [WidgetTypes.LargeWidget]: LargeWidget,
  [WidgetTypes.MediumWidget]: MediumWidget,
  [WidgetTypes.SmallWidget]: SmallWidget,
  [WidgetTypes.RecentlyVisitedSmall]: RecentlyVisited,
  [WidgetTypes.RecentlyVisitedLarge]: RecentlyVisited,
  [WidgetTypes.LearningResourcesWidgetSmall]: LearningResourcesWidget,
  [WidgetTypes.LearningResourcesWidgetLarge]: LearningResourcesWidget,
};

export default widgetMapper;
