import { Alert, Button, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from '@patternfly/react-core';
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
  const { importDashboard, isLoading, error, data, reset } = useImportDashboard();

  const handleConfigChange = (value: string) => {
    setConfigString(value);
  };

  const handleSubmit = async () => {
    await importDashboard(configString);
  };

  // Handle successful import
  useEffect(() => {
    if (data) {
      // Close modal and notify parent
      onClose();
      onSuccess?.();
      // Reset form for next use
      setConfigString('');
      reset();
    }
  }, [data, onClose, onSuccess, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setConfigString('');
      reset();
    }
  }, [isOpen, reset]);

  const isFormValid = configString.trim() !== '';

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
        <FormGroup label="Paste configuration string" isRequired>
          <CodeEditorImport onChange={handleConfigChange} />
        </FormGroup>
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
