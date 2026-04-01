import { Alert, Button, Checkbox, Form, FormGroup, Modal, ModalBody, ModalFooter, ModalHeader, TextInput } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';
import { DashboardTemplatesError, TemplateConfig, importDashboardTemplate, setDefaultTemplate } from '../../api/dashboard-templates';
import { ThIcon } from '@patternfly/react-icons';
import { useAddNotification } from '../../state/notificationsAtom';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const blankTemplateConfig: TemplateConfig = {
  sm: [],
  md: [],
  lg: [],
  xl: [],
};

export const CreateModal: React.FunctionComponent<CreateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [setAsHomepage, setSetAsHomepage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addNotification = useAddNotification();

  const isFormValid = name.trim() !== '';

  const reset = useCallback(() => {
    setName('');
    setSetAsHomepage(false);
    setIsLoading(false);
    setError(null);
  }, []);

  const handleNameChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setName(value);
  };

  const handleHomepageChange = (_event: React.FormEvent<HTMLInputElement>, checked: boolean) => {
    setSetAsHomepage(checked);
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importDashboardTemplate({
        dashboardName: name,
        templateBase: {
          name: 'landingPage',
          displayName: 'Landing Page',
        },
        templateConfig: blankTemplateConfig,
      });

      if (setAsHomepage) {
        await setDefaultTemplate(result.id);
      }

      addNotification({
        variant: 'success',
        title: `Dashboard '${name}' created successfully`,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      let errorMessage: string;
      if (err instanceof DashboardTemplatesError && err.status >= 500) {
        errorMessage = 'The server is currently unavailable. Please try again later.';
      } else if (err instanceof DashboardTemplatesError) {
        errorMessage = 'Failed to create dashboard. Please try again.';
      } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

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
              validated={name.trim() !== '' ? 'success' : 'default'}
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
