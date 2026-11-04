import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DashboardTemplate } from '../api/dashboard-templates';
import { useSetAtom } from 'jotai';
import { importDashboardAtom } from '../state/dashboardsAtom';
import { dashboardMutationErrors } from './messages/dashboardMutationErrors';

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

const messages = defineMessages({
  invalidJson: {
    id: 'widgetLayout.hooks.invalidJson',
    description: 'Invalid configuration string error',
    defaultMessage: 'Invalid JSON format. Please check your configuration string.',
  },
  importFailed: {
    id: 'widgetLayout.hooks.importFailed',
    description: 'Dashboard import failure error',
    defaultMessage: 'Failed to import dashboard. Please try again.',
  },
});

export const useImportDashboard = (): UseImportDashboardReturn => {
  const intl = useIntl();
  const [state, setState] = useState<ImportDashboardState>(initState);
  const create = useSetAtom(importDashboardAtom);

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

      const result = await create(requestData);

      setState((prev) => ({ ...prev, isLoading: false }));
      return result;
    } catch (err) {
      if (err instanceof SyntaxError) {
        setState((prev) => ({ ...prev, error: intl.formatMessage(messages.invalidJson), isLoading: false }));
      } else if (err instanceof Error) {
        setState((prev) => ({ ...prev, error: err.message || intl.formatMessage(messages.importFailed), isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, error: intl.formatMessage(dashboardMutationErrors.unexpectedError), isLoading: false }));
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
