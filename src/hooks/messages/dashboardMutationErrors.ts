import { defineMessages } from 'react-intl';

/**
 * Error strings surfaced in the create/import/duplicate modals. The hooks
 * format them at the set-site so the modal state carries localized text.
 */
export const dashboardMutationErrors = defineMessages({
  serverUnavailable: {
    id: 'widgetLayout.hooks.serverUnavailable',
    description: 'Server unavailable error',
    defaultMessage: 'The server is currently unavailable. Please try again later.',
  },
  networkError: {
    id: 'widgetLayout.hooks.networkError',
    description: 'Network error',
    defaultMessage: 'Network error. Please check your connection and try again.',
  },
  unexpectedError: {
    id: 'widgetLayout.hooks.unexpectedError',
    description: 'Unexpected error fallback',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
});
