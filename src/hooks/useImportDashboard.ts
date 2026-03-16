import { useState } from 'react';
import { importDashboardTemplate } from '../api/dashboard-templates';
import { DashboardTemplate } from '../api/dashboard-templates';

interface ImportDashboardState {
  configString: string;
  name: string;
  isLoading: boolean;
  error: string | null;
}

const initState: ImportDashboardState = {
  configString: '',
  name: '',
  isLoading: false,
  error: null,
};

type UseImportDashboardReturn = ImportDashboardState & {
  setConfigString: (value: string) => void;
  setName: (value: string) => void;
  isFormValid: boolean;
  importDashboard: () => Promise<DashboardTemplate | null>;
  reset: () => void;
};

export const useImportDashboard = (): UseImportDashboardReturn => {
  const [state, setState] = useState<ImportDashboardState>(initState);

  const isFormValid = state.configString.trim() !== '' && state.name.trim() !== '';

  const reset = () => setState(initState);

  const setConfigString = (value: string) => setState((prev) => ({ ...prev, configString: value }));

  const setName = (value: string) => setState((prev) => ({ ...prev, name: value }));

  const importDashboard = async (): Promise<DashboardTemplate | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const parsedConfig = JSON.parse(state.configString);
      const requestData = {
        ...parsedConfig,
        dashboardName: state.name,
      };

      const result = await importDashboardTemplate(requestData);

      setState((prev) => ({ ...prev, isLoading: false }));
      return result;
    } catch (err) {
      if (err instanceof SyntaxError) {
        setState((prev) => ({ ...prev, error: 'Invalid JSON format. Please check your configuration string.', isLoading: false }));
      } else if (err instanceof Error) {
        setState((prev) => ({ ...prev, error: err.message || 'Failed to import dashboard. Please try again.', isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, error: 'An unexpected error occurred. Please try again.', isLoading: false }));
      }
      return null;
    }
  };

  return {
    ...state,
    setConfigString,
    setName,
    isFormValid,
    importDashboard,
    reset,
  };
};

export default useImportDashboard;
