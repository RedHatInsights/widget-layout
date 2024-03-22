import { ScalprumComponent } from '@scalprum/react-core';
import { WidgetMapping } from '../../api/dashboard-templates';
import React, { Fragment } from 'react';
import { BellIcon, StarIcon } from '@patternfly/react-icons';

// TODO these will depend entirely on widget implementation
export const widgetDefaultWidth: { [widgetName: string]: number } = {
  ['favoriteServices']: 4,
  ['notificationsEvents']: 2,
};

export const widgetDefaultHeight: { [widgetName: string]: number } = {
  ['favoriteServices']: 3,
  ['notificationsEvents']: 2,
};

export const widgetMaxHeight: { [widgetName: string]: number } = {
  ['favoriteServices']: 6,
  ['notificationsEvents']: 4,
};

export const widgetMinHeight: { [widgetName: string]: number } = {
  ['favoriteServices']: 1,
  ['notificationsEvents']: 1,
};

export const widgetDefaultIcons: { [widgetName: string]: React.ComponentClass } = {
  ['favoriteServices']: StarIcon,
  ['notificationsEvents']: BellIcon,
};

export const getWidget = (widgetMapping: WidgetMapping, type: string) => {
  const mappedWidget = widgetMapping[type];
  return mappedWidget ? <ScalprumComponent {...mappedWidget} /> : Fragment;
};
