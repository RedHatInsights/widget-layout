import { useState } from 'react';
import { importDashboardTemplate } from '../api/dashboard-templates';
import { DashboardTemplate } from '../api/dashboard-templates';

interface UseImportDashboardReturn {
  importDashboard: (configString: string, dashboardName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  data: DashboardTemplate | null;
  reset: () => void;
}

export const useImportDashboard = (): UseImportDashboardReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardTemplate | null>(null);

  const reset = () => {
    setError(null);
    setData(null);
    setIsLoading(false);
  };

  const importDashboard = async (configString: string, dashboardName: string) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Parse the JSON config string
      const parsedConfig = JSON.parse(configString);

      // Combine dashboardName with parsed config
      const requestData = {
        dashboardName,
        ...parsedConfig,
      };

      const result = await importDashboardTemplate(requestData);

      // Success
      setData(result);
      setIsLoading(false);
    } catch (err) {
      // Handle different types of errors
      if (err instanceof SyntaxError) {
        setError('Invalid JSON format. Please check your configuration string.');
      } else if (err instanceof Error) {
        setError(err.message || 'Failed to import dashboard. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsLoading(false);
    }
  };

  return {
    importDashboard,
    isLoading,
    error,
    data,
    reset,
  };
};

export default useImportDashboard;
