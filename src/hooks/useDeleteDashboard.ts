import { useState } from 'react';
import { DashboardTemplate } from '../api/dashboard-templates';
import { useSetAtom } from 'jotai';
import { deleteDashboardAtom } from '../state/dashboardsAtom';

export const useDeleteDashboard = () => {
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
