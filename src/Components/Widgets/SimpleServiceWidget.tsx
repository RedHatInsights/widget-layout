import { Icon } from '@patternfly/react-core';
import React from 'react';
import { Text, TextContent } from '@patternfly/react-core/dist/dynamic/components/Text';
import ArrowRightIcon from '@patternfly/react-icons/dist/js/icons/arrow-right-icon';
import { Link } from 'react-router-dom';

interface SimpleServiceWidgetProps {
  id: number;
  body: string;
  linkTitle: string;
  url: string;
}

export const SimpleServiceWidget: React.FunctionComponent<SimpleServiceWidgetProps> = (props) => {
  return (
    <TextContent key={props.id} className="pf-v5-u-display-flex pf-v5-u-flex-direction-column pf-v5-u-p-lg pf-v5-u-align-self-stretch">
      <Text component="p" className="pf-v5-u-flex-grow-1">
        {props.body}{' '}
      </Text>
      <Text component="p">
        <Link to={props.url}>
          {props.linkTitle}
          <Icon className="pf-v5-u-ml-sm" isInline>
            <ArrowRightIcon />
          </Icon>
        </Link>
      </Text>
    </TextContent>
  );
};
