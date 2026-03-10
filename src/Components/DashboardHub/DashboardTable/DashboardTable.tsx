import React, { useState } from 'react';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { ActionsColumn } from '@patternfly/react-table';
import { Button } from '@patternfly/react-core';
import { CopyIcon } from '@patternfly/react-icons/dist/dynamic/icons/copy-icon';
import { EditAltIcon } from '@patternfly/react-icons/dist/dynamic/icons/edit-alt-icon';
import { DashboardTemplate } from '../../../api/dashboard-templates';
import { HomeIcon } from '@patternfly/react-icons/dist/dynamic/icons/home-icon';
import { CodeIcon } from '@patternfly/react-icons/dist/dynamic/icons/code-icon';
import { UsersIcon } from '@patternfly/react-icons/dist/dynamic/icons/users-icon';
import { TrashIcon } from '@patternfly/react-icons/dist/dynamic/icons/trash-icon';

interface Dashboard {
  id: number;
  name: string;
  description: string;
  lastModified: string;
}

interface DashboardTableProps {
  dashboards: DashboardTemplate[];
}

export const ButtonCopy: React.FunctionComponent = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return <Button variant="plain" aria-label="Copy" icon={<CopyIcon />} onClick={() => {}} />;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getUTCDate();
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes} UTC`;
};

export const DashboardTable: React.FunctionComponent<DashboardTableProps> = ({ dashboards }) => {
  // Map API data to table format
  const tableData: Dashboard[] = dashboards.map((dashboard) => ({
    id: dashboard.id,
    name: dashboard.dashboardName,
    description: dashboard.templateBase.name, // TODO: Update when description field is available
    lastModified: formatDate(dashboard.updatedAt),
  }));

  const columnNames = {
    name: 'Name',
    description: 'Description',
    lastModified: 'Last Modified',
    actions: '',
  };

  // Sorting state (only for name column)
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sort dashboards by name
  const sortedDashboards = [...tableData].sort((a, b) => {
    if (activeSortDirection === 'asc') {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  const getSortParams = (): ThProps['sort'] => ({
    sortBy: {
      index: 0,
      direction: activeSortDirection,
      defaultDirection: 'asc',
    },
    onSort: (_event, _index, direction) => {
      setActiveSortDirection(direction);
    },
    columnIndex: 0,
  });

  // Row actions for each dashboard
  const getRowActions = (dashboard: Dashboard) => [
    {
      icon: <EditAltIcon />,
      title: 'Edit dashboard',
      isDisabled: true,
      onClick: () => console.log(`Edit dashboard ${dashboard.id}`),
    },
    {
      icon: <HomeIcon />,
      title: 'Set as homepage',
      isDisabled: true,
      onClick: () => console.log(`Set as homepage dashboard ${dashboard.id}`),
    },
    {
      icon: <CodeIcon />,
      title: 'Copy configuration string',
      onClick: () => console.log(`Copy configuration string ${dashboard.id}`),
    },
    {
      icon: <UsersIcon />,
      title: 'Share dashboard',
      isDisabled: true,
      onClick: () => console.log(`Share dashboard ${dashboard.id}`),
    },
    {
      isSeparator: true,
    },
    {
      icon: <TrashIcon />,
      title: 'Delete dashboard',
      isDisabled: true,
      onClick: () => console.log(`Delete dashboard ${dashboard.id}`),
    },
  ];

  return (
    <Table aria-label="Dashboards table" ouiaId="DashboardsTable">
      <Thead>
        <Tr>
          <Th sort={getSortParams()}>{columnNames.name}</Th>
          <Th>{columnNames.description}</Th>
          <Th>{columnNames.lastModified}</Th>
          <Th>{columnNames.actions}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedDashboards.map((dashboard) => (
          <Tr key={dashboard.id}>
            <Td dataLabel={columnNames.name}>{dashboard.name}</Td>
            <Td dataLabel={columnNames.description}>{dashboard.description}</Td>
            <Td dataLabel={columnNames.lastModified}>{dashboard.lastModified}</Td>
            <Td isActionCell>
              <Td className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-gap-sm">
                <ButtonCopy />
                <ActionsColumn items={getRowActions(dashboard)} />
              </Td>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default DashboardTable;
