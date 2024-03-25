import { ScalprumComponent } from '@scalprum/react-core';
import { WidgetMapping } from '../../api/dashboard-templates';
import React, { Fragment } from 'react';

export const getWidget = (widgetMapping: WidgetMapping, type: string) => {
  const mappedWidget = widgetMapping[type];
  return mappedWidget ? <ScalprumComponent {...mappedWidget} /> : Fragment;
};
