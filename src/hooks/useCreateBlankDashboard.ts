import { useState } from 'react';
import { DashboardTemplate, DashboardTemplatesError, TemplateConfig, importDashboardTemplate, setDefaultTemplate } from '../api/dashboard-templates';

interface CreateBlankDashboardState {
  name: string;
  setAsHomepage: boolean;
  isLoading: boolean;
  error: string | null;
}

const initState: CreateBlankDashboardState = {
  name: '',
  setAsHomepage: false,
  isLoading: false,
  error: null,
};

const blankTemplateConfig: TemplateConfig = {
  sm: [],
  md: [],
  lg: [],
  xl: [],
};

type UseCreateBlankDashboardReturn = CreateBlankDashboardState & {
  setName: (value: string) => void;
  setSetAsHomepage: (value: boolean) => void;
  isFormValid: boolean;
  createDashboard: () => Promise<DashboardTemplate | null>;
  reset: () => void;
};

export const useCreateBlankDashboard = (): UseCreateBlankDashboardReturn => {
  const [state, setState] = useState<CreateBlankDashboardState>(initState);

  const isFormValid = state.name.trim() !== '';

  const reset = () => setState(initState);

  const setName = (value: string) => setState((prev) => ({ ...prev, name: value }));

  const setSetAsHomepage = (value: boolean) => setState((prev) => ({ ...prev, setAsHomepage: value }));

  const createDashboard = async (): Promise<DashboardTemplate | null> => {
    if (!isFormValid) {
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await importDashboardTemplate({
        dashboardName: state.name,
        templateBase: {
          name: 'landingPage',
          displayName: 'Landing Page',
        },
        templateConfig: blankTemplateConfig,
      });

      if (state.setAsHomepage) {
        await setDefaultTemplate(result.id);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
      return result;
    } catch (err) {
      let errorMessage: string;
      if (err instanceof DashboardTemplatesError && err.status >= 500) {
        errorMessage = 'The server is currently unavailable. Please try again later.';
      } else if (err instanceof DashboardTemplatesError) {
        errorMessage = 'Failed to create dashboard. Please try again.';
      } else if (err instanceof TypeError) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  };

  return {
    ...state,
    setName,
    setSetAsHomepage,
    isFormValid,
    createDashboard,
    reset,
  };
};

export default useCreateBlankDashboard;
