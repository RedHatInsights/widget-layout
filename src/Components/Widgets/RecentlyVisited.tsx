import { Text, TextContent, TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';

import { Gallery } from '@patternfly/react-core';

import React, { Fragment } from 'react';
import { useLastVisited } from '@redhat-cloud-services/chrome';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { Link } from 'react-router-dom';

const LinkWrapper = ({ pathname, title }: { pathname: string; title: string }) => {
  const { updateDocumentTitle } = useChrome();
  return (
    <Link onClick={() => updateDocumentTitle(title)} to={pathname}>
      {title}
    </Link>
  );
};

const RecentlyVisited = () => {
  const lastVisited = useLastVisited();
  const lastVisitedData = lastVisited.slice(0, 10);
  return (
    <Gallery
      hasGutter
      maxWidths={{
        default: '300px',
      }}
    >
      {lastVisitedData.map(({ bundle, pathname, title }, index) => (
        <Fragment key={index}>
          <TextContent>
            <LinkWrapper title={title} pathname={pathname} />
            <Text component={TextVariants.small}>{bundle}</Text>
          </TextContent>
        </Fragment>
      ))}
    </Gallery>
  );
};

export default RecentlyVisited;
