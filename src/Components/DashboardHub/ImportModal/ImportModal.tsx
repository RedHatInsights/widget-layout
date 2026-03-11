import { Alert, Button, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core';
import React, { useEffect, useState } from 'react';
import { CodeEditorImport } from '../CodeEditor/CodeEditor';
import { useImportDashboard } from '../../../hooks/useImportDashboard';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportModal: React.FunctionComponent<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [configString, setConfigString] = useState('');
  const [name, setName] = useState('');
  const { importDashboard, isLoading, error, reset } = useImportDashboard();
  const isFormValid = configString.trim() !== '' && name.trim() !== '';

  const handleConfigChange = (value: string) => {
    setConfigString(value);
  };

  const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, name: string) => {
    setName(name);
  };

  const handleSubmit = async () => {
    const result = await importDashboard(configString, name);
    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  // Clean up on close
  useEffect(() => {
    if (!isOpen) {
      setConfigString('');
      setName('');
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
      <ModalHeader
        title="Import configuration string"
        labelId="import-modal-title"
        description="Copy/paste a config string from any other Hybrid Cloud Console dashboard (ie. a string shared with you from another person in your
        organization) to have that dashboard recreated in your account. Learn about using config strings."
      />
      <ModalBody id="modal-box-body-import">
        {error && (
          <Alert variant="danger" title="Import failed" isInline className="pf-v6-u-mb-md">
            {error}
          </Alert>
        )}
        <Form>
          <FormGroup label="Paste configuration string" isRequired>
            <CodeEditorImport value={configString} onChange={handleConfigChange} />
          </FormGroup>

          <FormGroup label="New dashboard name" isRequired>
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
          spinnerAriaLabel="Importing dashboard"
        >
          {isLoading ? 'Importing...' : 'Create dashboard'}
        </Button>
        <Button key="cancel" variant="link" onClick={onClose} isDisabled={isLoading}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
