import React from 'react';
import { Text, TextContent, TextVariants } from '@patternfly/react-core/dist/dynamic/components/Text';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { Link } from 'react-router-dom';
import { Gallery } from '@patternfly/react-core/dist/dynamic/layouts/Gallery';
import { Label } from '@patternfly/react-core/dist/dynamic/components/Label';
import LearningResourcesEmptyState from './EmptyState';
import useQuickStarts from './useQuickStarts';
import { Flex, FlexItem } from '@patternfly/react-core';

export const API_BASE = '/api/quickstarts/v1';
export const QUICKSTARTS = '/quickstarts';
export const FAVORITES = '/favorites';

export type FavoriteQuickStart = {
  favorite: boolean;
  quickstartName: string;
};

const LinkWrapper = ({ pathname, title }: { pathname: string; title: string }) => {
  const { updateDocumentTitle } = useChrome();
  return (
    <Link onClick={() => updateDocumentTitle(title)} to={pathname}>
      {title}
    </Link>
  );
};

const LearningResourcesWidget: React.FunctionComponent = () => {
  const { quickStarts, bookmarks } = useQuickStarts();
  console.log(bookmarks);

  return (
    <div className="widget-learning-resources">
      {bookmarks.length === 0 ? (
        <LearningResourcesEmptyState />
      ) : (
        <Gallery hasGutter>
          {bookmarks.map(({ metadata, spec }, index) => (
            <div key={index}>
              <TextContent>
                <LinkWrapper title={spec.displayName} pathname={spec.link?.href || ''} />
              </TextContent>
              <Flex direction={{ default: 'row' }}>
                <FlexItem style={{ marginRight: 'var(--pf-v5-global--spacer--sm)' }}>
                  {spec.type && <Label color={spec.type.color}>{spec.type.text}</Label>}
                </FlexItem>
                <FlexItem>
                  <TextContent>
                    <Text component={TextVariants.small}>{metadata.namespace}</Text>
                  </TextContent>
                </FlexItem>
              </Flex>
            </div>
          ))}
        </Gallery>
      )}
    </div>
  );
};

export default LearningResourcesWidget;
