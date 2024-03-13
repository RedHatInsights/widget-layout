import { WidgetTypes } from './widgetTypes';
import HistoryIcon from '@patternfly/react-icons/dist/js/icons/history-icon';
import { BaconIcon, OutlinedBookmarkIcon } from '@patternfly/react-icons';
import React from 'react';

// these will depend entirely on widget implementation
// these control how the widget behaves as you add it to your dashboard and manipulate it
export const widgetDefaultWidth: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RecentlyVisitedSmall]: 2,
  [WidgetTypes.RecentlyVisitedLarge]: 4,
  [WidgetTypes.LearningResourcesWidgetSmall]: 2,
  [WidgetTypes.LearningResourcesWidgetLarge]: 4,
};

export const widgetDefaultHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 3,
  [WidgetTypes.MediumWidget]: 2,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RecentlyVisitedSmall]: 2,
  [WidgetTypes.RecentlyVisitedLarge]: 4,
  [WidgetTypes.LearningResourcesWidgetSmall]: 2,
  [WidgetTypes.LearningResourcesWidgetLarge]: 3,
};

export const widgetMaxHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 6,
  [WidgetTypes.MediumWidget]: 4,
  [WidgetTypes.SmallWidget]: 2,
  [WidgetTypes.RecentlyVisitedSmall]: 4,
  [WidgetTypes.RecentlyVisitedLarge]: 4,
  [WidgetTypes.LearningResourcesWidgetSmall]: 4,
  [WidgetTypes.LearningResourcesWidgetLarge]: 4,
};

export const widgetMinHeight: { [widgetName in WidgetTypes]: number } = {
  [WidgetTypes.LargeWidget]: 1,
  [WidgetTypes.MediumWidget]: 1,
  [WidgetTypes.SmallWidget]: 1,
  [WidgetTypes.RecentlyVisitedSmall]: 2,
  [WidgetTypes.RecentlyVisitedLarge]: 1,
  [WidgetTypes.LearningResourcesWidgetSmall]: 2,
  [WidgetTypes.LearningResourcesWidgetLarge]: 1,
};

export const widgetDefaultTitles: { [widgetName in WidgetTypes]: string } = {
  [WidgetTypes.LargeWidget]: 'Large Widget',
  [WidgetTypes.MediumWidget]: 'Medium Widget',
  [WidgetTypes.SmallWidget]: 'Small Widget',
  [WidgetTypes.RecentlyVisitedSmall]: 'Small Recently Visted Widget',
  [WidgetTypes.RecentlyVisitedLarge]: 'Large Recently Visted Widget',
  [WidgetTypes.LearningResourcesWidgetSmall]: 'Small Learning Resources Widget',
  [WidgetTypes.LearningResourcesWidgetLarge]: 'Large Learning Resources Widget',
};

export const widgetDefaultIcons: { [widgetName in WidgetTypes]: React.ComponentClass } = {
  [WidgetTypes.LargeWidget]: BaconIcon,
  [WidgetTypes.MediumWidget]: BaconIcon,
  [WidgetTypes.SmallWidget]: BaconIcon,
  [WidgetTypes.RecentlyVisitedSmall]: HistoryIcon,
  [WidgetTypes.RecentlyVisitedLarge]: HistoryIcon,
  [WidgetTypes.LearningResourcesWidgetSmall]: OutlinedBookmarkIcon,
  [WidgetTypes.LearningResourcesWidgetLarge]: OutlinedBookmarkIcon,
};
