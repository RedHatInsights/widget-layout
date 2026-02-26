import React from 'react';
import { Skeleton } from '@patternfly/react-core';
import { CogsIcon } from '@patternfly/react-icons';
import { WidgetMapping } from '@patternfly/widgetized-dashboard';
import { ScalprumComponent } from '@scalprum/react-core';
import { WidgetMapping as ScalprumWidgetMapping } from '../../api/dashboard-templates';
import HeaderIcon from '../Icons/HeaderIcon';

/**
 * Adapter to convert Scalprum WidgetMapping to PatternFly WidgetMapping.
 * Maps icon strings to React elements, sets scoped class names, and
 * wraps widget content in ScalprumComponent for remote module loading.
 */
const convertWidgetMapping = (scalprumMapping: ScalprumWidgetMapping): WidgetMapping => {
  const result: WidgetMapping = {};

  Object.keys(scalprumMapping).forEach((widgetType) => {
    const scalprumWidget = scalprumMapping[widgetType];
    const scopedWidgetType = `${scalprumWidget.scope}-${widgetType}`;
    result[widgetType] = {
      defaults: scalprumWidget.defaults,
      config: {
        title: scalprumWidget.config?.title,
        icon: scalprumWidget.config?.icon ? <HeaderIcon icon={scalprumWidget.config.icon} /> : <CogsIcon />,
        headerLink: scalprumWidget.config?.headerLink,
        wrapperProps: { className: scalprumWidget.scope },
        cardBodyProps: { className: scopedWidgetType },
      },
      renderWidget: (_widgetId: string) => (
        <ScalprumComponent
          fallback={<Skeleton style={{ borderRadius: 0 }} shape="square" width="100%" height="100%" />}
          scope={scalprumWidget.scope}
          module={scalprumWidget.module}
          importName={scalprumWidget.importName}
        />
      ),
    };
  });

  return result;
};

export default convertWidgetMapping;
