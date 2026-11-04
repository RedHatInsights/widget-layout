import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DashboardTemplate } from '../api/dashboard-templates';
import { useSetAtom } from 'jotai';
import { deleteDashboardAtom } from '../state/dashboardsAtom';

const messages = defineMessages({
  deleteFailed: {
    id: 'widgetLayout.hooks.deleteFailed',
    description: 'Dashboard deletion failure error fallback',
    defaultMessage: 'Failed to delete dashboard',
  },
});

export const useDeleteDashboard = () => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deleteDashboardFromAtom = useSetAtom(deleteDashboardAtom);

  const deleteDashboard = async (id: DashboardTemplate['id']): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await deleteDashboardFromAtom(id);
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : intl.formatMessage(messages.deleteFailed);
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  return {
    deleteDashboard,
    isLoading,
    error,
  };
};

export default useDeleteDashboard;
