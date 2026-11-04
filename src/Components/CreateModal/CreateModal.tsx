import { Alert, Button, Checkbox, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { ThIcon } from '@patternfly/react-icons';
import { useAddNotification } from '../../state/notificationsAtom';
import { useCreateBlankDashboard } from '../../hooks/useCreateBlankDashboard';

const messages = defineMessages({
  title: {
    id: 'widgetLayout.createModal.title',
    description: 'Create blank dashboard modal title',
    defaultMessage: 'Create new blank dashboard',
  },
  creationFailed: {
    id: 'widgetLayout.createModal.creationFailed',
    description: 'Create blank dashboard error alert title',
    defaultMessage: 'Creation failed',
  },
  namePlaceholder: {
    id: 'widgetLayout.createModal.namePlaceholder',
    description: 'New dashboard name field placeholder',
    defaultMessage: 'from-scratch dashboard',
  },
  nameLabel: {
    id: 'widgetLayout.createModal.nameLabel',
    description: 'New dashboard name field label',
    defaultMessage: 'New dashboard name',
  },
  setAsHomepage: {
    id: 'widgetLayout.createModal.setAsHomepage',
    description: 'Set as homepage checkbox label',
    defaultMessage: 'Set as homepage',
  },
  creatingAria: {
    id: 'widgetLayout.createModal.creatingAria',
    description: 'Creating dashboard spinner aria label',
    defaultMessage: 'Creating dashboard',
  },
  creating: {
    id: 'widgetLayout.createModal.creating',
    description: 'Creating in-progress button label',
    defaultMessage: 'Creating...',
  },
  create: {
    id: 'widgetLayout.createModal.create',
    description: 'Create dashboard button label',
    defaultMessage: 'Create dashboard',
  },
  cancel: {
    id: 'widgetLayout.createModal.cancel',
    description: 'Cancel button label',
    defaultMessage: 'Cancel',
  },
  createdNotification: {
    id: 'widgetLayout.createModal.createdNotification',
    description: 'Dashboard created success notification',
    defaultMessage: "Dashboard ''{name}'' created successfully",
  },
});

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  layoutType?: string;
}

export const CreateModal: React.FunctionComponent<CreateModalProps> = ({ isOpen, onClose, onSuccess, layoutType }) => {
  const intl = useIntl();
  const { name, setName, setAsHomepage, setSetAsHomepage, isLoading, error, isFormValid, createDashboard, reset } =
    useCreateBlankDashboard(layoutType);
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
        title: intl.formatMessage(messages.createdNotification, { name }),
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
      <ModalHeader title={intl.formatMessage(messages.title)} titleIconVariant={ThIcon} labelId="create-blank-modal-title" />
      <ModalBody id="modal-box-body-create-blank">
        {error && (
          <Alert variant="danger" title={intl.formatMessage(messages.creationFailed)} isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label={intl.formatMessage(messages.nameLabel)} isRequired>
            <TextInput
              value={name}
              isRequired
              validated={isFormValid ? 'success' : 'default'}
              type="text"
              id="blank-dashboard-name"
              name="blank-dashboard-name"
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
          spinnerAriaLabel={intl.formatMessage(messages.creatingAria)}
        >
          {isLoading ? <FormattedMessage {...messages.creating} /> : <FormattedMessage {...messages.create} />}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          <FormattedMessage {...messages.cancel} />
        </Button>
      </ModalFooter>
    </Modal>
  );
};
