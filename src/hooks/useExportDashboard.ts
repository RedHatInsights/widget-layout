import { useState } from 'react';
import { ExportDashboardTemplate } from '../api/dashboard-templates';
import { useApi } from './useApi';

export const useExportDashboard = () => {
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to export dashboard';
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
