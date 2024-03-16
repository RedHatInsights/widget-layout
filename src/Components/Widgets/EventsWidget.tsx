import React, { useEffect, useState } from 'react';
import { EmptyState, EmptyStateIcon, EmptyStateVariant } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateBody } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateFooter } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { EmptyStateHeader } from '@patternfly/react-core/dist/dynamic/components/EmptyState';
import { Stack } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import { StackItem } from '@patternfly/react-core/dist/dynamic/layouts/Stack';
import { Table, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { Button } from '@patternfly/react-core/dist/dynamic/components/Button';

export type Notification = {
  id: string;
  title: string;
  description: string;
  read: boolean;
  source: string;
  created: string;
};

const EmptyStateBellIcon: React.FunctionComponent = () => (
  <svg className="pf-v5-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
    <path d="M439.4 362.3c-19.3-20.8-55.5-52-55.5-154.3 0-77.7-54.5-139.9-127.9-155.2V32c0-17.7-14.3-32-32-32s-32 14.3-32 32v20.8C118.6 68.1 64.1 130.3 64.1 208c0 102.3-36.2 133.5-55.5 154.3-6 6.5-8.7 14.2-8.6 21.7 .1 16.4 13 32 32.1 32h383.8c19.1 0 32-15.6 32.1-32 .1-7.6-2.6-15.3-8.6-21.7zM67.5 368c21.2-28 44.4-74.3 44.5-159.4 0-.2-.1-.4-.1-.6 0-61.9 50.1-112 112-112s112 50.1 112 112c0 .2-.1 .4-.1 .6 .1 85.1 23.3 131.5 44.5 159.4H67.5zM224 512c35.3 0 64-28.7 64-64H160c0 35.4 28.7 64 64 64z" />
  </svg>
);

const EventsWidget: React.FunctionComponent = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const MAX_ROWS = 5;

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/v1/notifications/drawer');
      const { data } = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Unable to get Notifications ', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const columnNames = {
    event: 'Event',
    service: 'Service',
    date: 'Date',
  };

  // TEST DATA
  // const notifications = [
  //   { id: '1', title: 'Policy triggered', source: 'Policies - Red Hat Enterprise Linux', created: '2 May 2023, 11:43 UTC' },
  //   { id: '2', title: 'New advisory', source: 'Patch - Red Hat Enterprise Linux', created: '2 May 2023, 11:43 UTC' },
  //   { id: '3', title: 'New recommendation', source: 'Advisor - Red Hat Enterprise Linux', created: '2 May 2023, 11:43 UTC' },
  //   { id: '4', title: 'New advisory', source: 'Patch - Red Hat Enterprise Linux', created: '2 May 2023, 11:43 UTC' },
  //   { id: '5', title: 'New recommendation', source: 'Advisor - Red Hat Enterprise Linux', created: '2 May 2023, 11:43 UTC' },
  // ];

  return (
    <>
      {notifications.length === 0 ? (
        <EmptyState variant={EmptyStateVariant.lg}>
          <EmptyStateHeader titleText="No fired events" headingLevel="h4" icon={<EmptyStateIcon icon={EmptyStateBellIcon} />} />
          <EmptyStateBody>
            <Stack>
              <StackItem>Either you have not set up any events on the Hybrid Cloud Console or no have been fired yet.</StackItem>
            </Stack>
          </EmptyStateBody>
          <EmptyStateFooter>
            <Button variant="secondary" component="a" href="settings/notifications">
              Manage events
            </Button>
          </EmptyStateFooter>
        </EmptyState>
      ) : (
        <Table aria-label="Events widget table" variant={TableVariant.compact}>
          <Thead>
            <Tr>
              <Th>{columnNames.event}</Th>
              <Th>{columnNames.service}</Th>
              <Th>{columnNames.date}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {notifications?.slice(0, MAX_ROWS).map((event) => (
              <Tr key={event.id}>
                <Td dataLabel={columnNames.event}>{event.title}</Td>
                <Td dataLabel={columnNames.service}>{event.source}</Td>
                <Td dataLabel={columnNames.date}>{event.created}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};

export default EventsWidget;
