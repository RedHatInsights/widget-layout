import { Alert, Button, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core';
import React, { useEffect } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { CodeEditorImport } from '../CodeEditor/CodeEditor';
import { useAddNotification } from '../../../state/notificationsAtom';
import { useImportDashboard } from '../../../hooks/useImportDashboard';

const messages = defineMessages({
  title: {
    id: 'widgetLayout.importModal.title',
    description: 'Import config string modal title',
    defaultMessage: 'Import configuration string',
  },
  description: {
    id: 'widgetLayout.importModal.description',
    description: 'Import config string modal description',
    defaultMessage:
      'Copy/paste a config string from any other Hybrid Cloud Console dashboard (ie. a string shared with you from another person in your organization) to have that dashboard recreated in your account. Learn about using config strings.',
  },
  importFailed: {
    id: 'widgetLayout.importModal.importFailed',
    description: 'Import error alert title',
    defaultMessage: 'Import failed',
  },
  pasteLabel: {
    id: 'widgetLayout.importModal.pasteLabel',
    description: 'Paste configuration string field label',
    defaultMessage: 'Paste configuration string',
  },
  nameLabel: {
    id: 'widgetLayout.importModal.nameLabel',
    description: 'New dashboard name field label',
    defaultMessage: 'New dashboard name',
  },
  importingAria: {
    id: 'widgetLayout.importModal.importingAria',
    description: 'Importing dashboard spinner aria label',
    defaultMessage: 'Importing dashboard',
  },
  importing: {
    id: 'widgetLayout.importModal.importing',
    description: 'Importing in-progress button label',
    defaultMessage: 'Importing...',
  },
  create: {
    id: 'widgetLayout.importModal.create',
    description: 'Create dashboard button label',
    defaultMessage: 'Create dashboard',
  },
  cancel: {
    id: 'widgetLayout.importModal.cancel',
    description: 'Cancel button label',
    defaultMessage: 'Cancel',
  },
  importedNotification: {
    id: 'widgetLayout.importModal.importedNotification',
    description: 'Dashboard imported success notification',
    defaultMessage: "Dashboard ''{name}'' imported successfully",
  },
});

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportModal: React.FunctionComponent<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const intl = useIntl();
  const { configString, setConfigString, name, setName, isFormValid, importDashboard, isLoading, error, reset } = useImportDashboard();
  const addNotification = useAddNotification();

  const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, name: string) => {
    setName(name);
  };

  const handleSubmit = async () => {
    const result = await importDashboard();
    if (result) {
      addNotification({
        variant: 'success',
        title: intl.formatMessage(messages.importedNotification, { name }),
      });
      onSuccess?.();
      onClose();
    }
  };

  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ouiaId="ImportModal"
      variant="small"
      aria-labelledby="import-modal-title"
      aria-describedby="modal-box-body-import"
    >
      <ModalHeader title={intl.formatMessage(messages.title)} labelId="import-modal-title" description={intl.formatMessage(messages.description)} />
      <ModalBody id="modal-box-body-import">
        {error && (
          <Alert variant="danger" title={intl.formatMessage(messages.importFailed)} isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label={intl.formatMessage(messages.pasteLabel)} isRequired>
            <CodeEditorImport value={configString} onChange={setConfigString} />
          </FormGroup>

          <FormGroup label={intl.formatMessage(messages.nameLabel)} isRequired>
            <TextInput value={name} isRequired type="text" id="dashboard-name" name="dashboard-name" onChange={handleNameChange} />
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
          spinnerAriaLabel={intl.formatMessage(messages.importingAria)}
        >
          {isLoading ? <FormattedMessage {...messages.importing} /> : <FormattedMessage {...messages.create} />}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          <FormattedMessage {...messages.cancel} />
        </Button>
      </ModalFooter>
    </Modal>
  );
};
