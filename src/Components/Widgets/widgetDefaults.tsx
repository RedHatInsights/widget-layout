import { ScalprumComponent } from '@scalprum/react-core';
import { WidgetMapping } from '../../api/dashboard-templates';
import React, { Fragment, useEffect } from 'react';
import { Skeleton } from '@patternfly/react-core';

const LoadingComponent = ({ onFinishedLoading }: { onFinishedLoading?: () => void }) => {
  useEffect(() => {
    return () => {
      if (onFinishedLoading) {
        onFinishedLoading();
      }
    };
  }, []);

  return <Skeleton width="100%" height="100%" />;
};

export const getWidget = (widgetMapping: WidgetMapping, type: string, onFinishedLoading?: () => void) => {
  const mappedWidget = widgetMapping[type];
  if (!mappedWidget) {
    return null;
  }
  return {
    node: mappedWidget ? <ScalprumComponent fallback={<LoadingComponent onFinishedLoading={onFinishedLoading} />} {...mappedWidget} /> : <Fragment />,
    scope: mappedWidget?.scope,
    module: mappedWidget?.module,
    importName: mappedWidget?.importName,
    config: mappedWidget?.config,
  };
};
