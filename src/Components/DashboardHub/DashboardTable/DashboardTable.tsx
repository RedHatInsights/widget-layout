import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Table, Tbody, Td, Th, ThProps, Thead, Tr } from '@patternfly/react-table';
import { ActionsColumn } from '@patternfly/react-table';
import { Alert, Button, Tooltip, TooltipPosition } from '@patternfly/react-core';
import { Link } from 'react-router-dom';
import { DashboardTemplate } from '../../../api/dashboard-templates';
import { setDefaultDashboardAtom } from '../../../state/dashboardsAtom';
import { CodeIcon, CopyIcon, EditAltIcon, HomeIcon, TrashIcon, UsersIcon } from '@patternfly/react-icons';
import { useExportDashboard } from '../../../hooks/useExportDashboard';
import { useDeleteDashboard } from '../../../hooks/useDeleteDashboard';
import { DeleteDashboardModal } from '../DeleteDashboardModal/DeleteDashboardModal';
import { DuplicateModal } from '../../DuplicateModal/DuplicateModal';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { useFlag } from '@unleash/proxy-client-react';
import { useAddNotification } from '../../../state/notificationsAtom';
import { useSetAtom } from 'jotai';

interface Dashboard {
  id: number;
  name: string;
  lastModified: string;
  isDefault: boolean;
}

const messages = defineMessages({
  duplicateAria: {
    id: 'widgetLayout.dashboardTable.duplicateAria',
    description: 'Duplicate button aria label',
    defaultMessage: 'Duplicate',
  },
  tableAria: {
    id: 'widgetLayout.dashboardTable.tableAria',
    description: 'Dashboards table aria label',
    defaultMessage: 'Dashboards table',
  },
  homepageColumn: {
    id: 'widgetLayout.dashboardTable.homepageColumn',
    description: 'Homepage column screen reader text',
    defaultMessage: 'Homepage',
  },
  actionsColumn: {
    id: 'widgetLayout.dashboardTable.actionsColumn',
    description: 'Actions column screen reader text',
    defaultMessage: 'Actions',
  },
  duplicateDashboard: {
    id: 'widgetLayout.dashboardTable.duplicateDashboard',
    description: 'Duplicate dashboard tooltip',
    defaultMessage: 'Duplicate dashboard',
  },
  noHomepageAlert: {
    id: 'widgetLayout.dashboardTable.noHomepageAlert',
    description: 'Warning shown when no homepage dashboard is set',
    defaultMessage: 'No homepage dashboard set. Please set a dashboard as your homepage.',
  },
  editDashboard: {
    id: 'widgetLayout.dashboardTable.editDashboard',
    description: 'Edit dashboard row action',
    defaultMessage: 'Edit dashboard',
  },
  setAsHomepage: {
    id: 'widgetLayout.dashboardTable.setAsHomepage',
    description: 'Set as homepage row action',
    defaultMessage: 'Set as homepage',
  },
  alreadyHomepage: {
    id: 'widgetLayout.dashboardTable.alreadyHomepage',
    description: 'Set as homepage row action tooltip',
    defaultMessage: 'This dashboard is already set as your homepage',
  },
  alreadyHomepageTooltip: {
    id: 'widgetLayout.dashboardTable.alreadyHomepageTooltip',
    description: 'Tooltip when the dashboard is already the homepage',
    defaultMessage: 'This dashboard is already set to your homepage',
  },
  copyConfiguration: {
    id: 'widgetLayout.dashboardTable.copyConfiguration',
    description: 'Copy configuration string row action',
    defaultMessage: 'Copy configuration string',
  },
  shareDashboard: {
    id: 'widgetLayout.dashboardTable.shareDashboard',
    description: 'Share dashboard row action',
    defaultMessage: 'Share dashboard',
  },
  deleteDashboard: {
    id: 'widgetLayout.dashboardTable.deleteDashboard',
    description: 'Delete dashboard row action',
    defaultMessage: 'Delete dashboard',
  },
  copiedToClipboard: {
    id: 'widgetLayout.dashboardTable.copiedToClipboard',
    description: 'Dashboard copied to clipboard notification',
    defaultMessage: "''{name}'' has been copied to clipboard",
  },
  copyFailed: {
    id: 'widgetLayout.dashboardTable.copyFailed',
    description: 'Dashboard copy to clipboard failure notification',
    defaultMessage: "Failed to copy ''{name}'' to clipboard",
  },
  setAsHomepageSuccess: {
    id: 'widgetLayout.dashboardTable.setAsHomepageSuccess',
    description: 'Dashboard set as homepage notification',
    defaultMessage: "''{name}'' has been set as homepage",
  },
  setAsHomepageFailed: {
    id: 'widgetLayout.dashboardTable.setAsHomepageFailed',
    description: 'Dashboard set as homepage failure notification',
    defaultMessage: "Failed to set ''{name}'' as homepage",
  },
  deletedNotification: {
    id: 'widgetLayout.dashboardTable.deletedNotification',
    description: 'Dashboard deleted notification',
    defaultMessage: "''{name}'' has been deleted and removed from Dashboard Hub",
  },
});

interface DashboardTableProps {
  dashboards: DashboardTemplate[];
  onRefetchDashboards: () => void;
}

export const ButtonCopy: React.FunctionComponent<{ onClick: () => void }> = ({ onClick }) => {
  const intl = useIntl();
  return <Button variant="plain" aria-label={intl.formatMessage(messages.duplicateAria)} icon={<CopyIcon />} onClick={onClick} />;
};

export const DashboardTable: React.FunctionComponent<DashboardTableProps> = ({ dashboards, onRefetchDashboards }) => {
  const { exportDashboard, isLoading, error } = useExportDashboard();
  const { deleteDashboard, isLoading: isDeleting } = useDeleteDashboard();
  const [dashboardToDelete, setDashboardToDelete] = useState<Dashboard | null>(null);
  const [duplicateDashboardId, setDuplicateDashboardId] = useState<number | null>(null);
  const isEnabledDelete = useFlag('platform.widget-layout.delete-dashboard');
  const isEnabledShare = useFlag('platform.widget-layout.share');
  const addNotification = useAddNotification();
  const setDefaultDashboard = useSetAtom(setDefaultDashboardAtom);

  // Map API data to table format
  const tableData: Dashboard[] = dashboards.map((dashboard) => ({
    id: dashboard.id,
    name: dashboard.dashboardName,
    lastModified: dashboard.updatedAt,
    isDefault: dashboard.default,
  }));

  const intl = useIntl();
  const columnNames = defineMessages({
    name: {
      id: 'widgetLayout.dashboardTable.column.name',
      description: 'Dashboards table Name column',
      defaultMessage: 'Name',
    },
    lastModified: {
      id: 'widgetLayout.dashboardTable.column.lastModified',
      description: 'Dashboards table Last Modified column',
      defaultMessage: 'Last Modified',
    },
  });

  // Sorting state
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleCopyConfiguration = async (dashboard: Dashboard) => {
    const result = await exportDashboard(dashboard.id);
    if (result) {
      try {
        const configString = JSON.stringify(result, null, 2);
        await navigator.clipboard.writeText(configString);
        addNotification({
          variant: 'success',
          title: intl.formatMessage(messages.copiedToClipboard, { name: dashboard.name }),
        });
      } catch (err) {
        addNotification({
          variant: 'danger',
          title: intl.formatMessage(messages.copyFailed, { name: dashboard.name }),
        });
      }
    }
  };

  const handleSetAsHomepage = async (dashboard: Dashboard) => {
    try {
      await setDefaultDashboard(dashboard.id);
      addNotification({
        variant: 'success',
        title: intl.formatMessage(messages.setAsHomepageSuccess, { name: dashboard.name }),
      });
    } catch (err) {
      addNotification({
        variant: 'danger',
        title: intl.formatMessage(messages.setAsHomepageFailed, { name: dashboard.name }),
      });
    }
  };

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
      title: intl.formatMessage(messages.editDashboard),
      component: (props: React.HTMLProps<HTMLAnchorElement>) => (
        <Link {...props} to={`/dashboard-hub/${dashboard.id}`} style={{ color: 'inherit', textDecoration: 'inherit' }} />
      ),
    },
    {
      icon: <HomeIcon />,
      title: intl.formatMessage(messages.setAsHomepage),
      isAriaDisabled: dashboard.isDefault,
      tooltipProps: dashboard.isDefault
        ? { content: intl.formatMessage(messages.alreadyHomepageTooltip), position: TooltipPosition.left }
        : undefined,
      onClick: () => handleSetAsHomepage(dashboard),
    },
    {
      icon: <CodeIcon />,
      title: intl.formatMessage(messages.copyConfiguration),
      onClick: () => handleCopyConfiguration(dashboard),
    },
    ...(isEnabledShare
      ? [
          {
            icon: <UsersIcon />,
            title: intl.formatMessage(messages.shareDashboard),
            isDisabled: true,
            onClick: () => console.log(`Share dashboard ${dashboard.id}`),
          },
        ]
      : []),
    ...(isEnabledDelete
      ? [
          {
            isSeparator: true,
          },
          {
            icon: <TrashIcon />,
            title: intl.formatMessage(messages.deleteDashboard),
            onClick: () => setDashboardToDelete(dashboard),
          },
        ]
      : []),
  ];

  const hasHomepage = dashboards.length === 0 || dashboards.some((d) => d.default);

  const handleDeleteConfirm = async () => {
    if (dashboardToDelete) {
      const name = dashboardToDelete.name;
      await deleteDashboard(dashboardToDelete.id);
      setDashboardToDelete(null);
      addNotification({
        variant: 'danger',
        title: intl.formatMessage(messages.deletedNotification, { name }),
      });
    }
  };

  return (
    <>
      <DuplicateModal
        isOpen={duplicateDashboardId !== null}
        onClose={() => setDuplicateDashboardId(null)}
        preselectedDashboardId={duplicateDashboardId}
      />
      <DeleteDashboardModal
        isOpen={dashboardToDelete !== null}
        dashboardName={dashboardToDelete?.name ?? ''}
        isDeleting={isDeleting}
        onClose={() => setDashboardToDelete(null)}
        onDelete={handleDeleteConfirm}
      />
      {!hasHomepage && <Alert variant="warning" isInline title={intl.formatMessage(messages.noHomepageAlert)} />}
      <Table aria-label={intl.formatMessage(messages.tableAria)} ouiaId="DashboardsTable">
        <Thead>
          <Tr>
            <Th screenReaderText={intl.formatMessage(messages.homepageColumn)} modifier="fitContent" />
            <Th sort={getSortParams()}>{intl.formatMessage(columnNames.name)}</Th>
            <Th>{intl.formatMessage(columnNames.lastModified)}</Th>
            <Th screenReaderText={intl.formatMessage(messages.actionsColumn)} />
          </Tr>
        </Thead>
        <Tbody>
          {sortedDashboards.map((dashboard) => (
            <Tr key={dashboard.id}>
              <Td>{dashboard.isDefault && <HomeIcon />}</Td>
              <Td dataLabel={intl.formatMessage(columnNames.name)}>
                <Link to={`/dashboard-hub/${dashboard.id}`}>{dashboard.name}</Link>
              </Td>
              <Td dataLabel={intl.formatMessage(columnNames.lastModified)}>
                <DateFormat date={dashboard.lastModified} />
              </Td>
              <Td isActionCell>
                <Td className="pf-v6-u-display-flex pf-v6-u-align-items-center pf-v6-u-gap-sm">
                  <Tooltip content={intl.formatMessage(messages.duplicateDashboard)} position={TooltipPosition.left}>
                    <ButtonCopy onClick={() => setDuplicateDashboardId(dashboard.id)} />
                  </Tooltip>
                  <ActionsColumn items={getRowActions(dashboard)} />
                </Td>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};

export default DashboardTable;
