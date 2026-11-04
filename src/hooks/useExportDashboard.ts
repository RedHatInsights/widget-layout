import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { ExportDashboardTemplate } from '../api/dashboard-templates';
import { useApi } from './useApi';

const messages = defineMessages({
  exportFailed: {
    id: 'widgetLayout.hooks.exportFailed',
    description: 'Dashboard export failure error fallback',
    defaultMessage: 'Failed to export dashboard',
  },
});

export const useExportDashboard = () => {
  const intl = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();

  const exportDashboard = async (id: number): Promise<ExportDashboardTemplate | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.exportDashboardTemplate(id);
      setIsLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : intl.formatMessage(messages.exportFailed);
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  };

  return {
    exportDashboard,
    isLoading,
    error,
  };
};

export default useExportDashboard;
