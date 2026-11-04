import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { DashboardTemplate, DashboardTemplatesError } from '../api/dashboard-templates';
import { useSetAtom } from 'jotai';
import { duplicateDashboardAtom } from '../state/dashboardsAtom';
import { dashboardMutationErrors } from './messages/dashboardMutationErrors';

interface DuplicateDashboardState {
  name: string;
  selectedDashboardId: number | null;
  setAsHomepage: boolean;
  isLoading: boolean;
  error: string | null;
}

const initState: DuplicateDashboardState = {
  name: '',
  selectedDashboardId: null,
  setAsHomepage: false,
  isLoading: false,
  error: null,
};

type UseDuplicateDashboardReturn = DuplicateDashboardState & {
  setName: (value: string) => void;
  setSelectedDashboardId: (value: number | null) => void;
  setSetAsHomepage: (value: boolean) => void;
  isFormValid: boolean;
  duplicateDashboard: () => Promise<DashboardTemplate | null>;
  reset: () => void;
};

const messages = defineMessages({
  duplicateFailed: {
    id: 'widgetLayout.hooks.duplicateFailed',
    description: 'Dashboard duplication failure error',
    defaultMessage: 'Failed to duplicate dashboard. Please try again.',
  },
});

export const useDuplicateDashboard = (): UseDuplicateDashboardReturn => {
  const intl = useIntl();
  const [state, setState] = useState<DuplicateDashboardState>(initState);
  const create = useSetAtom(duplicateDashboardAtom);

  const isFormValid = state.name.trim() !== '' && state.selectedDashboardId !== null;

  const reset = () => setState(initState);

  const setName = (value: string) => setState((prev) => ({ ...prev, name: value }));

  const setSelectedDashboardId = (value: number | null) => setState((prev) => ({ ...prev, selectedDashboardId: value }));

  const setSetAsHomepage = (value: boolean) => setState((prev) => ({ ...prev, setAsHomepage: value }));

  const duplicateDashboard = async (): Promise<DashboardTemplate | null> => {
    if (!isFormValid || state.selectedDashboardId === null) {
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const newDashboard = await create({ id: state.selectedDashboardId, dashboardName: state.name, setAsHomepage: state.setAsHomepage });

      setState((prev) => ({ ...prev, isLoading: false }));
      return newDashboard;
    } catch (err) {
      let errorMessage: string;
      if (err instanceof DashboardTemplatesError && err.status >= 500) {
        errorMessage = intl.formatMessage(dashboardMutationErrors.serverUnavailable);
      } else if (err instanceof DashboardTemplatesError) {
        errorMessage = intl.formatMessage(messages.duplicateFailed);
      } else if (err instanceof TypeError) {
        errorMessage = intl.formatMessage(dashboardMutationErrors.networkError);
      } else {
        errorMessage = intl.formatMessage(dashboardMutationErrors.unexpectedError);
      }
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  };

  return {
    ...state,
    setName,
    setSelectedDashboardId,
    setSetAsHomepage,
    isFormValid,
    duplicateDashboard,
    reset,
  };
};

export default useDuplicateDashboard;
