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
import { CopyIcon } from '@patternfly/react-icons';
import { useAddNotification } from '../../state/notificationsAtom';
import { useDuplicateDashboard } from '../../hooks/useDuplicateDashboard';
import { useAtomValue } from 'jotai';
import { dashboardsAtom } from '../../state/dashboardsAtom';

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
        title: `Dashboard '${name}' duplicated successfully`,
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
      <ModalHeader title="Duplicate existing dashboard" titleIconVariant={CopyIcon} labelId="duplicate-modal-title" />
      <ModalBody id="modal-box-body-duplicate">
        {error && (
          <Alert variant="danger" title="Duplication failed" isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label="Select existing dashboard for duplication" isRequired>
            <FormSelect value={selectedDashboardId ?? ''} onChange={handleDashboardChange} aria-label="Select a dashboard">
              <FormSelectOption value="" label="Select a dashboard" isPlaceholder />
              {dashboards.map((dashboard) => (
                <FormSelectOption key={dashboard.id} value={dashboard.id} label={dashboard.dashboardName} />
              ))}
            </FormSelect>
          </FormGroup>
          <FormGroup label="New dashboard name" isRequired>
            <TextInput
              value={name}
              isRequired
              validated={isFormValid ? 'success' : 'default'}
              type="text"
              id="duplicate-dashboard-name"
              name="duplicate-dashboard-name"
              placeholder="duplicate dashboard"
              onChange={handleNameChange}
            />
          </FormGroup>
          <FormGroup>
            <Checkbox label="Set as homepage" id="set-as-homepage" isChecked={setAsHomepage} onChange={handleHomepageChange} />
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
          spinnerAriaLabel="Duplicating dashboard"
        >
          {isLoading ? 'Duplicating...' : 'Duplicate dashboard'}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
