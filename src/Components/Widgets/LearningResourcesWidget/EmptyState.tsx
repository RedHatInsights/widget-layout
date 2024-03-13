import React from 'react';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';
import { EmptyState } from '@patternfly/react-core';
import { EmptyStateBody } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateFooter } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateHeader } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateVariant } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Stack } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import { StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import BookMarkEmptyState from './Bookmarks_empty-state.svg';

const LearningResourcesEmptyState: React.FunctionComponent = () => {
  return (
    <EmptyState variant={EmptyStateVariant.lg} className="pf-v5-u-py-md">
      <EmptyStateHeader titleText="No bookmarked learning resources" icon={<img src={BookMarkEmptyState} />} headingLevel="h4" />
      <EmptyStateBody>
        <Stack>
          <StackItem>Add documentation, quickstarts, learning paths, and more to your bookmarks for easy access in the future.</StackItem>
        </Stack>
      </EmptyStateBody>
      <EmptyStateFooter className="pf-v5-u-mt-sm">
        <Button variant="secondary" component="a" href="settings/learning-resources#documentation">
          View all learning resources
        </Button>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default LearningResourcesEmptyState;
