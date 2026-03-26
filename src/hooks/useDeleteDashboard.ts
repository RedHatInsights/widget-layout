import { useState } from 'react';
import { DashboardTemplate, deleteDashboardTemplateFromHub } from '../api/dashboard-templates';

export const useDeleteDashboard = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDashboard = async (id: DashboardTemplate['id']): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteDashboardTemplateFromHub(id);
      setIsLoading(false);
      if (result) {
        onSuccess?.();
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete dashboard';
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
