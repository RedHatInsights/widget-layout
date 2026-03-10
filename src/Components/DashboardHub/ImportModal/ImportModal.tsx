import { Button, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core';
import React, { useState } from 'react';
import { CodeEditorImport } from '../CodeEditor/CodeEditor';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FunctionComponent<ImportModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [configString, setConfigString] = useState('');

  const handleNameChange = (_event: any, name: string) => {
    setName(name);
  };

  const handleConfigChange = (value: string) => {
    setConfigString(value);
  };

  const isFormValid = name.trim() !== '' && configString.trim() !== '';

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
        <FormGroup label="Paste configuration string" isRequired>
          <CodeEditorImport onChange={handleConfigChange} />
        </FormGroup>

        <FormGroup label="New dashboard name" isRequired fieldId="dashboard-name">
          <TextInput isRequired type="text" id="dashboard-name" name="dashboard-name" value={name} onChange={handleNameChange} />
        </FormGroup>
      </ModalBody>
      <ModalFooter>
        <Button key="confirm" variant="primary" onClick={onClose} isDisabled={!isFormValid}>
          Create dashboard
        </Button>
        <Button key="cancel" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};
