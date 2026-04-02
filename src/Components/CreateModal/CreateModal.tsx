import { Alert, Button, Checkbox, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core';
import React, { useEffect } from 'react';
import { ThIcon } from '@patternfly/react-icons';
import { useAddNotification } from '../../state/notificationsAtom';
import { useCreateBlankDashboard } from '../../hooks/useCreateBlankDashboard';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateModal: React.FunctionComponent<CreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { name, setName, setAsHomepage, setSetAsHomepage, isLoading, error, isFormValid, createDashboard, reset } = useCreateBlankDashboard();
  const addNotification = useAddNotification();

  const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setName(value);
  };

  const handleHomepageChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setSetAsHomepage(checked);
  };

  const handleSubmit = async () => {
    const result = await createDashboard();
    if (result) {
      addNotification({
        variant: 'success',
        title: `Dashboard '${name}' created successfully`,
      });
      onSuccess?.();
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="CreateBlankDashboardModal"
      variant="small"
      aria-labelledby="create-blank-modal-title"
      aria-describedby="modal-box-body-create-blank"
    >
      <ModalHeader title="Create new blank dashboard" titleIconVariant={ThIcon} labelId="create-blank-modal-title" />
      <ModalBody id="modal-box-body-create-blank">
        {error && (
          <Alert variant="danger" title="Creation failed" isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label="New dashboard name" isRequired>
            <TextInput
              value={name}
              isRequired
              validated={isFormValid ? 'success' : 'default'}
              type="text"
              id="blank-dashboard-name"
              name="blank-dashboard-name"
              placeholder="from-scratch dashboard"
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
          spinnerAriaLabel="Creating dashboard"
        >
          {isLoading ? 'Creating...' : 'Create dashboard'}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
