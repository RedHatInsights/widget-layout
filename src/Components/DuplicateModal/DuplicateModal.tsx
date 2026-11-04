import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from '@patternfly/react-core';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { CopyIcon } from '@patternfly/react-icons';
import { useAddNotification } from '../../state/notificationsAtom';
import { useDuplicateDashboard } from '../../hooks/useDuplicateDashboard';
import { useAtomValue } from 'jotai';
import { dashboardsAtom } from '../../state/dashboardsAtom';

const messages = defineMessages({
  title: {
    id: 'widgetLayout.duplicateModal.title',
    description: 'Duplicate dashboard modal title',
    defaultMessage: 'Duplicate existing dashboard',
  },
  duplicationFailed: {
    id: 'widgetLayout.duplicateModal.duplicationFailed',
    description: 'Duplication error alert title',
    defaultMessage: 'Duplication failed',
  },
  selectLabel: {
    id: 'widgetLayout.duplicateModal.selectLabel',
    description: 'Select dashboard for duplication field label',
    defaultMessage: 'Select existing dashboard for duplication',
  },
  selectAria: {
    id: 'widgetLayout.duplicateModal.selectAria',
    description: 'Dashboard select aria label',
    defaultMessage: 'Select a dashboard',
  },
  selectPlaceholder: {
    id: 'widgetLayout.duplicateModal.selectPlaceholder',
    description: 'Dashboard select placeholder option',
    defaultMessage: 'Select a dashboard',
  },
  namePlaceholder: {
    id: 'widgetLayout.duplicateModal.namePlaceholder',
    description: 'New dashboard name field placeholder',
    defaultMessage: 'duplicate dashboard',
  },
  nameLabel: {
    id: 'widgetLayout.duplicateModal.nameLabel',
    description: 'New dashboard name field label',
    defaultMessage: 'New dashboard name',
  },
  setAsHomepage: {
    id: 'widgetLayout.duplicateModal.setAsHomepage',
    description: 'Set as homepage checkbox label',
    defaultMessage: 'Set as homepage',
  },
  duplicatingAria: {
    id: 'widgetLayout.duplicateModal.duplicatingAria',
    description: 'Duplicating dashboard spinner aria label',
    defaultMessage: 'Duplicating dashboard',
  },
  duplicating: {
    id: 'widgetLayout.duplicateModal.duplicating',
    description: 'Duplicating in-progress button label',
    defaultMessage: 'Duplicating...',
  },
  duplicate: {
    id: 'widgetLayout.duplicateModal.duplicate',
    description: 'Duplicate dashboard button label',
    defaultMessage: 'Duplicate dashboard',
  },
  cancel: {
    id: 'widgetLayout.duplicateModal.cancel',
    description: 'Cancel button label',
    defaultMessage: 'Cancel',
  },
  duplicatedNotification: {
    id: 'widgetLayout.duplicateModal.duplicatedNotification',
    description: 'Dashboard duplicated success notification',
    defaultMessage: "Dashboard ''{name}'' duplicated successfully",
  },
});

interface DuplicateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedDashboardId?: number | null;
}

export const DuplicateModal: React.FunctionComponent<DuplicateModalProps> = ({ isOpen, onClose, onSuccess, preselectedDashboardId }) => {
  const dashboards = useAtomValue(dashboardsAtom);
  const {
    name,
    setName,
    selectedDashboardId,
    setSelectedDashboardId,
    setAsHomepage,
    setSetAsHomepage,
    isLoading,
    error,
    isFormValid,
    duplicateDashboard,
    reset,
  } = useDuplicateDashboard();
  const intl = useIntl();
  const addNotification = useAddNotification();

  const handleDashboardChange = (_event: React.FormEvent<HTMLSelectElement>, value: string) => {
    setSelectedDashboardId(value ? Number(value) : null);
  };

  const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setName(value);
  };

  const handleHomepageChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setSetAsHomepage(checked);
  };

  const handleSubmit = async () => {
    const result = await duplicateDashboard();
    if (result) {
      addNotification({
        variant: 'success',
        title: intl.formatMessage(messages.duplicatedNotification, { name }),
      });
      onSuccess?.();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && preselectedDashboardId != null) {
      setSelectedDashboardId(preselectedDashboardId);
    }
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="DuplicateDashboardModal"
      variant="small"
      aria-labelledby="duplicate-modal-title"
      aria-describedby="modal-box-body-duplicate"
    >
      <ModalHeader title={intl.formatMessage(messages.title)} titleIconVariant={CopyIcon} labelId="duplicate-modal-title" />
      <ModalBody id="modal-box-body-duplicate">
        {error && (
          <Alert variant="danger" title={intl.formatMessage(messages.duplicationFailed)} isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label={intl.formatMessage(messages.selectLabel)} isRequired>
            <FormSelect value={selectedDashboardId ?? ''} onChange={handleDashboardChange} aria-label={intl.formatMessage(messages.selectAria)}>
              <FormSelectOption value="" label={intl.formatMessage(messages.selectPlaceholder)} isPlaceholder />
              {dashboards.map((dashboard) => (
                <FormSelectOption key={dashboard.id} value={dashboard.id} label={dashboard.dashboardName} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label={intl.formatMessage(messages.nameLabel)} isRequired>
            <TextInput
              value={name}
              isRequired
              validated={isFormValid ? 'success' : 'default'}
              type="text"
              id="duplicate-dashboard-name"
              name="duplicate-dashboard-name"
              placeholder={intl.formatMessage(messages.namePlaceholder)}
              onChange={handleNameChange}
            />
          </FormGroup>
          <FormGroup>
            <Checkbox
              label={intl.formatMessage(messages.setAsHomepage)}
              id="set-as-homepage"
              isChecked={setAsHomepage}
              onChange={handleHomepageChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          key="confirm"
          variant="primary"
          onClick={handleSubmit}
          isDisabled={!isFormValid || isLoading}
          isLoading={isLoading}
          spinnerAriaLabel={intl.formatMessage(messages.duplicatingAria)}
        >
          {isLoading ? <FormattedMessage {...messages.duplicating} /> : <FormattedMessage {...messages.duplicate} />}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          <FormattedMessage {...messages.cancel} />
        </Button>
      </ModalFooter>
    </Modal>
  );
};
